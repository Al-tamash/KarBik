/**
 * Captures desktop (1440px) and mobile (390px) screenshots of the public routes
 * and records basic page facts (console errors, failed requests, visible
 * placeholders). Read-only: it only issues GET navigations.
 *
 *   BASE_URL=https://www.karbik.com npx tsx scripts/audit-screenshots.ts
 *
 * HOST_MAP="www.karbik.com=216.198.79.1" pins DNS when the local resolver is stale.
 */
import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const BASE_URL = (process.env.BASE_URL ?? "https://www.karbik.com").replace(/\/$/, "");
const OUT = process.env.OUT_DIR ?? path.resolve("..", "audit", "screenshots");
const CAR_ID = process.env.CAR_ID ?? "";
const DEALER_SLUG = process.env.DEALER_SLUG ?? "southgate-motors";

const routes: { name: string; url: string }[] = [
  { name: "home", url: "/" },
  { name: "cars", url: "/cars" },
  { name: "cars-brand-toyota", url: "/cars?brand=Toyota" },
  ...(CAR_ID ? [{ name: "car-detail", url: `/cars/${CAR_ID}` }] : []),
  { name: "dealer-public", url: `/dealer/${DEALER_SLUG}` },
  { name: "pricing", url: "/pricing" },
  { name: "compare", url: "/compare" },
  { name: "login", url: "/login" },
  { name: "register", url: "/register" },
  { name: "dashboard-loggedout", url: "/dashboard" },
  { name: "about", url: "/about" },
  { name: "contact", url: "/contact" },
  { name: "faq", url: "/faq" },
  { name: "how-it-works", url: "/how-it-works" },
];

const viewports = [
  { tag: "desktop", width: 1440, height: 900, isMobile: false },
  { tag: "mobile", width: 390, height: 844, isMobile: true },
];

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const rules = (process.env.HOST_MAP ?? "")
    .split(",")
    .filter(Boolean)
    .map((p) => `MAP ${p.split("=")[0]} ${p.split("=")[1]}`)
    .join(", ");
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: rules ? [`--host-resolver-rules=${rules}`] : [],
  });
  const facts: unknown[] = [];

  for (const vp of viewports) {
    const ctx = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.isMobile,
      deviceScaleFactor: 1,
    });
    for (const r of routes) {
      const page = await ctx.newPage();
      const consoleErrors: string[] = [];
      const failed: string[] = [];
      page.on("console", (m) => m.type() === "error" && consoleErrors.push(m.text().slice(0, 200)));
      page.on("requestfailed", (q) => failed.push(`${q.url().slice(0, 120)} ${q.failure()?.errorText}`));
      page.on("response", (res) => res.status() >= 400 && failed.push(`${res.status()} ${res.url().slice(0, 120)}`));
      let status = 0;
      try {
        const res = await page.goto(BASE_URL + r.url, { waitUntil: "networkidle", timeout: 45000 });
        status = res?.status() ?? 0;
      } catch (e) {
        consoleErrors.push(`goto: ${(e as Error).message.slice(0, 160)}`);
      }
      // Scroll through the page so scroll-reveal sections render before the full-page capture.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 500) {
          window.scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 120));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForTimeout(1200);
      const file = `${r.name}-${vp.tag}.jpg`;
      await page.screenshot({ path: path.join(OUT, file), fullPage: true, type: "jpeg", quality: 60 });
      const info = await page.evaluate(() => {
        const text = document.body.innerText;
        const imgs = Array.from(document.images);
        return {
          finalUrl: location.pathname + location.search,
          title: document.title,
          loadingVisible: /\bLoading\.\.\.|\bLoading…/.test(text),
          ellipsisOnlyLines: text.split("\n").filter((l) => l.trim() === "…" || l.trim() === "...").length,
          brokenImages: imgs.filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src.slice(0, 100)),
          imagesMissingAlt: imgs.filter((i) => !i.hasAttribute("alt")).length,
          horizontalScroll: document.documentElement.scrollWidth > window.innerWidth + 1,
          h1: Array.from(document.querySelectorAll("h1")).map((h) => h.textContent?.trim().slice(0, 80)),
        };
      });
      facts.push({ route: r.url, viewport: vp.tag, status, file, consoleErrors, failed: failed.slice(0, 6), ...info });
      await page.close();
    }
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, "_facts.json"), JSON.stringify(facts, null, 2));
  console.log(`wrote ${facts.length} screenshots + _facts.json to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
