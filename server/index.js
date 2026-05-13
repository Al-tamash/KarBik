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

// CORS must be set up before any route handlers
// credentials: true allows the browser to send/receive cookies
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));

async function start() {
  // Step 1: Connect to MongoDB first
  await connectDB();

  // Step 2: Create the Better Auth instance using the connected DB
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
    res.json({ status: "ok" });
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start();
