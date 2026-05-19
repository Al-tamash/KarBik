import "dotenv/config";
import env from "./config/env.js"; // This will automatically trigger Zod schema validation on startup
import express from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import { toNodeHandler } from "better-auth/node";
import { ZodError } from "zod";
import { connectDB, getDB } from "./config/db.js";
import { createAuth } from "./lib/auth.js";
import carRoutes from "./routes/cars.js";
import inquiryRoutes from "./routes/inquiries.js";
import subscriptionRoutes from "./routes/subscriptions.js";
import paymentRoutes from "./routes/payments.js";
import boostRoutes from "./routes/boosts.js";
import analyticsRoutes from "./routes/analytics.js";
import dealerRoutes from "./routes/dealers.js";
import aiRoutes from "./routes/ai.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import wishlistRoutes from "./routes/wishlist.js";

const app = express();
const PORT = env.PORT; // Safe validated port from Zod

// 1. CORS must be set up BEFORE any other middleware or route handlers
// We use a dynamic origin function to support both your main CLIENT_URL
// and any Vercel preview/deployment subdomains (ending in .vercel.app).
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, postman, or server-to-server)
    if (!origin) return callback(null, true);
    
    // Check if the origin matches CLIENT_URL, localhost, or is a Vercel preview/deployment domain
    const isAllowed = origin === env.CLIENT_URL || 
                      origin === "http://localhost:3000" ||
                      (origin.startsWith("https://autobazaar-") && origin.endsWith(".vercel.app"));
                      
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy blocked access from origin: ${origin}`));
    }
  },
  credentials: true,
}));

// --- Startup environment check ---
console.log("--- AutoBazaar Server Starting ---");
console.log("NODE_ENV:", process.env.NODE_ENV || "not set");
console.log("PORT:", PORT);
console.log("----------------------------------");

// 2. Inject secure headers (X-Frame-Options, CSP, X-Content-Type-Options, etc.)
app.use(helmet());

// 3. Global Rate Limiter to guard backend against automated DDoS and scraping
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: "draft-6", // Use modern RateLimit headers format
  legacyHeaders: false, // Disable older X-RateLimit-* headers
  skip: (req) => process.env.NODE_ENV !== "production" && req.headers["x-test-bypass"] === "true",
  message: {
    message: "Too many requests from this IP, please try again after 15 minutes",
  },
});
app.use(globalLimiter);

// 4. Strict rate limiting for sensitive endpoints (prevent credentials brute-forcing and spam)
const sensitiveLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  limit: 15, // Max 15 attempts
  standardHeaders: "draft-6",
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV !== "production" && req.headers["x-test-bypass"] === "true",
  message: {
    message: "Too many requests. Please try again after 15 minutes to secure your account and resources",
  },
});

// Apply strict limits to authentication endpoints and inquiry forms
app.use("/api/auth", sensitiveLimiter);
app.use("/api/inquiries", sensitiveLimiter);

async function start() {
  try {
    // Step 1: Connect to MongoDB first
    console.log("Connecting to MongoDB...");
    await connectDB();

    // Step 2: Create the Better Auth instance using the connected DB
    console.log("Initializing Better Auth...");
    const auth = createAuth(getDB());

    // Step 3: Mount Better Auth BEFORE express.json()
    // Better Auth needs the raw request body — if express.json() runs first,
    // it consumes the body stream and Better Auth gets an empty object.
    // "*splat" is Express v5 syntax for catch-all wildcard routes.
    app.all("/api/auth/*splat", toNodeHandler(auth));

    // Step 4: Mount express.json() AFTER Better Auth
    // This way, only non-auth routes get JSON parsing from Express
    app.use(express.json());

    // Step 5: Mount car CRUD routes
    // We pass `auth` so the protect middleware can verify sessions
    app.use("/api/cars", carRoutes(auth));

    // Step 6: Mount inquiry routes
    app.use("/api/inquiries", inquiryRoutes(auth));

    // Step 7: Mount subscription and payment routes (Phase 7)
    app.use("/api/subscriptions", subscriptionRoutes(auth));
    app.use("/api/payments", paymentRoutes(auth));

    // Step 8: Mount boost routes (Phase 8)
    app.use("/api/boosts", boostRoutes(auth));

    // Step 9: Mount analytics routes (Phase 9)
    app.use("/api/analytics", analyticsRoutes(auth));

    // Step 10: Mount trust routes (Phase 10)
    const trustRoutesObj = await import("./routes/trust.js");
    app.use("/api/trust", trustRoutesObj.default(auth));

    // Step 11: Mount dealer micro-website routes (Phase 12)
    app.use("/api/dealers", dealerRoutes(auth));

    // Step 12: Mount AI routes (Phase 13)
    app.use("/api/ai", aiRoutes(auth));

    // Step 13: Mount Notification routes (Phase 14)
    app.use("/api/notifications", notificationRoutes(auth));

    // Step 14: Mount Database-Backed Wishlist routes
    app.use("/api/wishlist", wishlistRoutes(auth));

    // Health check endpoint to verify the server is running
    app.get("/api/health", (_req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
    });

    // --- Global Error Handler ---
    // This catches any errors thrown in routes (like Zod validation errors)
    // and returns a clean JSON response instead of a crash.
    app.use((err, req, res, next) => {
      // If it's a Zod validation error, return 400 Bad Request
      if (err instanceof ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: err.errors.map((e) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }

      // Default error: 500 Internal Server Error
      console.error("Uncaught Error:", err);
      res.status(500).json({
        message: "Something went wrong on the server",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    });

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    // If anything fails during startup, log the full error
    console.error("❌ Server failed to start:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

start();

