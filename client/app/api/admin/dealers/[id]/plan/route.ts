import { and, desc, eq, gt, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { adminAuditLog, dealerProfiles, plans, subscriptions, user } from "@/lib/db/schema";
import { ApiError, apiHandler, requireAdmin } from "@/lib/guards";
import { auditInsert, auditWriteError } from "@/lib/audit";

const MAX_DAYS = 366;
const MAX_NOTE = 500;
/** A second plan change for the same dealer inside this window is refused (double click, two tabs). */
const COOLDOWN_MS = 15_000;

/**
 * POST /api/admin/dealers/[id]/plan
 *
 * WHAT: Gives a dealer a paid plan by hand ("grant") or ends the current one ("end").
 * WHY:  Online payments are switched off until a real Razorpay account exists
 *       (lib/flags.ts), so a dealer who pays another way (UPI to Edone Solutions) is
 *       given the plan here. Nothing is charged by this route.
 *
 * Body: { action: "grant", plan: "starter" | "pro", days?: number (default 30), note: string }
 *       { action: "end", note: string }
 * The note is required (what was paid, how, reference): it is the only record of the payment.
 *
 * The audit row and the subscription change go in ONE db.batch (a single HTTP transaction on
 * neon-http), so a plan is never given or ended without its record, a missing audit table
 * (migration 0005) fails the whole thing with a 503 and changes nothing, and a failed insert
 * cannot leave the dealer with their old plan cancelled and no new one.
 * Granting the SAME plan again extends it from its current end; a different plan replaces it.
 * `id` is the dealer PROFILE id, as in /verify.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;

    const action = body.action === "end" ? "end" : body.action === "grant" ? "grant" : null;
    if (!action) throw new ApiError(400, 'Action must be "grant" or "end"');

    const note = typeof body.note === "string" ? body.note.trim() : "";
    if (note.length < 5) {
      throw new ApiError(400, "Add a note: what was paid, how, and the reference (at least 5 characters).");
    }
    if (note.length > MAX_NOTE) throw new ApiError(400, `Keep the note under ${MAX_NOTE} characters.`);

    const [profile] = await db
      .select({ userId: dealerProfiles.user, businessName: dealerProfiles.businessName })
      .from(dealerProfiles)
      .where(eq(dealerProfiles.id, id))
      .limit(1);
    if (!profile) throw new ApiError(404, "Dealer not found");

    const [dealerUser] = await db
      .select({ id: user.id, role: user.role })
      .from(user)
      .where(eq(user.id, profile.userId))
      .limit(1);
    if (!dealerUser || dealerUser.role !== "dealer") {
      throw new ApiError(403, "Plans can only be given to dealer accounts");
    }

    const actor = { id: admin.id, email: admin.email };
    const name = profile.businessName || "a dealer";

    // Refuse a second change a moment after the first. Reading the log also surfaces a missing
    // table here, before anything is touched.
    try {
      const since = new Date(Date.now() - COOLDOWN_MS);
      const [recent] = await db
        .select({ id: adminAuditLog.id })
        .from(adminAuditLog)
        .where(
          and(
            eq(adminAuditLog.targetType, "dealer"),
            eq(adminAuditLog.targetId, id),
            inArray(adminAuditLog.action, ["plan.grant", "plan.end"]),
            gt(adminAuditLog.createdAt, since)
          )
        )
        .orderBy(desc(adminAuditLog.createdAt))
        .limit(1);
      if (recent) throw new ApiError(409, "A plan change for this dealer was just made. Wait a few seconds and check the plan.");
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw auditWriteError(err);
    }

    const active = await db
      .select({
        id: subscriptions.id,
        endDate: subscriptions.endDate,
        planId: subscriptions.plan,
        planName: plans.name,
        planSlug: plans.slug,
      })
      .from(subscriptions)
      .innerJoin(plans, eq(subscriptions.plan, plans.id))
      .where(
        and(
          eq(subscriptions.dealer, profile.userId),
          eq(subscriptions.status, "active"),
          gt(subscriptions.endDate, new Date())
        )
      )
      .orderBy(desc(subscriptions.endDate))
      .limit(1);
    const current = active[0] ?? null;

    if (action === "end") {
      if (!current) {
        return { ended: 0, message: "There was no active plan, so nothing changed." };
      }
      try {
        await db.batch([
          auditInsert(actor, {
            action: "plan.end",
            targetType: "dealer",
            targetId: id,
            summary: `Ended the ${current.planName} plan of ${name}`,
            note,
            metadata: { previousPlan: current.planSlug, previousEndDate: current.endDate },
          }),
          db
            .update(subscriptions)
            .set({ status: "cancelled", updatedAt: new Date() })
            .where(and(eq(subscriptions.dealer, profile.userId), eq(subscriptions.status, "active"))),
        ]);
      } catch (err) {
        console.error("Plan end failed:", err);
        throw auditWriteError(err);
      }
      return { ended: 1, message: "Plan ended. The dealer is on Free." };
    }

    const slug = typeof body.plan === "string" ? body.plan : "";
    const days = body.days === undefined ? 30 : typeof body.days === "number" ? body.days : NaN;
    if (!Number.isInteger(days) || days < 1 || days > MAX_DAYS) {
      throw new ApiError(400, `Days must be a whole number from 1 to ${MAX_DAYS}`);
    }

    const [plan] = await db.select().from(plans).where(eq(plans.slug, slug)).limit(1);
    if (!plan || !plan.isActive || plan.priceMonthly <= 0) {
      throw new ApiError(400, "Choose a paid plan (Starter or Pro)");
    }

    const now = new Date();
    const extending = current?.planId === plan.id;
    const startDate = now;
    const base = extending && current ? new Date(Math.max(now.getTime(), current.endDate.getTime())) : now;
    const endDate = new Date(base.getTime() + days * 86_400_000);

    try {
      const [, , inserted] = await db.batch([
        auditInsert(actor, {
          action: "plan.grant",
          targetType: "dealer",
          targetId: id,
          summary: `${extending ? "Extended" : "Gave"} ${plan.name} for ${days} days ${extending ? "for" : "to"} ${name}`,
          note,
          metadata: {
            plan: plan.slug,
            planId: plan.id,
            days,
            extended: extending,
            previousPlan: current?.planSlug ?? null,
            previousEndDate: current?.endDate ?? null,
            endDate,
          },
        }),
        // One active plan at a time, as in payments/verify.
        db
          .update(subscriptions)
          .set({ status: "cancelled", updatedAt: new Date() })
          .where(and(eq(subscriptions.dealer, profile.userId), eq(subscriptions.status, "active"))),
        db
          .insert(subscriptions)
          .values({ dealer: profile.userId, plan: plan.id, status: "active", startDate, endDate, payment: null })
          .returning(),
      ]);
      const subscription = inserted[0];
      return {
        subscription: { plan: plan.name, startDate: subscription.startDate, endDate: subscription.endDate },
        message: `${plan.name} ${extending ? "extended" : "given"} for ${days} days.`,
      };
    } catch (err) {
      console.error("Plan grant failed:", err);
      throw auditWriteError(err);
    }
  });
}
