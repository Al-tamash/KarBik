/**
 * Browser-side image compression.
 *
 * Why: Vercel serverless functions reject request bodies over ~4.5 MB, and
 * phone photos are routinely 3-8 MB. Shrinking each photo before upload keeps
 * every request well under that limit. Cloudinary re-encodes to 1200px wide
 * anyway, so nothing visible is lost.
 *
 * Non-images (PDFs), GIFs, SVGs and anything the browser cannot decode are
 * returned untouched.
 */

const MAX_DIMENSION = 1600;
const MAX_BYTES = 1_200_000;
const QUALITY_STEPS = [0.85, 0.75, 0.65, 0.55];

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) return file;
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;

  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    // Already small enough and not being resized: keep the original bytes.
    if (scale === 1 && file.size <= MAX_BYTES) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      return file;
    }
    // JPEG has no alpha; paint white so transparent PNGs do not turn black.
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    let best: Blob | null = null;
    for (const quality of QUALITY_STEPS) {
      const blob = await toBlob(canvas, quality);
      if (!blob) break;
      best = blob;
      if (blob.size <= MAX_BYTES) break;
    }

    if (!best || best.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([best], name, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    return file;
  }
}

export function compressImages(files: File[]): Promise<File[]> {
  return Promise.all(files.map(compressImage));
}
