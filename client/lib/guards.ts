import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { subscriptions, plans } from "@/lib/db/schema";
import { and, eq, gt } from "drizzle-orm";
import type { PlanFeatures } from "@autobazaar/shared";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function getSessionUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) throw new ApiError(401, "Unauthorized");
  return user;
}

export async function requireDealer() {
  const user = await requireUser();
  if (user.role !== "dealer") throw new ApiError(403, "Dealer access required");
  return user;
}

// Guard ensuring the user is signed in with the "admin" role
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new ApiError(403, "Admin access required");
  return user;
}

export type ActiveSubscription = {
  subscriptionId: string;
  planId: string;
  planName: string;
  slug: string;
  listingLimit: number;
  boostsPerMonth: number;
  features: PlanFeatures;
};

export async function getActiveSubscription(
  dealerId: string
): Promise<ActiveSubscription | null> {
  const rows = await db
    .select({
      subscriptionId: subscriptions.id,
      planId: plans.id,
      planName: plans.name,
      slug: plans.slug,
      listingLimit: plans.listingLimit,
      boostsPerMonth: plans.boostsPerMonth,
      features: plans.features,
    })
    .from(subscriptions)
    .innerJoin(plans, eq(subscriptions.plan, plans.id))
    .where(
      and(
        eq(subscriptions.dealer, dealerId),
        eq(subscriptions.status, "active"),
        gt(subscriptions.endDate, new Date())
      )
    )
    .limit(1);

  return rows[0] ?? null;
}

export async function requireActiveSubscription(): Promise<{
  user: Awaited<ReturnType<typeof requireDealer>>;
  subscription: ActiveSubscription;
}> {
  const user = await requireDealer();
  const subscription = await getActiveSubscription(user.id);
  if (!subscription)
    throw new ApiError(403, "Active subscription required");
  return { user, subscription };
}

type ZodIssueLike = { path?: unknown[]; message?: string };

/** A short, user-safe message when `err` is caused by invalid input, else null. */
function describeBadInput(err: unknown): string | null {
  if (!(err instanceof Error)) return null;

  const issues = (err as { issues?: ZodIssueLike[] }).issues;
  if (err.name === "ZodError" && Array.isArray(issues)) {
    const first = issues[0];
    const field = first?.path?.length ? `${first.path.join(".")}: ` : "";
    return `Invalid input — ${field}${first?.message ?? "check the values you sent"}`;
  }

  if (err instanceof SyntaxError && /JSON/i.test(err.message)) {
    return "Request body is not valid JSON";
  }
  return null;
}

export function apiHandler<T>(fn: () => Promise<T>): Promise<Response> {
  return fn()
    .then((data) => {
      if (data instanceof Response) return data;
      return Response.json(data ?? { success: true });
    })
    .catch((err: unknown) => {
      if (err instanceof ApiError) {
        return Response.json({ error: err.message }, { status: err.status });
      }
      // Bad client input is a 400, not a server fault. Zod errors come from
      // schema.parse(); SyntaxError comes from request.json() on a bad body.
      const validation = describeBadInput(err);
      if (validation) {
        return Response.json(
          { error: validation, message: validation },
          { status: 400 }
        );
      }
      console.error(err);
      return Response.json({ error: "Internal server error" }, { status: 500 });
    });
}
