/**
 * Read-only smoke tests. Safe against production: they only issue GETs.
 *   BASE_URL=https://www.karbik.com npm run test:smoke
 */
import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import type { Browser, Page } from "playwright";
import { BASE_URL, httpGet, launch, newContext } from "./helpers";

let browser: Browser;
before(async () => {
  browser = await launch();
});
after(async () => {
  await browser?.close();
});

async function open(path: string, mobile = false): Promise<Page> {
  const ctx = await newContext(browser, mobile);
  const page = await ctx.newPage();
  await page.goto(BASE_URL + path, { waitUntil: "domcontentloaded", timeout: 45000 });
  return page;
}

describe("homepage", () => {
  it('shows no "Loading..." text 5 seconds after load', async () => {
    const page = await open("/");
    await page.waitForTimeout(5000);
    const body = await page.evaluate(() => document.body.innerText);
    assert.ok(!/Loading(\.\.\.|…)/.test(body), 'homepage still shows "Loading..."');
    await page.context().close();
  });

  it("server HTML has no Loading placeholder and no bare ellipsis stat", async () => {
    const res = await httpGet("/");
    const html = await res.text();
    assert.ok(!html.includes("Loading..."), 'raw HTML contains "Loading..."');
    assert.ok(!/>…</.test(html), "raw HTML contains a bare ellipsis placeholder");
  });

  it("renders real listings, not skeletons only", async () => {
    const page = await open("/");
    await page.waitForSelector('a[href^="/cars/"]', { timeout: 15000 });
    const count = await page.locator('a[href^="/cars/"]').count();
    assert.ok(count > 0, "no listing links on the homepage");
    await page.context().close();
  });

  it("live listing count in the stats strip is a number", async () => {
    const page = await open("/");
    await page.waitForTimeout(2000);
    const text = await page.evaluate(() => document.body.innerText);
    assert.match(text, /\b\d+\+\s*\n?\s*Live Listings/i);
    await page.context().close();
  });
});

describe("public routes", () => {
  for (const route of [
    "/",
    "/cars",
    "/pricing",
    "/compare",
    "/login",
    "/register",
    "/about",
    "/contact",
    "/faq",
    "/how-it-works",
  ]) {
    it(`${route} responds 200 and renders content`, async () => {
      const ctx = await newContext(browser);
      const page = await ctx.newPage();
      const res = await page.goto(BASE_URL + route, { waitUntil: "domcontentloaded", timeout: 45000 });
      assert.equal(res?.status(), 200);
      assert.ok((await page.locator("h1, main").count()) > 0);
      await ctx.close();
    });
  }

  it("/dashboard logged-out redirects to /login", async () => {
    const page = await open("/dashboard");
    await page.waitForURL(/\/login/, { timeout: 15000 });
    await page.context().close();
  });

  it("login page has one email and one password field", async () => {
    const page = await open("/login");
    assert.equal(await page.locator('input[type="email"]').count(), 1);
    assert.equal(await page.locator('input[type="password"]').count(), 1);
    await page.context().close();
  });
});

describe("cars search and filters", () => {
  it("?brand=Toyota keeps the query string and only lists Toyota", async () => {
    const res = await httpGet(`/api/cars?brand=Toyota`);
    assert.equal(res.status, 200);
    const data = (await res.json()) as { cars: { brand: string }[] };
    for (const car of data.cars) assert.match(car.brand, /toyota/i);
    const page = await open("/cars?brand=Toyota");
    await page.waitForTimeout(3000);
    assert.match(page.url(), /brand=Toyota/);
    await page.context().close();
  });

  it("fuel and price filters narrow the API result", async () => {
    const all = (await (await httpGet(`/api/cars?limit=50`)).json()) as { total: number };
    const diesel = (await (await httpGet(`/api/cars?fuelType=diesel&limit=50`)).json()) as {
      total: number;
      cars: { fuelType: string }[];
    };
    assert.ok(diesel.total <= all.total);
    for (const car of diesel.cars) assert.equal(car.fuelType, "diesel");
    const cheap = (await (await httpGet(`/api/cars?maxPrice=500000&limit=50`)).json()) as {
      cars: { price: number }[];
    };
    for (const car of cheap.cars) assert.ok(car.price <= 500000);
  });
});

describe("listing detail", () => {
  it("first listing renders its title, price and a WhatsApp enquiry control", async () => {
    const list = (await (await httpGet(`/api/cars?limit=1`)).json()) as {
      cars: { id: string; title: string }[];
    };
    assert.ok(list.cars.length > 0, "no listings to test");
    const page = await open(`/cars/${list.cars[0].id}`);
    await page.locator("h1:visible").first().waitFor({ timeout: 15000 });
    assert.match(await page.locator("h1:visible").first().innerText(), /\S/);
    const body = await page.evaluate(() => document.body.innerText);
    assert.match(body, /₹/);
    assert.match(body, /whatsapp/i);
    await page.context().close();
  });
});

describe("pricing and compare", () => {
  it("pricing shows every plan the API returns", async () => {
    const plans = (await (await httpGet(`/api/subscriptions/plans`)).json()) as {
      name: string;
      priceMonthly: number;
    }[];
    assert.ok(plans.length >= 3);
    const page = await open("/pricing");
    await page.waitForTimeout(2500);
    const body = await page.evaluate(() => document.body.innerText);
    for (const plan of plans) assert.ok(body.includes(plan.name), `plan ${plan.name} missing on /pricing`);
    await page.context().close();
  });

  it("logged-out visitors are not told they are on the Free plan", async () => {
    const page = await open("/pricing");
    await page.waitForTimeout(2500);
    const body = await page.evaluate(() => document.body.innerText);
    assert.ok(!/current active plan/i.test(body), "/pricing shows \"Current active plan\" to a logged-out visitor");
    await page.context().close();
  });

  it("compare page renders with no selection without crashing", async () => {
    const page = await open("/compare");
    await page.waitForTimeout(1500);
    assert.ok((await page.evaluate(() => document.body.innerText)).length > 50);
    await page.context().close();
  });
});

describe("mobile layout", () => {
  for (const route of ["/", "/cars", "/pricing", "/login"]) {
    it(`${route} has no horizontal scroll at 390px`, async () => {
      const page = await open(route, true);
      await page.waitForTimeout(2000);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      assert.equal(overflow, false);
      await page.context().close();
    });
  }
});
