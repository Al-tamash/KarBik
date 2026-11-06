import { v2 as cloudinary } from "cloudinary";
import { carAssetFolder } from "@/lib/asset-ownership";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

const CAR_IMAGE_TRANSFORMATIONS = [
  { width: 1200, crop: "limit" },
  { quality: "auto" },
  { fetch_format: "auto" },
] as const;

export type CloudinaryUploadResult = {
  url: string;
  publicId: string;
};

export function isAllowedMime(mime: string): boolean {
  return mime.startsWith("image/") || mime === "application/pdf";
}

function uploadStream(
  buffer: Buffer,
  options: Record<string, unknown>
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error || !result) reject(error ?? new Error("Upload failed"));
        else
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
      }
    );
    stream.end(buffer);
  });
}

export function uploadCarImage(buffer: Buffer, ownerId: string) {
  return uploadStream(buffer, {
    // Per-dealer folder: lets the delete route prove who owns an asset.
    folder: carAssetFolder(ownerId),
    resource_type: "auto",
    transformation: CAR_IMAGE_TRANSFORMATIONS,
  });
}

export async function uploadDealerFile(
  folder: "autobazaar/dealers" | "autobazaar/verification",
  buffer: Buffer
) {
  const isPrivate = folder === "autobazaar/verification";
  const result = await uploadStream(buffer, {
    folder,
    resource_type: "auto",
    // KYC documents are private: an "authenticated" asset has no public URL and
    // can only be fetched with a signed link (see getAdminDocumentUrl).
    ...(isPrivate ? { type: "authenticated" } : {}),
  });

  // Cloudinary's upload response carries a permanent SIGNED url for private
  // assets. Never store or return that: keep only the unsigned path (which does
  // not load) so the document can be opened solely via getAdminDocumentUrl().
  return isPrivate
    ? { ...result, url: result.url.replace(/\/s--[^/]+--/, "") }
    : result;
}

/**
 * A short-lived, signed download link for a private verification document, for
 * admins only. Documents uploaded before this change are public and are
 * returned as stored.
 */
export function getAdminDocumentUrl(doc: {
  url: string;
  publicId: string;
}): string {
  if (!doc.url.includes("/authenticated/")) return doc.url;

  const format = doc.url.split("?")[0].split(".").pop() ?? "jpg";
  const expiresAt = Math.floor(Date.now() / 1000) + 10 * 60; // 10 minutes
  return cloudinary.utils.private_download_url(doc.publicId, format, {
    resource_type: "image",
    type: "authenticated",
    expires_at: expiresAt,
  });
}

export async function deleteFromCloudinary(
  publicId: string,
  options: { type?: "authenticated" } = {}
): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId, options);
  } catch (error) {
    console.error(`Failed to delete Cloudinary asset: ${publicId}`, error);
  }
}
