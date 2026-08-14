/**
 * Cloudinary Image Loader for Next.js
 *
 * Optimized version: 
 * - f_auto: Automatically choose WebP/AVIF for smaller file sizes.
 * - q_auto: Automatically adjust quality to save bandwidth without visible loss.
 */
export default function cloudinaryLoader({ src, width, quality }) {
  // If the image is not from Cloudinary, return the original src
  if (!src.includes("res.cloudinary.com")) {
    return src;
  }

  // Use dynamic format, quality, and responsive width values
  // c_limit ensures the image is scaled down to the requested width only
  const params = [
    "f_auto",
    `q_${quality || "auto"}`,
    `w_${width}`,
    "c_limit"
  ].join(",");

  /**
   * Cloudinary URL structure: 
   * https://res.cloudinary.com/demo/image/upload/v12345/sample.jpg
   * We insert our parameters after /upload/ if it exists.
   */
  if (src.includes("/upload/")) {
    return src.replace("/upload/", `/upload/${params}/`);
  }

  return src;
}
