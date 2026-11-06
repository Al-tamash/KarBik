import { ApiError } from "@/lib/guards";
import type { CloudFile } from "@autobazaar/shared";
import { MAX_FILE_SIZE, isAllowedMime } from "@/lib/cloudinary-server";

export type ParsedFormData = {
  body: Record<string, string>;
  fileGroups: Record<string, File[]>;
};

export async function parseFormData(request: Request): Promise<ParsedFormData> {
  const form = await request.formData();
  const body: Record<string, string> = {};
  const fileGroups: Record<string, File[]> = {};

  for (const [key, value] of form.entries()) {
    if (typeof value === "string") {
      body[key] = value;
    } else if (value.size > 0) {
      (fileGroups[key] ??= []).push(value);
    }
  }

  return { body, fileGroups };
}

export function validateFiles(files: File[]): void {
  for (const file of files) {
    if (!isAllowedMime(file.type)) {
      throw new ApiError(400, "Only image files and PDFs are allowed");
    }
    if (file.size > MAX_FILE_SIZE) {
      throw new ApiError(400, "File size must be under 5MB");
    }
  }
}

/**
 * Extracts pre-uploaded image records sent as text fields.
 * Supports three formats:
 * A) structured array under `images` (JSON clients)
 * B) JSON-encoded string under `images`
 * C) flat bracket keys: `images[0][url]`, `images[0][publicId]`
 */
export function extractImagesFromBody(
  body: Record<string, unknown>
): CloudFile[] {
  if (!body) return [];

  const mapImage = (img: Record<string, unknown>): CloudFile | null => {
    const url = typeof img.url === "string" ? img.url : "";
    const publicId =
      typeof img.publicId === "string"
        ? img.publicId
        : typeof img.public_id === "string"
          ? img.public_id
          : "";
    return url && publicId ? { url, publicId } : null;
  };

  // Scenario A: already a structured array
  if (Array.isArray(body.images)) {
    return body.images
      .map((img) => mapImage(img as Record<string, unknown>))
      .filter((img): img is CloudFile => img !== null);
  }

  // Scenario B: JSON-encoded string
  if (typeof body.images === "string") {
    try {
      const parsed = JSON.parse(body.images);
      if (Array.isArray(parsed)) {
        return parsed
          .map((img) => mapImage(img as Record<string, unknown>))
          .filter((img): img is CloudFile => img !== null);
      }
    } catch {
      // fall through to flat key scan
    }
  }

  // Scenario C: flat bracket-notation keys
  const imageMap: Record<number, { url?: string; publicId?: string }> = {};
  for (const key of Object.keys(body)) {
    const match = key.match(/^images\[(\d+)\]\[(url|publicId)\]$/);
    if (match && typeof body[key] === "string") {
      const index = Number.parseInt(match[1], 10);
      const field = match[2] as "url" | "publicId";
      imageMap[index] ??= {};
      imageMap[index][field] = body[key] as string;
    }
  }

  return Object.keys(imageMap)
    .map(Number)
    .sort((a, b) => a - b)
    .map((index) => imageMap[index])
    .map((img) =>
      img.url && img.publicId ? { url: img.url, publicId: img.publicId } : null
    )
    .filter((img): img is CloudFile => img !== null);
}
