import { config } from "dotenv";
config({ path: ".env.local" });
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function main() {
  try {
    console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
    const res = await cloudinary.api.resources({
      type: "upload",
      prefix: "autobazaar",
      max_results: 10,
    });
    console.log("Existing autobazaar resources:", res.resources.map((r: any) => ({ public_id: r.public_id, secure_url: r.secure_url })));
  } catch (err) {
    console.error("Cloudinary test error:", err);
  }
}

main();

