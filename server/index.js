import "dotenv/config";
import express from "express";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import { connectDB, getDB } from "./config/db.js";
import { createAuth } from "./lib/auth.js";
import carRoutes from "./routes/cars.js";
import inquiryRoutes from "./routes/inquiries.js";

const app = express();
const PORT = process.env.PORT || 5000;

// --- Startup environment check ---
// This prints right away so we can see in Render logs which vars are loaded
console.log("--- AutoBazaar Server Starting ---");
console.log("NODE_ENV:", process.env.NODE_ENV || "not set");
console.log("PORT:", PORT);
console.log("MONGO_URI:", process.env.MONGO_URI ? "✅ Set" : "❌ MISSING");
console.log("CLIENT_URL:", process.env.CLIENT_URL || "❌ MISSING");
console.log("BETTER_AUTH_SECRET:", process.env.BETTER_AUTH_SECRET ? "✅ Set" : "❌ MISSING");
console.log("BETTER_AUTH_URL:", process.env.BETTER_AUTH_URL || "❌ MISSING");
console.log("----------------------------------");

// CORS must be set up before any route handlers
// credentials: true allows the browser to send/receive cookies
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

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

    // Health check endpoint to verify the server is running
    app.get("/api/health", (_req, res) => {
      res.json({ status: "ok", timestamp: new Date().toISOString() });
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

