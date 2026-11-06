import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db, schema } from "@/lib/db";

// Roles a person may pick for THEMSELVES at sign-up. "admin" is deliberately
// absent: it is only ever granted by a direct database update
// (see scripts/seed-admin.ts), never through the public sign-up endpoint.
const SELF_SERVE_ROLES = ["buyer", "dealer"] as const;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  emailAndPassword: {
    enabled: true,
  },

  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",

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
              phone: requestedPhone || null,
            },
          };
        },
      },
    },
  },
});

export type Session = typeof auth.$Infer.Session;
