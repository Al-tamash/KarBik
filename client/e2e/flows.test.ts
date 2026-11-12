/**
 * Write-enabled end-to-end flows: register, login/logout, redirect-when-signed-in,
 * WhatsApp enquiry, dealer listing create/edit/delete, form validation.
 *
 * These create users, inquiries and listings, so they ONLY run when
 *   E2E_ALLOW_WRITES=1  and  BASE_URL is NOT karbik.com
 * (point them at localhost or a preview deployment backed by a test database).
 *
 *   E2E_ALLOW_WRITES=1 BASE_URL=http://localhost:3107 npm run test:flows
 */
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Browser, BrowserContext, Page } from "playwright";
import { BASE_URL, launch, newContext, testIdentity, writesAllowed } from "./helpers";

const enabled = writesAllowed();
const skip = enabled ? false : "set E2E_ALLOW_WRITES=1 and a non-production BASE_URL to run write flows";

let browser: Browser;
before(async () => {
  if (enabled) browser = await launch();
});
after(async () => {
  await browser?.close();
});

async function register(page: Page, who: { name: string; email: string; password: string }, role: "buyer" | "dealer") {
  await page.goto(BASE_URL + "/register", { waitUntil: "networkidle" });
  await page.fill("#reg-name", who.name);
  await page.fill("#reg-phone", "9876543210");
  await page.fill("#reg-email", who.email);
  await page.fill("#reg-password", who.password);
  if (role === "dealer") {
    // The role picker is a pair of type="button" cards; the dealer card mentions listing cars.
    await page.getByRole("button", { name: /dealer|sell/i }).first().click();
  }
  await page.click('button[type="submit"]');
}

describe("auth", { skip }, () => {
  const buyer = testIdentity("buyer");
  let ctx: BrowserContext;
  let page: Page;

  before(async () => {
    ctx = await newContext(browser);
    page = await ctx.newPage();
  });
  after(async () => {
    await ctx?.close();
  });

  it("register lands on /dashboard and sets an httpOnly session cookie", async () => {
    await register(page, buyer, "buyer");
    await page.waitForURL(/\/dashboard/, { timeout: 20000 });
    const cookies = await ctx.cookies();
    const session = cookies.find((c) => c.name.includes("session_token"));
    assert.ok(session, "no better-auth session cookie was set");
    assert.equal(session.httpOnly, true);
    assert.equal(session.sameSite, "Lax");
  });

  it("session persists across a refresh", async () => {
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.waitForTimeout(2500);
    assert.match(new URL(page.url()).pathname, /^\/dashboard/);
  });

  it("an authenticated visitor to /login is redirected to /dashboard", async () => {
    await page.goto(BASE_URL + "/login", { waitUntil: "networkidle" });
    await page.waitForURL(/\/dashboard/, { timeout: 15000 });
  });

  it("logout clears the session, then /dashboard bounces to /login", async () => {
    const res = await ctx.request.post(BASE_URL + "/api/auth/sign-out", {
      headers: { Origin: BASE_URL, "Content-Type": "application/json" },
      data: {},
    });
    assert.ok(res.ok(), `sign-out failed ${res.status()}`);
    await ctx.clearCookies();
    await page.goto(BASE_URL + "/dashboard", { waitUntil: "domcontentloaded" });
    await page.waitForURL(/\/login/, { timeout: 15000 });
  });

  it("login with the same credentials lands on /dashboard", async () => {
    await page.goto(BASE_URL + "/login", { waitUntil: "networkidle" });
    await page.fill('input[type="email"]', buyer.email);
    await page.fill('input[type="password"]', buyer.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/dashboard/, { timeout: 20000 });
  });
});

describe("form validation and error handling", { skip }, () => {
  it("wrong password shows an error and stays on /login", async () => {
    const ctx = await newContext(browser);
    const page = await ctx.newPage();
    await page.goto(BASE_URL + "/login", { waitUntil: "networkidle" });
    await page.fill('input[type="email"]', "nobody-e2e@example.test");
    await page.fill('input[type="password"]', "wrong-password-1");
    await page.click('button[type="submit"]');
    await page.waitForSelector("text=/invalid email or password/i", { timeout: 15000 });
    assert.match(new URL(page.url()).pathname, /\/login/);
    await ctx.close();
  });

  it("register with a too-short password is rejected with a message", async () => {
    const ctx = await newContext(browser);
    const page = await ctx.newPage();
    const who = testIdentity("short");
    await register(page, { ...who, password: "abc" }, "buyer");
    await page.waitForTimeout(3000);
    assert.match(new URL(page.url()).pathname, /\/register/);
    assert.ok((await page.locator("text=/password/i").count()) > 0, "no password validation message shown");
    await ctx.close();
  });
});

