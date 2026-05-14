import mongoose from "mongoose";

export async function connectDB() {
  try {
    // Check if MONGO_URI exists — without it, connection will fail silently
    if (!process.env.MONGO_URI) {
      console.error("ERROR: MONGO_URI is not defined in environment variables!");
      console.error("On Render: Go to Dashboard → Environment → Add MONGO_URI");
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    // If connection fails (wrong password, network blocked, etc.)
    // log the error clearly and stop the server
    console.error("MongoDB connection FAILED:", error.message);
    process.exit(1);
  }
}

export function getDB() {
  return mongoose.connection.getClient().db();
}
