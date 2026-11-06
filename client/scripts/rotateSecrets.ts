import crypto from "crypto";
import fs from "fs";
import path from "path";
import webPush from "web-push";
import { config } from "dotenv";

config({ path: ".env.local" });

/**
 * rotateSecrets.ts — Automated Cryptographic Secret Generator & Rotation Log Tool
 *
 * WHAT: Generates high-entropy base64 secrets and VAPID keys for push notifications.
 * WHY:  Periodic secret cycling prevents session hijacking and long-term key leakage.
 *       Outputs new secrets, keeps a local JSON backup trail, and prints instructions
 *       for updating live environments.
 */

// Backup folder lives inside the project (gitignored) — no personal paths.
const backupDir = path.resolve(".secrets-backup");
const backupFilePath = path.join(backupDir, "rotation_backup.json");

type RotationEntry = {
  rotatedAt: string;
  betterAuthSecret: string;
  vapidPublicKey: string;
  vapidPrivateKey: string;
};

async function rotate() {
  console.log("\n🔑 Starting Cryptographic Secret Rotation...\n");

  try {
    // 1. Base64url 32-byte secret for Better Auth
    const newBetterAuthSecret = crypto.randomBytes(32).toString("base64url");

    // 2. Fresh VAPID keypair for Web Push
    const newVapidKeys = webPush.generateVAPIDKeys();

    const timestamp = new Date().toISOString();

    // 3. Load existing rotation log (or start fresh)
    let rotationLog: RotationEntry[] = [];
    if (fs.existsSync(backupFilePath)) {
      try {
        rotationLog = JSON.parse(fs.readFileSync(backupFilePath, "utf8")) as RotationEntry[];
      } catch {
        console.warn("⚠️ Rotation log file exists but was corrupted. Creating a new one.");
        rotationLog = [];
      }
    }

    // 4. Append this rotation and persist
    rotationLog.push({
      rotatedAt: timestamp,
      betterAuthSecret: newBetterAuthSecret,
      vapidPublicKey: newVapidKeys.publicKey,
      vapidPrivateKey: newVapidKeys.privateKey,
    });

    fs.mkdirSync(backupDir, { recursive: true });
    fs.writeFileSync(backupFilePath, JSON.stringify(rotationLog, null, 2));

    console.log("✅ New BETTER_AUTH_SECRET:");
    console.log(`   ${newBetterAuthSecret}\n`);
    console.log("✅ New VAPID keys:");
    console.log(`   PUBLIC : ${newVapidKeys.publicKey}`);
    console.log(`   PRIVATE: ${newVapidKeys.privateKey}\n`);
    console.log(`🗂️  Backup saved to: ${backupFilePath}`);
    console.log("\n👉 Next steps:");
    console.log("   1. Update BETTER_AUTH_SECRET in client/.env.local (and your host's env vars).");
    console.log("   2. Update VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY similarly.");
    console.log("   3. Restart the app so sessions are signed with the new secret.\n");
  } catch (error) {
    console.error("❌ Rotation failed:", (error as Error).message);
    process.exit(1);
  }
}

rotate();