describe("WhatsApp enquiry", { skip }, () => {
  it("builds a wa.me link to KarBik support with a fully-described, URL-encoded message", async () => {
    const ctx = await newContext(browser);
    const page = await ctx.newPage();
    const who = testIdentity("wa");
    await register(page, who, "buyer");
    await page.waitForURL(/\/dashboard/, { timeout: 20000 });

    const list = (await (await ctx.request.get(`${BASE_URL}/api/cars?limit=1`)).json()) as {
      cars: {
        id: string;
        year: number;
        brand: string;
        model: string;
        variant: string;
        fuelType: string;
        dealerProfile: { businessName: string } | null;
      }[];
    };
    const car = list.cars[0];
    const res = await ctx.request.post(`${BASE_URL}/api/inquiries`, {
      headers: { Origin: BASE_URL, "Content-Type": "application/json" },
      data: { car: car.id, name: "E2E Buyer", phone: `9${String(Date.now()).slice(-9)}` /* unique per run: inquiries are rate-limited per phone per day */, message: "Is it available?", channel: "whatsapp" },
    });
    assert.equal(res.status(), 201);
    const body = (await res.json()) as { id: string; whatsappUrl: string };
    const url = new URL(body.whatsappUrl);
    assert.equal(url.origin + url.pathname, "https://wa.me/919494720878", "must open KarBik support in international format");
    const text = url.searchParams.get("text") ?? "";
    const ref = body.id.slice(0, 8);
    for (const part of [String(car.year), car.brand, car.model, car.variant, ref]) {
      assert.ok(text.includes(part), `message is missing "${part}": ${text}`);
    }
    assert.match(text, new RegExp(`\\(${car.fuelType}\\)`, "i"), "message is missing the fuel type");
    assert.ok(!text.includes(`${car.year} ${car.brand} ${car.year} ${car.brand}`), "year/brand is duplicated");
    assert.ok(!/^\+| /.test(url.pathname.replace("/", "")), "number must have no +, no spaces");
    await ctx.close();
  });
});

describe("dealer listing lifecycle", { skip }, () => {
  it("dealer can create, edit and delete a listing", async () => {
    const ctx = await newContext(browser);
    const page = await ctx.newPage();
    const dealer = testIdentity("dealer");
    const signUp = await ctx.request.post(`${BASE_URL}/api/auth/sign-up/email`, {
      headers: { Origin: BASE_URL, "Content-Type": "application/json" },
      data: { ...dealer, role: "dealer" },
    });
    assert.equal(signUp.status(), 200);
    void page;

    const form = {
      title: "E2E Test Hatchback",
      brand: "Maruti",
      model: "Swift",
      variant: "VXi",
      year: "2020",
      price: "450000",
      fuelType: "petrol",
      transmission: "manual",
      bodyType: "hatchback",
      mileage: "30000",
      color: "White",
      owners: "1st owner",
      city: "Hyderabad",
    };
    const created = await ctx.request.post(`${BASE_URL}/api/cars`, {
      headers: { Origin: BASE_URL },
      multipart: form,
    });
    assert.equal(created.status(), 201, await created.text());
    const car = (await created.json()) as { id: string; price: number };
    assert.equal(car.price, 450000);

    const edited = await ctx.request.put(`${BASE_URL}/api/cars/${car.id}`, {
      headers: { Origin: BASE_URL },
      multipart: { price: "430000", color: "Silver" },
    });
    assert.equal(edited.status(), 200, await edited.text());
    const after = (await edited.json()) as { price: number; color: string };
    assert.equal(after.price, 430000);
    assert.equal(after.color, "Silver");

    const removed = await ctx.request.delete(`${BASE_URL}/api/cars/${car.id}`, { headers: { Origin: BASE_URL } });
    assert.equal(removed.status(), 200, await removed.text());
    const gone = await ctx.request.get(`${BASE_URL}/api/cars/${car.id}`);
    assert.ok([403, 404, 410].includes(gone.status()), `deleted listing is still reachable (HTTP ${gone.status()})`);
    const stillListed = (await (await ctx.request.get(`${BASE_URL}/api/cars?limit=50`)).json()) as { cars: { id: string }[] };
    assert.ok(!stillListed.cars.some((c) => c.id === car.id), "deleted listing still appears in the public list");
    await ctx.close();
  });
});

describe("contact form", { skip }, () => {
  const good = { name: "E2E", email: "e2e@example.test", topic: "buying", message: "This is an automated end-to-end test message." };
  const headers = { Origin: BASE_URL, "Content-Type": "application/json" };

  it("API rejects invalid input with a 400 and a readable message", async () => {
    const ctx = await newContext(browser);
    const res = await ctx.request.post(BASE_URL + "/api/contact", { headers, data: { ...good, email: "nope" } });
    assert.equal(res.status(), 400);
    assert.match(((await res.json()) as { message: string }).message, /email/i);
    await ctx.close();
  });

  it("API silently accepts a honeypot hit without sending anything", async () => {
    const ctx = await newContext(browser);
    const res = await ctx.request.post(BASE_URL + "/api/contact", { headers, data: { ...good, website: "http://spam.example" } });
    assert.equal(res.status(), 200);
    await ctx.close();
  });

  it("page shows a success state only when the API says it sent", async () => {
    const ctx = await newContext(browser);
    const page = await ctx.newPage();
    await page.route("**/api/contact", (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) }));
    await page.goto(BASE_URL + "/contact", { waitUntil: "networkidle" });
    await page.fill("#contact-name", "E2E");
    await page.fill("#contact-email", "e2e@example.test");
    await page.selectOption("#contact-topic", "buying");
    await page.fill("#contact-message", "This is an automated end-to-end test message.");
    await page.click("button[type=submit]");
    await page.waitForSelector("text=Message Sent!", { timeout: 10000 });
    await ctx.close();
  });

  it("page shows the error (not a fake success) when sending fails", async () => {
    const ctx = await newContext(browser);
    const page = await ctx.newPage();
    await page.route("**/api/contact", (route) =>
      route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ message: "We couldn't send your message right now. Please email support@karbik.com." }) })
    );
    await page.goto(BASE_URL + "/contact", { waitUntil: "networkidle" });
    await page.fill("#contact-name", "E2E");
    await page.fill("#contact-email", "e2e@example.test");
    await page.selectOption("#contact-topic", "buying");
    await page.fill("#contact-message", "This is an automated end-to-end test message.");
    await page.click("button[type=submit]");
    await page.waitForSelector("[role=alert]", { timeout: 10000 });
    assert.equal(await page.locator("text=Message Sent!").count(), 0);
    await ctx.close();
  });
});
