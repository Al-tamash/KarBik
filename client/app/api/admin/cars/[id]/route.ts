import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { cars, boosts } from "@/lib/db/schema";
import { apiHandler, requireAdmin, ApiError } from "@/lib/guards";

/**
 * PATCH /api/admin/cars/[id]
 * WHAT: Moderates car listing flags (isBoosted, rcVerified, isInspected).
 *
 * DELETE /api/admin/cars/[id]
 * WHAT: Deletes a car listing from the marketplace.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    await requireAdmin();

    const { id: carId } = await params;
    if (!carId) throw new ApiError(400, "Car ID is required");

    const [existing] = await db
      .select({ id: cars.id, dealer: cars.dealer })
      .from(cars)
      .where(eq(cars.id, carId))
      .limit(1);

    if (!existing) throw new ApiError(404, "Car not found");

    const body = (await request.json().catch(() => ({}))) as {
      isBoosted?: boolean;
      rcVerified?: boolean;
      isInspected?: boolean;
      approved?: boolean;
    };

    const updates: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (typeof body.rcVerified === "boolean") updates.rcVerified = body.rcVerified;
    if (typeof body.isInspected === "boolean") updates.isInspected = body.isInspected;
    // Approving releases a listing that was waiting beyond the unverified quota.
    if (body.approved === true) updates.pendingApproval = false;

    const [updated] = await db
      .update(cars)
      .set(updates)
      .where(eq(cars.id, carId))
      .returning();

    // Admin "Featured" grants. They are told apart from dealer-paid boosts by
    // amount = 0 and no Razorpay order, so toggling them can never touch a boost
    // the dealer paid for.
    const adminGrant = and(
      eq(boosts.car, carId),
      eq(boosts.amount, 0),
      isNull(boosts.razorpayOrderId)
    );

    if (typeof body.isBoosted === "boolean") {
      if (body.isBoosted) {
        // Idempotent: if the car is already boosted (by anyone), do nothing,
        // so repeated clicks never stack extra boost rows.
        const [alreadyActive] = await db
          .select({ id: boosts.id })
          .from(boosts)
          .where(
            and(
              eq(boosts.car, carId),
              eq(boosts.status, "active"),
              gt(boosts.endDate, new Date())
            )
          )
          .limit(1);

        if (!alreadyActive) {
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 30);
          await db.insert(boosts).values({
            car: carId,
            dealer: existing.dealer,
            // The enum has no 30-day type; this row is identified as an admin
            // grant by amount = 0, and its real length is endDate.
            boostType: "7day",
            amount: 0,
            status: "active",
            startDate: new Date(),
            endDate,
          });
        }
      } else {
        // Remove only admin grants. Dealer-paid boosts stay until they expire.
        await db
          .update(boosts)
          .set({ status: "expired", updatedAt: new Date() })
          .where(and(adminGrant, eq(boosts.status, "active")));
      }
    }

    // Report the car's real boost state (a paid boost can keep it featured).
    const [stillBoosted] = await db
      .select({ id: boosts.id })
      .from(boosts)
      .where(
        and(
          eq(boosts.car, carId),
          eq(boosts.status, "active"),
          gt(boosts.endDate, new Date())
        )
      )
      .limit(1);

    return {
      success: true,
      isBoosted: Boolean(stillBoosted),
      car: updated,
    };
  });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    await requireAdmin();

    const { id: carId } = await params;
    if (!carId) throw new ApiError(400, "Car ID is required");

    // Moderation removal is a soft delete too: the listing leaves the site but
    // its inquiries and lead history are preserved.
    const [deleted] = await db
      .update(cars)
      .set({ archivedAt: new Date(), updatedAt: new Date() })
      .where(eq(cars.id, carId))
      .returning();

    if (!deleted) throw new ApiError(404, "Car not found");

    return {
      success: true,
      deletedId: carId,
    };
  });
}
