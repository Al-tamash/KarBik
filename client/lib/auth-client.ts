"use client";

import { useMemo } from "react";
import { createAuthClient } from "better-auth/react";
import type { ApiSessionUser } from "@/lib/api-types";

export const authClient = createAuthClient();

type SessionData = {
  session: Record<string, unknown>;
  user: Omit<ApiSessionUser, "role"> & { role?: string };
};

/**
 * Typed wrapper around authClient.useSession().
 * The server stores `role` via Better Auth additionalFields, but the
 * client-side inferred type does not surface it — this guarantees it.
 *
 * The returned object is memoised on the underlying `data` so effects
 * depending on `session` don't re-fire every render.
 */
export function useAppSession() {
  const { data, isPending } = authClient.useSession();
  return useMemo(
    () => ({
      data: data
        ? ({ ...data, user: data.user as SessionData["user"] } as SessionData)
        : null,
      isPending,
    }),
    // `data` identity comes from better-auth's store — stable between polls.
    [data, isPending]
  );
}
