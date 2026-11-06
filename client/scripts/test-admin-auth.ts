/**
 * WHAT: Verifies Super Admin authentication and session cookies.
 * WHY: Proves that admin can sign in via Better-Auth and receives a session with role='admin'.
 */
import assert from "node:assert";

async function main() {
  console.log("=== Testing Admin Authentication & Session ===");

  // 1. Sign in as admin
  const loginRes = await fetch("http://localhost:3000/api/auth/sign-in/email", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Origin": "http://localhost:3000",
    },
    body: JSON.stringify({
      email: process.env.ADMIN_EMAIL ?? "",
      password: process.env.ADMIN_PASSWORD ?? "",
    }),
  });

  assert.strictEqual(loginRes.status, 200, "Admin login should return 200 OK");
  const loginJson = await loginRes.json();
  assert.ok(loginJson.token, "Login response should include token");
  assert.strictEqual(loginJson.user.email, process.env.ADMIN_EMAIL);
  assert.strictEqual(loginJson.user.role, "admin");
  console.log("  ✓ Admin login succeeded with role 'admin'");

  // Extract session cookie
  const cookie = loginRes.headers.get("set-cookie");
  assert.ok(cookie, "Login should set session cookie");

  // 2. Query get-session with the cookie
  const sessionRes = await fetch("http://localhost:3000/api/auth/get-session", {
    headers: {
      cookie: cookie,
    },
  });

  assert.strictEqual(sessionRes.status, 200);
  const sessionJson = await sessionRes.json();
  assert.strictEqual(sessionJson.user.email, process.env.ADMIN_EMAIL);
  assert.strictEqual(sessionJson.user.role, "admin");
  console.log("  ✓ Session cookie verified with role 'admin'");

  console.log("\n✨ Admin auth verification passed!");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

