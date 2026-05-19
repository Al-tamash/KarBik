import crypto from "crypto";
import fs from "fs";
import path from "path";
import webPush from "web-push";

/**
 * rotateSecrets.js — Automated Cryptographic Secret Generator & Rotation Log Tool
 * 
 * WHAT: Generates high-entropy base64 secrets and VAPID keys for push notifications.
 * WHY: Periodic secret cycling prevents advanced session Hijacking and blocks long-term key leakage.
 *      This script outputs brand new secrets, maintains a backup JSON trail for rolls,
 *      and prints clean directions on updating live environments.
 */

// 1. Define standard backup folder paths
const backupDir = "C:\\Users\\Mohd Azimullah\\.gemini\\antigravity\\brain\\5f5e43d9-8dcb-412d-acdb-455b858ba6cd\\scratch";
const backupFilePath = path.join(backupDir, "rotation_backup.json");

async function rotate() {
  console.log("\n🔑 Starting Cryptographic Secret Rotation...\n");

  try {
    // 2. Generate a base64 cryptographically secure 32-byte secret for Better-Auth
    // crypto.randomBytes generates highly unpredictable entropy bytes from the OS
    const newBetterAuthSecret = crypto.randomBytes(32).toString("base64url");
    
    // 3. Generate a brand new VAPID keypair for Web-Push offline notifications
    // webPush.generateVAPIDKeys creates valid Elliptic Curve P-256 keys
    const newVapidKeys = webPush.generateVAPIDKeys();

    const timestamp = new Date().toISOString();

    // 4. Load the existing rotation backups if they exist, or initialize a new list
    let rotationLog = [];
    if (fs.existsSync(backupFilePath)) {
      try {
        const fileContent = fs.readFileSync(backupFilePath, "utf8");
        rotationLog = JSON.parse(fileContent);
      } catch (err) {
        console.warn("⚠️ Rotation log file exists but was corrupted. Creating a new one.");
      }
    }

    // 5. Append the newly generated secrets to the rotation log backup
    const newEntry = {
      timestamp,
      BETTER_AUTH_SECRET: newBetterAuthSecret,
      VAPID_PUBLIC_KEY: newVapidKeys.publicKey,
      VAPID_PRIVATE_KEY: newVapidKeys.privateKey,
    };
    rotationLog.push(newEntry);

    // Ensure the backup directory exists
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Save the rotation backup safely (using 2 spaces for beautiful human-readable formatting)
    fs.writeFileSync(backupFilePath, JSON.stringify(rotationLog, null, 2), "utf8");
    console.log(`✅ Rotation backup successfully written to:\n   ${backupFilePath}\n`);

    // 6. Print the generated secrets in a gorgeous visual terminal box
    console.log("=========================================================================");
    console.log("                  🛡️  NEW GENERATED SECRETS SUMMARY  🛡️                 ");
    console.log("=========================================================================");
    console.log(`Timestamp:       ${timestamp}`);
    console.log("-------------------------------------------------------------------------");
    console.log(`BETTER_AUTH_SECRET:\n  ${newBetterAuthSecret}`);
    console.log("-------------------------------------------------------------------------");
    console.log(`VAPID_PUBLIC_KEY:\n  ${newVapidKeys.publicKey}`);
    console.log("-------------------------------------------------------------------------");
    console.log(`VAPID_PRIVATE_KEY:\n  ${newVapidKeys.privateKey}`);
    console.log("=========================================================================\n");

    // 7. Output platform integration instructions
    console.log("👉 NEXT STEPS FOR PRODUCTION DEPLOYMENT:");
    console.log("   1. Log into your hosting platform control panel (Render, Vercel, etc.)");
    console.log("   2. Update the environment variables with the new values listed above.");
    console.log("   3. Trigger a manual clean redeploy of both frontend and backend.");
    console.log("   4. Check server logs at boot to confirm Zod validates the new configurations successfully!");
    
  } catch (error) {
    console.error("❌ Cryptographic rotation failed:", error.message);
    process.exit(1);
  }
}

rotate();
