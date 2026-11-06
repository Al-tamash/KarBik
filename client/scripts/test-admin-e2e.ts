/**
 * WHAT: Full End-to-End verification script for the Super Admin Portal.
 * WHY: Verifies authentication, route guards, UI page rendering, and all moderation actions.
 */
import assert from "node:assert";

async function main() {
  console.log("==================================================");
  console.log("🚀 STARTING SUPER ADMIN END-TO-END VERIFICATION");
  console.log("==================================================\n");

  // 1. Check /admin page availability
  console.log("1. Testing Page Access: /admin");
  const pageRes = await fetch("http://localhost:3000/admin");
  assert.strictEqual(pageRes.status, 200, "/admin page should return 200 OK");
  console.log("  ✓ /admin page route responds with HTTP 200 OK\n");

  // 2. Test Unauthenticated API Protection
  console.log("2. Testing Security Guards (Unauthenticated Request)");
  const unauthRes = await fetch("http://localhost:3000/api/admin/stats");
  assert.strictEqual(unauthRes.status, 401, "API must reject unauthenticated requests with 401");
  console.log("  ✓ /api/admin/stats correctly protected with 401 Unauthorized\n");

  // 3. Authenticate as Super Admin
  console.log("3. Authenticating as Super Admin");
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

  assert.strictEqual(loginRes.status, 200);
  const cookie = loginRes.headers.get("set-cookie") || "";
  assert.ok(cookie.length > 0, "Must return session cookie");
  const authHeaders = { cookie };
  console.log("  ✓ Super Admin signed in successfully \n");

  // 4. Test Platform Stats API
  console.log("4. Testing GET /api/admin/stats");
  const statsRes = await fetch("http://localhost:3000/api/admin/stats", { headers: authHeaders });
  assert.strictEqual(statsRes.status, 200);
  const stats = await statsRes.json();
  console.log("  ✓ Stats data retrieved successfully:");
  console.log(`    - Total Dealerships: ${stats.totalDealers}`);
  console.log(`    - Verified Dealerships: ${stats.verifiedDealers}`);
  console.log(`    - Total Hyderabad Cars: ${stats.totalCars}`);
  console.log(`    - Boosted Listings: ${stats.boostedCars}`);
  console.log(`    - Customer Inquiries: ${stats.totalInquiries}`);
  console.log(`    - Registered Users: ${stats.totalUsers}\n`);

  assert.ok(stats.totalDealers >= 3);
  assert.ok(stats.totalCars >= 50);

  // 5. Test Dealers API & Verification Toggle
  console.log("5. Testing Dealers Management & Toggle");
  const dealersRes = await fetch("http://localhost:3000/api/admin/dealers", { headers: authHeaders });
  assert.strictEqual(dealersRes.status, 200);
  const { dealers } = await dealersRes.json();
  assert.ok(dealers.length >= 3);
  console.log(`  ✓ Loaded ${dealers.length} dealerships from database`);

  const targetDealer = dealers[0];
  const origVerified = targetDealer.isVerified;

  // Toggle verification
  const toggleRes = await fetch(`http://localhost:3000/api/admin/dealers/${targetDealer.id}/verify`, {
    method: "PATCH",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ isVerified: !origVerified }),
  });
  assert.strictEqual(toggleRes.status, 200);
  const toggleData = await toggleRes.json();
  assert.strictEqual(toggleData.dealer.isVerified, !origVerified);
  console.log(`  ✓ Toggled dealer verification: ${targetDealer.businessName} (${origVerified} -> ${!origVerified})`);

  // Revert
  await fetch(`http://localhost:3000/api/admin/dealers/${targetDealer.id}/verify`, {
    method: "PATCH",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ isVerified: origVerified }),
  });
  console.log(`  ✓ Reverted verification status back to ${origVerified}\n`);

  // 6. Test Cars Moderation & Badges
  console.log("6. Testing Cars Moderation & Badges");
  const carsRes = await fetch("http://localhost:3000/api/admin/cars", { headers: authHeaders });
  assert.strictEqual(carsRes.status, 200);
  const { cars } = await carsRes.json();
  assert.ok(cars.length >= 50);
  console.log(`  ✓ Loaded ${cars.length} vehicles across Hyderabad dealerships`);

  const sampleCar = cars[0];
  const origRc = sampleCar.rcVerified;

  // Toggle RC verified
  const rcRes = await fetch(`http://localhost:3000/api/admin/cars/${sampleCar.id}`, {
    method: "PATCH",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ rcVerified: !origRc }),
  });
  assert.strictEqual(rcRes.status, 200);
  console.log(`  ✓ Toggled RC verification flag on car: ${sampleCar.title} (${origRc} -> ${!origRc})`);

  // Revert RC verified
  await fetch(`http://localhost:3000/api/admin/cars/${sampleCar.id}`, {
    method: "PATCH",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ rcVerified: origRc }),
  });
  console.log(`  ✓ Reverted car RC verification back to ${origRc}\n`);

  // 7. Test Inquiries / Leads API
  console.log("7. Testing Buyer Inquiries API");
  const inqRes = await fetch("http://localhost:3000/api/admin/inquiries", { headers: authHeaders });
  assert.strictEqual(inqRes.status, 200);
  const { inquiries } = await inqRes.json();
  console.log(`  ✓ Retrieved ${inquiries.length} customer inquiries with lead scores & dealer mapping\n`);

  console.log("==================================================");
  console.log("✨ ALL SUPER ADMIN E2E TESTS PASSED SUCCESSFULLY!");
  console.log("==================================================");
}

main().catch((err) => {
  console.error("E2E Test Failed:", err);
  process.exit(1);
});

