import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { cars, dealerProfiles } from "@/lib/db/schema";
import { updateCarSchema, stripUndefined } from "@autobazaar/shared";
import { apiHandler, getSessionUser, requireDealer } from "@/lib/guards";
import { parseFormData, validateFiles } from "@/lib/form";
import {
  deleteFromCloudinary,
  uploadCarImage,
} from "@/lib/cloudinary-server";

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// GET /api/cars/:id — public: single car, view counter for non-owners
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const { id } = await params;
    if (!UUID_PATTERN.test(id)) {
      return Response.json({ message: "Car not found" }, { status: 404 });
    }

    const [car] = await db.select().from(cars).where(eq(cars.id, id)).limit(1);
    if (!car) {
      return Response.json({ message: "Car not found" }, { status: 404 });
    }

    let isOwner = false;
    const user = await getSessionUser();
    if (user && user.id === car.dealer) isOwner = true;

    // Archived (soft-deleted) and not-yet-approved listings are invisible to the
    // public. The owner may still open a pending car; only an admin sees archived.
    const isAdmin = user?.role === "admin";
    const hidden =
      car.archivedAt !== null || (car.pendingApproval && !isOwner);
    if (hidden && !isAdmin && !(isOwner && car.archivedAt === null)) {
      return Response.json({ message: "Car not found" }, { status: 404 });
    }

    // Server-side callers that only need the data (e.g. generateMetadata, which
    // runs alongside the page render) pass ?view=0 so one page visit counts once.
    const countView = new URL(request.url).searchParams.get("view") !== "0";

    let views = car.views;
    if (!isOwner && countView) {
      const [updated] = await db
        .update(cars)
        .set({ views: sql`${cars.views} + 1` })
        .where(eq(cars.id, car.id))
        .returning({ views: cars.views });
      views = updated.views;
    }

    const [dealerRow] = await db
      .select({ isSample: dealerProfiles.isSample })
      .from(dealerProfiles)
      .where(eq(dealerProfiles.user, car.dealer))
      .limit(1);

    return Response.json({ ...car, views, dealerIsSample: dealerRow?.isSample ?? false });
  });
}

// PUT /api/cars/:id — dealer owner only: update listing
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const user = await requireDealer();
    const { id } = await params;
    if (!UUID_PATTERN.test(id)) {
      return Response.json({ message: "Car not found" }, { status: 404 });
    }

    const [car] = await db.select().from(cars).where(eq(cars.id, id)).limit(1);
    if (!car) {
      return Response.json({ message: "Car not found" }, { status: 404 });
    }
    if (car.dealer !== user.id) {
      return Response.json(
        { message: "Forbidden — this is not your listing" },
        { status: 403 }
      );
    }
    if (car.archivedAt) {
      return Response.json({ message: "Car not found" }, { status: 404 });
    }

    const { body, fileGroups } = await parseFormData(request);
    // Zod fills in defaults (e.g. accidentHistory=false) for fields that were
    // never sent, so a partial update would silently reset them. Keep only the
    // fields the client actually submitted.
    const parsed = Object.fromEntries(
      Object.entries(stripUndefined(updateCarSchema.parse(body))).filter(
        ([key]) => key in body
      )
    ) as ReturnType<typeof stripUndefined<ReturnType<typeof updateCarSchema.parse>>>;

    const updates: Record<string, unknown> = { ...parsed };

    // rcVerified is admin-only. A dealer can never set it, and changing the
    // registration number invalidates a previously granted verification.
    delete updates.rcVerified;
    if (
      parsed.registrationNumber !== undefined &&
      parsed.registrationNumber !== car.registrationNumber
    ) {
      updates.rcVerified = false;
    }

    // Replace images when new files are uploaded
    const imageFiles = fileGroups["images"] ?? [];
    if (imageFiles.length > 0) {
      validateFiles(imageFiles);
      for (const oldImage of car.images) {
        await deleteFromCloudinary(oldImage.publicId);
      }
      const newImages = [];
      for (const file of imageFiles) {
        newImages.push(
          await uploadCarImage(Buffer.from(await file.arrayBuffer()), user.id)
        );
      }
      updates.images = newImages;
    }

    // Inspection report upload
    const reportFiles = fileGroups["inspectionReport"] ?? [];
    if (reportFiles.length > 0) {
      validateFiles(reportFiles);
      if (car.inspectionReport?.publicId) {
        await deleteFromCloudinary(car.inspectionReport.publicId);
      }
      const result = await uploadCarImage(
        Buffer.from(await reportFiles[0].arrayBuffer()),
        user.id
      );
      updates.inspectionReport = result;
      // Storing a report is not an inspection. The "Inspected" badge is a
      // platform claim, set only by an admin (PATCH /api/admin/cars/:id); a new
      // report withdraws any earlier approval until it is reviewed.
      updates.isInspected = false;
    }

    const [updated] = await db
      .update(cars)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cars.id, car.id))
      .returning();

    return Response.json(updated);
  });
}

// DELETE /api/cars/:id — dealer owner only: delete listing
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  return apiHandler(async () => {
    const user = await requireDealer();
    const { id } = await params;
    if (!UUID_PATTERN.test(id)) {
      return Response.json({ message: "Car not found" }, { status: 404 });
    }

    const [car] = await db.select().from(cars).where(eq(cars.id, id)).limit(1);
    if (!car) {
      return Response.json({ message: "Car not found" }, { status: 404 });
    }
    if (car.dealer !== user.id) {
      return Response.json(
        { message: "Forbidden — this is not your listing" },
        { status: 403 }
      );
    }

    if (car.archivedAt) {
      return Response.json({ message: "Car not found" }, { status: 404 });
    }

    // Soft delete: the listing leaves every public page, but its inquiries and
    // lead audit trail stay, so lead disputes can still be answered. Images are
    // kept because the dealer's CRM and the lead timeline still show the car.
    await db
      .update(cars)
      .set({ archivedAt: new Date(), updatedAt: new Date() })
      .where(eq(cars.id, car.id));
    return Response.json({ message: "Car listing deleted" });
  });
}
