import path from "path";

/** @type {import('next').NextConfig} */
const nextConfig = {
  // We explicitly configure the Turbopack workspace root so it correctly
  // watches and compiles shared workspace code (like @autobazaar/shared) 
  // without throwing root inference warnings.
  turbopack: {
    root: path.resolve(".."),
  },

  // We configure a custom loader globally to automatically optimize all dynamic
  // Cloudinary image paths across the frontend app without needing inline loader functions.
  images: {
    loader: "custom",
    loaderFile: "./lib/cloudinary-loader.js",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
};

export default nextConfig;
