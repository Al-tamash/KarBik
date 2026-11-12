import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { after } from "next/server";
import { db, schema } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/auth-mail";
import { normalizeIndianMobile } from "@/lib/car-format";

// Roles a person may pick for THEMSELVES at sign-up. "admin" is deliberately
// absent: it is only ever granted by a direct database update
// (see scripts/seed-admin.ts), never through the public sign-up endpoint.
const SELF_SERVE_ROLES = ["buyer", "dealer"] as const;

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Better Auth rejects any request whose Origin is not trusted (INVALID_ORIGIN).
// By default only the baseURL origin is trusted, but production serves the site
// on both karbik.com and www.karbik.com (one redirects to the other), so trust
// both spellings of the configured host, plus the Vercel alias.
function trustedOriginsFor(appUrl: string): string[] {
  const origins = new Set<string>(["https://kar-bik.vercel.app"]);
  try {
    const url = new URL(appUrl);
    origins.add(url.origin);
    const isLocal =
      url.hostname === "localhost" || /^[\d.]+$/.test(url.hostname);
    if (!isLocal) {
      const altHost = url.hostname.startsWith("www.")
        ? url.hostname.slice(4)
        : `www.${url.hostname}`;
      origins.add(`${url.protocol}//${altHost}${url.port ? `:${url.port}` : ""}`);
    }
  } catch {
    // Malformed NEXT_PUBLIC_APP_URL: fall back to Better Auth's default.
  }
  return [...origins];
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  emailAndPassword: {
    enabled: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    // A reset usually means a lost phone or a shared password: sign every other device out.
    revokeSessionsOnPasswordReset: true,
    // Not awaited: an account that exists would otherwise answer more slowly than one that
    // does not, which tells a stranger who is registered. `after` finishes the send once
    // the response has gone out.
    sendResetPassword: async ({ user, url }) => {
      const send = () => sendPasswordResetEmail({ to: user.email, name: user.name, url });
      try {
        after(send);
      } catch {
        void send();
      }
    },
  },

  baseURL: APP_URL,
  trustedOrigins: trustedOriginsFor(APP_URL),

  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "buyer",
        required: false,
        input: false,
      },
      phone: {
        type: "string",
        required: false,
        input: true,
      },
    },
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user, ctx) => {
          const requestedRole = ctx?.body?.role;
          const requestedPhone = ctx?.body?.phone;
          const safeRole = (
            SELF_SERVE_ROLES as readonly string[]
          ).includes(requestedRole)
            ? requestedRole
            : "buyer";

          return {
            data: {
              ...user,
              role: safeRole,
              // Direct API sign-ups send whatever they like; store only a real Indian mobile number.
          phone: normalizeIndianMobile(typeof requestedPhone === "string" ? requestedPhone : null),
            },
          };
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
