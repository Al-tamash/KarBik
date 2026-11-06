import type { CloudFile } from "@autobazaar/shared";

/**
 * Car images are uploaded into a per-dealer Cloudinary folder, so ownership of
 * an asset can be proven from its public id alone.
 */
export function carAssetFolder(ownerId: string): string {
  return `autobazaar/cars/${ownerId}`;
}

export function isOwnCarAsset(ownerId: string, publicId: string): boolean {
  return (
    publicId.startsWith(`${carAssetFolder(ownerId)}/`) &&
    !publicId.includes("..")
  );
}

/**
 * Drop any client-supplied image record that is not in the caller's own
 * Cloudinary folder (or is not served from Cloudinary). Without this a dealer
 * could attach someone else's public id to a listing and destroy that image
 * by deleting the listing.
 */
export function keepOwnedImages(ownerId: string, images: CloudFile[]): CloudFile[] {
  return images.filter(
    (img) =>
      isOwnCarAsset(ownerId, img.publicId) &&
      img.url.startsWith("https://res.cloudinary.com/")
  );
}
