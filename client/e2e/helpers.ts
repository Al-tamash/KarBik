/**
 * Shared Playwright plumbing for the E2E suites (run with `npm run test:e2e`).
 *
 *   BASE_URL            target (default https://www.karbik.com)
 *   HOST_MAP            "www.karbik.com=216.198.79.1" pins DNS if the local resolver is stale
 *   CHROMIUM_PATH       use an already-installed Chromium instead of Playwright's bundled one
 *   E2E_ALLOW_WRITES=1  enable suites that create users/listings/inquiries
 *
 * Write suites refuse to run against production: they must point at localhost
 * or a Vercel preview whose DATABASE_URL is a test branch, never prod.
 */
import http from "node:http";
import https from "node:https";
import { chromium, type Browser, type BrowserContext } from "playwright";

export const BASE_URL = (process.env.BASE_URL ?? "https://www.karbik.com").replace(/\/$/, "");

export function isProduction(): boolean {
  const host = new URL(BASE_URL).hostname;
  return host === "karbik.com" || host.endsWith(".karbik.com");
}

export function writesAllowed(): boolean {
  return process.env.E2E_ALLOW_WRITES === "1" && !isProduction();
}

export async function launch(): Promise<Browser> {
  const rules = (process.env.HOST_MAP ?? "")
    .split(",")
    .filter(Boolean)
    .map((pair) => {
      const [host, ip] = pair.split("=");
      return `MAP ${host} ${ip}`;
    })
    .join(", ");
  return chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: rules ? [`--host-resolver-rules=${rules}`] : [],
  });
}

export async function newContext(browser: Browser, mobile = false): Promise<BrowserContext> {
  return browser.newContext(
    mobile
      ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
      : { viewport: { width: 1440, height: 900 } }
  );
}

/** Unique, obviously-fake identity for write tests. */
export function testIdentity(tag: string) {
  const stamp = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return {
    name: `E2E ${tag} ${stamp}`,
    email: `e2e-${tag}-${stamp}@example.test`,
    password: "E2eTest#98765",
  };
}

const hostMap = new Map(
  (process.env.HOST_MAP ?? "")
    .split(",")
    .filter(Boolean)
    .map((pair) => pair.split("=") as [string, string])
);

export interface HttpResult {
  status: number;
  text: () => Promise<string>;
  json: () => Promise<unknown>;
}

/**
 * GET helper that honours HOST_MAP. The global fetch ignores the browser host
 * rules, so on a machine with a stale DNS cache it would silently test the
 * wrong server (for example the old Hostinger parking page).
 */
export function httpGet(pathOrUrl: string): Promise<HttpResult> {
  const url = new URL(pathOrUrl.startsWith("http") ? pathOrUrl : BASE_URL + pathOrUrl);
  const pinned = hostMap.get(url.hostname);
  const lib = url.protocol === "https:" ? https : http;
  return new Promise((resolve, reject) => {
    const req = lib.request(
      url,
      {
        method: "GET",
        headers: { "user-agent": "karbik-e2e", accept: "*/*" },
        ...(pinned
          ? {
              // Node may ask for all addresses (autoSelectFamily), so answer in either shape.
              lookup: (
                _host: string,
                opts: { all?: boolean },
                cb: (err: null, address: unknown, family?: number) => void
              ) => (opts?.all ? cb(null, [{ address: pinned, family: 4 }]) : cb(null, pinned, 4)),
            }
          : {}),
      } as https.RequestOptions,
      (res) => {
        const chunks: Buffer[] = [];
        res.on("data", (c: Buffer) => chunks.push(c));
        res.on("end", () => {
          const body = Buffer.concat(chunks).toString("utf8");
          resolve({ status: res.statusCode ?? 0, text: async () => body, json: async () => JSON.parse(body) });
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(30000, () => req.destroy(new Error("timeout " + url.href)));
    req.end();
  });
}
