import { z } from "zod";

/**
 * env.js — Strict Environment Variable Schema Validator
 * 
 * WHAT: Defensively checks and validates all required configuration settings.
 * WHY: Missing or malformed environment variables (like missing API secrets)
 *      are the leading cause of crashes or silent security failures in production.
 *      By validating at startup, we guarantee the server cannot run in an insecure
 *      or incomplete state!
 */

// Define the schema using Zod for strict type and format checks
const envSchema = z.object({
  // Port mapping — coerce to number and default to 5000 if not provided
  PORT: z.coerce.number().default(5000),
  
  // Database configuration connection string
  MONGO_URI: z.string({
    required_error: "MONGO_URI is required to connect to the database",
  }).min(1, "MONGO_URI cannot be empty"),

  // Frontend application redirect URL
  CLIENT_URL: z.string({
    required_error: "CLIENT_URL is required to restrict CORS access",
  }).url("CLIENT_URL must be a valid HTTP/HTTPS URL"),

  // Better-Auth configuration
  BETTER_AUTH_SECRET: z.string({
    required_error: "BETTER_AUTH_SECRET is required to sign user session cookies",
  }).min(32, "BETTER_AUTH_SECRET must be at least 32 characters long for cryptographic security"),

  BETTER_AUTH_URL: z.string({
    required_error: "BETTER_AUTH_URL is required to bind OAuth callbacks",
  }).url("BETTER_AUTH_URL must be a valid HTTP/HTTPS URL"),

  // Cloudinary media credentials
  CLOUDINARY_CLOUD_NAME: z.string().min(1, "CLOUDINARY_CLOUD_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_API_SECRET: z.string().min(1, "CLOUDINARY_API_SECRET is required"),

  // Razorpay payment credentials
  RAZORPAY_KEY_ID: z.string().min(1, "RAZORPAY_KEY_ID is required"),
  RAZORPAY_KEY_SECRET: z.string().min(1, "RAZORPAY_KEY_SECRET is required"),

  // Gemini AI configuration
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required for pricing recommendations"),

  // VAPID push notification key pairs
  VAPID_PUBLIC_KEY: z.string().min(1, "VAPID_PUBLIC_KEY is required for push messages"),
  VAPID_PRIVATE_KEY: z.string().min(1, "VAPID_PRIVATE_KEY is required for push signatures"),
});

// Run standard parsing
let env;

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("\n❌ CRITICAL ERROR: Environment Configuration Validation Failed!");
  console.error("The following environment variables are missing or misconfigured:\n");
  
  // Format and print the errors beautifully in a list
  result.error.issues.forEach((err) => {
    const path = err.path.join(".");
    console.error(`  ⚠️  [${path}]: ${err.message}`);
  });
  
  console.error("\n--- Shutting down server to prevent insecure operation --- \n");
  
  // Exit the process immediately with error code 1 so hosting servers like Render stop the deployment
  process.exit(1);
} else {
  // Save parsed and fully-typed config
  env = result.data;
}

export default env;
