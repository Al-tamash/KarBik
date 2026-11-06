import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import type { WebPushSubscription as WebPushSubPayload } from "@autobazaar/shared";
import { apiHandler, requireUser } from "@/lib/guards";
import { hasPushKeys, isTrustedPushEndpoint } from "@/lib/push-endpoint";

// POST /api/notifications/subscribe — save/update a web-push subscription
export async function POST(request: Request) {
  return apiHandler(async () => {
    const user = await requireUser();
    const body = (await request.json()) as {
      subscription?: WebPushSubPayload;
    };
    const subscription = body.subscription;
    const userId = user.id;

    if (!subscription || !subscription.endpoint) {
      return Response.json(
        { message: "Invalid subscription object" },
        { status: 400 }
      );
    }

    // Only real browser push-service endpoints: the server later POSTs to this
    // URL, so anything else would be an SSRF vector.
    if (!isTrustedPushEndpoint(subscription.endpoint) || !hasPushKeys(subscription)) {
      return Response.json(
        { message: "Unsupported push subscription" },
        { status: 400 }
      );
    }

    // Upsert on unique endpoint
    const [existing] = await db
      .select({ id: pushSubscriptions.id })
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, subscription.endpoint))
      .limit(1);

    if (existing) {
      await db
        .update(pushSubscriptions)
        .set({ userId, subscription })
        .where(eq(pushSubscriptions.id, existing.id));
    } else {
      await db
        .insert(pushSubscriptions)
        .values({ userId, endpoint: subscription.endpoint, subscription });
    }

    return Response.json(
      { message: "Subscription saved successfully" },
      { status: 201 }
    );
  });
}
