import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { dealerProfiles } from "@/lib/db/schema";
import { apiHandler, requireDealer } from "@/lib/guards";
import {
  deleteFromCloudinary,
  uploadDealerFile,
} from "@/lib/cloudinary-server";
import { parseFormData, validateFiles } from "@/lib/form";

// POST /api/trust/verify — dealer submits verification document
export async function POST(request: Request) {
  return apiHandler(async () => {
    const user = await requireDealer();
    const { body, fileGroups } = await parseFormData(request);

    let [profile] = await db
      .select()
      .from(dealerProfiles)
      .where(eq(dealerProfiles.user, user.id))
      .limit(1);

    if (!profile) {
      [profile] = await db
        .insert(dealerProfiles)
        .values({ user: user.id })
        .returning();
    }

    const updates: Record<string, unknown> = {};

    if (body.businessName) {
      updates.businessName = body.businessName;
    }

    // A document upload only SUBMITS the dealer for review. The "Verified"
    // badge is granted by an admin (PATCH /api/admin/dealers/:id/verify) after
    // they open the document. A new document also withdraws any earlier
    // approval, so a verified dealer cannot swap in a different file unnoticed.
    const docFiles = fileGroups["verificationDoc"] ?? [];
    if (docFiles.length > 0) {
      validateFiles(docFiles);
      if (profile.verificationDoc?.publicId) {
        // The superseded document is removed (the current one is kept for audit).
        // Older docs were public, newer ones private: clear whichever applies.
        const old = profile.verificationDoc;
        await deleteFromCloudinary(old.publicId, { type: "authenticated" });
        await deleteFromCloudinary(old.publicId);
      }
      const result = await uploadDealerFile(
        "autobazaar/verification",
        Buffer.from(await docFiles[0].arrayBuffer())
      );
      updates.verificationDoc = result;
      updates.isVerified = false;
    }

    if (Object.keys(updates).length > 0) {
      const [updated] = await db
        .update(dealerProfiles)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(dealerProfiles.id, profile.id))
        .returning();
      profile = updated;
    }

    return Response.json({
      message:
        docFiles.length > 0
          ? "Document received. Your dealership will show as Verified once KarBik reviews it."
          : "Profile updated successfully",
      profile,
    });
  });
}
