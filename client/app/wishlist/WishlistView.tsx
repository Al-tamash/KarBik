"use client";

/**
 * Wishlist: the cars a buyer saved with the heart on listing cards and car pages.
 * Ids come from the shared wishlist store (browser list when signed out,
 * account list when signed in); card data comes from GET /api/cars/by-ids,
 * which skips cars that are no longer for sale. Un-hearting a card here
 * removes it from the grid straight away.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Heart, RotateCw } from "lucide-react";
import CarCard from "@/components/CarCard";
import type { ApiCar } from "@/lib/api-types";
import { useWishlist } from "@/lib/wishlist";

/** null = the listing is no longer public. */
type CarCache = Record<string, ApiCar | null>;

export default function WishlistView() {
  const wishlist = useWishlist();
  const { ids, ready, signedIn, prune } = wishlist;
  const [cache, setCache] = useState<CarCache>({});
  const [failedKey, setFailedKey] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  // Saved ids we have no card data for yet.
  const missingKey = useMemo(
    () => (ready ? ids.filter((id) => !(id in cache)).join(",") : ""),
    [ready, ids, cache],
  );

  useEffect(() => {
    if (!missingKey || failedKey === missingKey) return;
    const requested = missingKey.split(",");
    let cancelled = false;

    fetch(`/api/cars/by-ids?ids=${encodeURIComponent(missingKey)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(`by-ids ${res.status}`);
        return (await res.json()) as { cars: ApiCar[] };
      })
      .then(({ cars }) => {
        if (cancelled) return;
        const next: CarCache = {};
        for (const id of requested) next[id] = null;
        for (const car of cars) next[car.id] = car;
        setCache((prev) => ({ ...prev, ...next }));
        prune(requested, cars.map((car) => car.id));
      })
      .catch(() => {
        if (!cancelled) setFailedKey(missingKey);
      });

    return () => {
      cancelled = true;
    };
  }, [missingKey, failedKey, attempt, prune]);

  const cars = ids.flatMap((id) => cache[id] ?? []);
  const failed = Boolean(missingKey) && failedKey === missingKey;
  const loading = !ready || (Boolean(missingKey) && !failed);
  const isEmpty = ready && ids.length === 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 md:py-14">
      <header className="mb-6 md:mb-8">
        <h1 className="font-display text-2xl font-bold tracking-tight text-ink-strong md:text-3xl">
          Your wishlist
        </h1>
        {!isEmpty && (
          <p className="mt-1.5 text-sm text-ink-muted">
            {cars.length > 0 && (
              <span className="font-semibold text-ink tabular-nums">
                {cars.length} saved {cars.length === 1 ? "car" : "cars"}
                {" · "}
              </span>
            )}
            {!ready ? (
              "Loading your saved cars…"
            ) : signedIn ? (
              "Saved to your account, so they show wherever you log in."
            ) : (
              <>
                Saved in this browser only.{" "}
                <Link href="/login" className="font-semibold text-primary-700 hover:underline">
                  Log in
                </Link>{" "}
                to keep them on your account.
              </>
            )}
          </p>
        )}
      </header>

      {isEmpty ? (
        <EmptyState signedIn={signedIn} />
      ) : (
        <>
          {cars.length > 0 && (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {cars.map((car) => (
                <li key={car.id}>
                  <CarCard car={car} />
                </li>
              ))}
            </ul>
          )}

          {loading && cars.length === 0 && <SkeletonGrid count={Math.min(Math.max(ids.length, 2), 4)} />}

          {failed && (
            <div className="mt-5 flex flex-col items-start gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-ink">We could not load some of your saved cars. Check your connection and try again.</p>
              <button
                type="button"
                onClick={() => {
                  setFailedKey(null);
                  setAttempt((n) => n + 1);
                }}
                className="btn btn-md btn-outline min-h-11 shrink-0"
              >
                <RotateCw className="h-4 w-4" aria-hidden />
                Try again
              </button>
            </div>
          )}

          {cars.length > 0 && (
            <p className="mt-8 text-sm text-ink-muted">
              Looking for more?{" "}
              <Link href="/cars" className="font-semibold text-primary-700 hover:underline">
                View all cars
              </Link>
            </p>
          )}
        </>
      )}
    </div>
  );
}

function EmptyState({ signedIn }: { signedIn: boolean }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface px-6 py-10 text-center shadow-card sm:py-12">
      <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-danger-50 text-danger-600">
        <Heart className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="mt-4 font-display text-xl font-bold tracking-tight text-ink-strong">No saved cars yet</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
        Tap the heart on any car to save it here and come back to it later.
      </p>
      <Link href="/cars" className="btn btn-cta mt-6 rounded-xl px-6 py-3 text-base font-bold">
        Browse cars
      </Link>
      {!signedIn && (
        <p className="mt-4 text-sm text-ink-muted">
          Saved cars on another device?{" "}
          <Link href="/login" className="font-semibold text-primary-700 hover:underline">
            Log in
          </Link>
        </p>
      )}
    </div>
  );
}

function SkeletonGrid({ count }: { count: number }) {
  return (
    <ul aria-hidden className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
          <div className="aspect-[4/3] animate-pulse bg-surface-alt" />
          <div className="space-y-2 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-surface-alt" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-surface-alt" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-surface-alt pt-3" />
          </div>
        </li>
      ))}
    </ul>
  );
}
