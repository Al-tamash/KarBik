import crypto from "crypto";
import { and, eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { db } from "@/lib/db";
import { account, dealerProfiles, session, user } from "@/lib/db/schema";
import { ApiError, apiHandler, requireAdmin } from "@/lib/guards";

// No 0/O/1/l/I: the password is read out or typed from a message.
const ALPHABET = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";

function makeTemporaryPassword(length = 12): string {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[crypto.randomInt(ALPHABET.length)];
  return out;
}

/**
 * POST /api/admin/dealers/[id]/access
 *
 * WHAT: Creates (or resets) the email+password login of a dealer and returns a
 *       temporary password ONCE. The admin passes it to the dealer, who signs in
 *       and changes it under Settings → Password.
 * WHY:  Dealers that were onboarded by KarBik have a profile but no credential
 *       account, so they cannot open the dashboard to see forwarded leads. Email
 *       sending is not configured yet, so a reset-link flow is not available.
 *
 * `id` is the dealer PROFILE id (same as /verify). Existing sessions are revoked.
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    await requireAdmin();
    const { id } = await params;

    const [profile] = await db
      .select({ userId: dealerProfiles.user })
      .from(dealerProfiles)
      .where(eq(dealerProfiles.id, id))
      .limit(1);
    if (!profile) throw new ApiError(404, "Dealer not found");

    const [dealerUser] = await db
      .select({ id: user.id, email: user.email, role: user.role })
      .from(user)
      .where(eq(user.id, profile.userId))
      .limit(1);
    if (!dealerUser) throw new ApiError(404, "Dealer account not found");
    // Never reset the password of an admin or buyer account from this screen.
    if (dealerUser.role !== "dealer") {
      throw new ApiError(403, "Only dealer accounts can be reset here");
    }

    const temporaryPassword = makeTemporaryPassword();
    const passwordHash = await hashPassword(temporaryPassword);
    const now = new Date();

    const [existing] = await db
      .select({ id: account.id })
      .from(account)
      .where(and(eq(account.userId, dealerUser.id), eq(account.providerId, "credential")))
      .limit(1);

    if (existing) {
      await db
        .update(account)
        .set({ password: passwordHash, updatedAt: now })
        .where(eq(account.id, existing.id));
    } else {
      await db.insert(account).values({
        id: crypto.randomUUID(),
        accountId: dealerUser.id,
        providerId: "credential",
        userId: dealerUser.id,
        password: passwordHash,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Whoever held the old password is signed out.
    await db.delete(session).where(eq(session.userId, dealerUser.id));

    return Response.json(
      { email: dealerUser.email, temporaryPassword, created: !existing },
      { headers: { "Cache-Control": "no-store" } }
    );
  });
}
