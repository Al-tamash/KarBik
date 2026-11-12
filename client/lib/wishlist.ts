"use client";

/**
 * Wishlist store: the one place every heart button and the header count read.
 *
 * - Signed out: saved car ids live in this browser (localStorage "savedCars").
 * - Signed in: the server wishlist (GET/POST /api/wishlist) is the source of
 *   truth. On sign-in, cars saved while signed out are merged into the account
 *   (idempotent POST) and the browser copy is cleared, so signing out on a
 *   shared device does not leave the account's list behind.
 *
 * Ids are kept newest first. Card data is fetched separately
 * (GET /api/cars/by-ids), which also drops cars that are no longer public.
 */

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useAppSession } from "@/lib/auth-client";

const STORAGE_KEY = "savedCars";

type WishlistState = {
  ids: string[];
  /** false until we know whose list to show (avoids a flash of the wrong list). */
  ready: boolean;
  signedIn: boolean;
};

const INITIAL: WishlistState = { ids: [], ready: false, signedIn: false };

let state: WishlistState = INITIAL;
const listeners = new Set<() => void>();
/** User id the store is synced for; null = signed out; undefined = not yet. */
let syncedFor: string | null | undefined;
/** Car ids with a server toggle in flight (ignores double taps). */
const pending = new Set<string>();

function setState(next: Partial<WishlistState>) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function readLocal(): string[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed)
      ? [...new Set(parsed.filter((id): id is string => typeof id === "string"))]
      : [];
  } catch {
    return [];
  }
}

function writeLocal(ids: string[]) {
  try {
    if (ids.length === 0) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage blocked (private mode): the list still works for this page view.
  }
}

async function loadServerList(localIds: string[]): Promise<string[]> {
  const res = await fetch("/api/wishlist", {
    method: localIds.length > 0 ? "POST" : "GET",
    credentials: "include",
    headers: localIds.length > 0 ? { "Content-Type": "application/json" } : undefined,
    body: localIds.length > 0 ? JSON.stringify({ carIds: localIds.slice(0, 60) }) : undefined,
  });
  if (!res.ok) throw new Error(`wishlist ${res.status}`);
  const data = (await res.json()) as { carIds?: string[] };
  return data.carIds ?? [];
}

async function syncFor(userId: string | null) {
  if (syncedFor === userId) return;
  syncedFor = userId;

  if (userId === null) {
    setState({ ids: readLocal(), ready: true, signedIn: false });
    return;
  }

  const localIds = readLocal();
  setState({ ready: false, signedIn: true });
  try {
    const ids = await loadServerList(localIds);
    if (syncedFor !== userId) return; // signed out while loading
    writeLocal([]);
    setState({ ids, ready: true });
  } catch {
    if (syncedFor !== userId) return;
    // Server unreachable: show what this browser has and retry on next mount.
    syncedFor = undefined;
    setState({ ids: localIds, ready: true });
  }
}

async function toggle(carId: string) {
  const saved = state.ids.includes(carId);
  const optimistic = saved
    ? state.ids.filter((id) => id !== carId)
    : [carId, ...state.ids];

  if (!state.signedIn) {
    writeLocal(optimistic);
    setState({ ids: optimistic });
    return;
  }

  if (pending.has(carId)) return;
  pending.add(carId);
  setState({ ids: optimistic });
  try {
    const res = await fetch(`/api/wishlist/toggle/${carId}`, {
      method: "POST",
      credentials: "include",
    });
    if (res.status === 404) {
      // Listing is gone: it cannot be saved, so drop it.
      setState({ ids: state.ids.filter((id) => id !== carId) });
      return;
    }
    if (!res.ok) throw new Error(`toggle ${res.status}`);
    const { isWishlisted } = (await res.json()) as { isWishlisted?: boolean };
    const without = state.ids.filter((id) => id !== carId);
    setState({ ids: isWishlisted ? [carId, ...without] : without });
  } catch {
    // Revert the optimistic change.
    const without = state.ids.filter((id) => id !== carId);
    setState({ ids: saved ? [carId, ...without] : without });
  } finally {
    pending.delete(carId);
  }
}

/**
 * Drop saved ids whose listing is no longer public (sold, removed, hidden),
 * so the header count matches the cars the wishlist page can show.
 * The server list is already filtered; this only matters for the browser copy.
 */
function prune(requestedIds: string[], liveIds: string[]) {
  const live = new Set(liveIds);
  const gone = new Set(requestedIds.filter((id) => !live.has(id)));
  const kept = state.ids.filter((id) => !gone.has(id) || pending.has(id));
  if (kept.length === state.ids.length) return;
  if (!state.signedIn) writeLocal(kept);
  setState({ ids: kept });
}

/** Keep signed-out tabs in step when another tab changes the list. */
function onStorage(event: StorageEvent) {
  if (event.key === STORAGE_KEY && !state.signedIn && state.ready) {
    setState({ ids: readLocal() });
  }
}

export function useWishlist() {
  const { data: session, isPending } = useAppSession();
  const userId = session?.user?.id ?? null;
  const snapshot = useSyncExternalStore(subscribe, () => state, () => INITIAL);

  useEffect(() => {
    if (!isPending) void syncFor(userId);
  }, [isPending, userId]);

  useEffect(() => {
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const has = useCallback((carId: string) => snapshot.ids.includes(carId), [snapshot.ids]);

  return {
    ids: snapshot.ids,
    count: snapshot.ids.length,
    ready: snapshot.ready,
    signedIn: snapshot.signedIn,
    has,
    toggle,
    prune,
  };
}
