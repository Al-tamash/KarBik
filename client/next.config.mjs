import path from "path";

/** @type {import('next').NextConfig} */
const securityHeaders = [
  // Stop browsers MIME-sniffing uploads into something executable.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Nobody else may frame the site (clickjacking). Razorpay opens its own
  // frame/popup, which this does not affect.
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self), payment=(self)",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains",
  },
];

const nextConfig = {
  transpilePackages: ["@autobazaar/shared"],

  // Don't advertise the framework in every response.
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  // Keep the Neon driver as a real Node dependency — Turbopack's bundled
  // version breaks its fetch calls ("TypeError: fetch failed").
  serverExternalPackages: ["@neondatabase/serverless"],

  // We explicitly configure the Turbopack workspace root so it correctly
  // watches and compiles shared workspace code (like @autobazaar/shared) 
  // without throwing root inference warnings.
  turbopack: {
    root: path.resolve(".."),
  },

  // Cloudinary-optimized loading is applied per-component via
  // lib/cloudinary-loader.ts; everything else uses the default optimizer.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "stimg.cardekho.com",
      },
      {
        protocol: "https",
        hostname: "images.cardekho.com",
      },
      {
        protocol: "https",
        hostname: "imgd.aeplcdn.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
      },
    ],
  },
};

export default nextConfig;
