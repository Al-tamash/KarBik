interface CloudinaryLoaderArgs {
  src: string;
  width: number;
  quality?: number | string;
}

/**
 * Cloudinary Image Loader for Next.js
 * - f_auto: automatically choose WebP/AVIF
 * - q_auto: automatic quality
 */
export default function cloudinaryLoader({
  src,
  width,
  quality,
}: CloudinaryLoaderArgs): string {
  if (!src.includes("res.cloudinary.com")) {
    return src;
  }

  const params = [
    "f_auto",
    `q_${quality || "auto"}`,
    `w_${width}`,
    "c_limit",
  ].join(",");

  if (src.includes("/upload/")) {
    return src.replace("/upload/", `/upload/${params}/`);
  }

  return src;
}
