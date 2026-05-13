import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";

/**
 * createAuth receives the raw MongoDB `Db` object (not Mongoose).
 * We pass it to Better Auth's MongoDB adapter so it can create
 * its own collections (users, sessions, accounts, verifications).
 */
export function createAuth(db) {
  return betterAuth({
    database: mongodbAdapter(db),
    emailAndPassword: {
      enabled: true,
    },

    // trustedOrigins tells Better Auth which frontend URLs are allowed
    // to make auth requests (prevents CSRF from unknown origins)
    trustedOrigins: [process.env.CLIENT_URL],

    /**
     * additionalFields — extending the User model
     * 
     * By default, Better Auth only stores: name, email, image, emailVerified.
     * We need a "role" field to distinguish buyers from dealers.
     * 
     * - type: "string" — the role is stored as a text value
     * - defaultValue: "buyer" — if someone signs up without choosing, they're a buyer
     * - required: false — the field is optional (has a default)
     * - input: false — SECURITY: users can NOT directly set their role via the API.
     *   Why? Because if input were true, a malicious user could send role: "admin"
     *   in the request and give themselves any role they want.
     *   Instead, we set the role safely using a databaseHook below.
     */
    user: {
      additionalFields: {
        role: {
          type: "string",
          defaultValue: "buyer",
          required: false,
          input: false,
        },
      },
    },

    /**
     * databaseHooks — intercepting database operations
     * 
     * Think of this like airport security scanning luggage before it goes on the plane.
     * Before Better Auth saves a new user to MongoDB, this hook runs and lets us
     * modify the user data.
     * 
     * We read the "role" from the original sign-up request body (ctx.body.role),
     * validate it's either "buyer" or "dealer", and attach it to the user object.
     * If someone tries to send role: "admin" or role: "superuser", we ignore it
     * and default to "buyer".
     */
    databaseHooks: {
      user: {
        create: {
          before: async (user, ctx) => {
            // ctx.body contains the raw data sent from the frontend sign-up form
            const requestedRole = ctx?.body?.role;

            // Only allow "buyer" or "dealer" — anything else defaults to "buyer"
            const validRoles = ["buyer", "dealer"];
            const safeRole = validRoles.includes(requestedRole)
              ? requestedRole
              : "buyer";

            return {
              data: {
                ...user,
                role: safeRole,
              },
            };
          },
        },
      },
    },
  });
}
