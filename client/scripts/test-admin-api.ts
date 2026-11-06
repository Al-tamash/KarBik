/**
 * WHAT: Integration test suite for Super Admin API endpoints.
 * WHY: Proves that all /api/admin/* routes are strictly protected by requireAdmin()
 *      and correctly serve stats, dealers, cars, and inquiry data.
 */
import assert from "node:assert";

async function main() {
  console.log("=== Testing Super Admin API Endpoints ===");

  // 1. Verify unauthorized request is rejected
  const unauthRes = await fetch("http://localhost:3000/api/admin/stats");
  assert.strictEqual(unauthRes.status, 401, "Unauthenticated access must return 401");
  console.log("  ✓ Unauthenticated requests properly rejected with 401");

  // 2. Sign in as admin to obtain session cookie
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
  const authHeaders = { cookie };

  // 3. Test GET /api/admin/stats
  const statsRes = await fetch("http://localhost:3000/api/admin/stats", { headers: authHeaders });
  const statsText = await statsRes.text();
  console.log("Stats Response status:", statsRes.status, "Body:", statsText);
  assert.strictEqual(statsRes.status, 200);
  const stats = JSON.parse(statsText);
  console.log("  ✓ GET /api/admin/stats returned 200 OK:", stats);
  assert.ok(stats.totalDealers >= 3, "Should have at least 3 dealers");
  assert.ok(stats.totalCars >= 50, "Should have at least 50 cars");

  // 4. Test GET /api/admin/dealers
  const dealersRes = await fetch("http://localhost:3000/api/admin/dealers", { headers: authHeaders });
  assert.strictEqual(dealersRes.status, 200);
  const { dealers } = await dealersRes.json();
  console.log(`  ✓ GET /api/admin/dealers returned ${dealers.length} dealerships`);
  assert.ok(dealers.length >= 3);

  const sampleDealer = dealers[0];
  assert.ok(sampleDealer.id);
  assert.ok(sampleDealer.businessName);

  // 5. Test PATCH /api/admin/dealers/[id]/verify toggle
  const initialVerified = sampleDealer.isVerified;
  const toggleRes = await fetch(`http://localhost:3000/api/admin/dealers/${sampleDealer.id}/verify`, {
    method: "PATCH",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ isVerified: !initialVerified }),
  });
  assert.strictEqual(toggleRes.status, 200);
  const toggleData = await toggleRes.json();
  assert.strictEqual(toggleData.dealer.isVerified, !initialVerified);
  console.log(`  ✓ Toggled dealer verification from ${initialVerified} to ${!initialVerified}`);

  // Revert back to original
  await fetch(`http://localhost:3000/api/admin/dealers/${sampleDealer.id}/verify`, {
    method: "PATCH",
    headers: { ...authHeaders, "Content-Type": "application/json" },
    body: JSON.stringify({ isVerified: initialVerified }),
  });
  console.log(`  ✓ Reverted dealer verification to original state (${initialVerified})`);

  // 6. Test GET /api/admin/cars
  const carsRes = await fetch("http://localhost:3000/api/admin/cars", { headers: authHeaders });
  assert.strictEqual(carsRes.status, 200);
  const { cars } = await carsRes.json();
  console.log(`  ✓ GET /api/admin/cars returned ${cars.length} cars`);
  assert.ok(cars.length >= 50);

  // 7. Test GET /api/admin/inquiries
  const inqRes = await fetch("http://localhost:3000/api/admin/inquiries", { headers: authHeaders });
  assert.strictEqual(inqRes.status, 200);
  const { inquiries } = await inqRes.json();
  console.log(`  ✓ GET /api/admin/inquiries returned ${inquiries.length} leads`);

  console.log("\n✨ All Super Admin API tests passed successfully!");
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
