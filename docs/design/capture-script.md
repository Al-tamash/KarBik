# Full-page capture script

Used in step 6 of the [redesign playbook](redesign-playbook.md) to produce the
captures the `impeccable-finish-reviewer` needs:
- 375 and 1440 wide;
- light and dark;
- every lazy image loaded;
- the Next.js dev indicator hidden.

It lives here, not in `client/`, because it is tooling for agents, not app code.

## Setup (once per session, outside the repo)

```bash
mkdir -p "$SCRATCH/cap" && cd "$SCRATCH/cap" && npm init -y && npm i playwright-core@1.49.1
```

The browser is the Playwright headless shell that is already installed:

```bash
export CHROME_EXE=$(ls "$LOCALAPPDATA"/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-win64/chrome-headless-shell.exe | tail -1)
```

## Run

```bash
node "$SCRATCH/cap/cap.js" "client/.impeccable/review" http://localhost:3001/
```

Each capture prints `docH`, `scrollW` (must equal the viewport width) and
`broken` (must be `[]`). In the mobile full-page capture the fixed bottom tab bar
appears once mid-image. That is an artifact of full-page capture, not a layout bug.

## cap.js

```js
// node cap.js <outDir> [url]
const { chromium } = require("playwright-core");
const path = require("path");

const out = process.argv[2];
const URL = process.argv[3] || "http://localhost:3001/";
const shots = [
  { name: "mobile.png", width: 375, height: 812, scheme: "light", mobile: true },
  { name: "mobile-rail-end.png", width: 375, height: 812, scheme: "light", mobile: true, railEnd: true },
  { name: "desktop.png", width: 1440, height: 900, scheme: "light" },
  { name: "desktop-dark.png", width: 1440, height: 900, scheme: "dark" },
];

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROME_EXE });
  for (const s of shots) {
    const ctx = await browser.newContext({
      viewport: { width: s.width, height: s.height },
      colorScheme: s.scheme,
      isMobile: !!s.mobile,
      hasTouch: !!s.mobile,
      deviceScaleFactor: 1,
    });
    const page = await ctx.newPage();
    // "networkidle" never settles on the dev server (HMR socket), so wait for "load".
    await page.goto(URL, { waitUntil: "load", timeout: 60000 });
    await page.addStyleTag({ content: "nextjs-portal{display:none!important}" });
    // Walk the page so lazy images enter the viewport, then force-load the rest.
    const h = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < h; y += s.height / 2) {
      await page.evaluate((yy) => window.scrollTo(0, yy), y);
      await page.waitForTimeout(150);
    }
    await page.evaluate(() => document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = "eager")));
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(1500);
    await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 30000 }).catch(() => {});
    if (s.railEnd) {
      // Shows the end of the first horizontal rail ("See all" tile).
      await page.evaluate(() => {
        const rail = document.querySelector(".snap-x");
        rail.scrollIntoView({ block: "center" });
        rail.scrollLeft = rail.scrollWidth;
      });
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(out, s.name) });
    } else {
      await page.screenshot({ path: path.join(out, s.name), fullPage: true });
    }
    const info = await page.evaluate(() => ({
      docH: document.documentElement.scrollHeight,
      scrollW: document.documentElement.scrollWidth,
      broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src.slice(-60)),
    }));
    console.log(s.name, JSON.stringify(info));
    await ctx.close();
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
```

For a page without a rail, drop the `mobile-rail-end` entry.
