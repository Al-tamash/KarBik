"use client";

/**
 * Compare page: owns the list of cars being compared and the data behind it.
 *
 * The list lives in localStorage ("compareCars", the same key the listing card's
 * compare icon writes) and is mirrored into the URL as ?cars=id,id so a comparison
 * can be sent to someone. A link with ?cars= wins over the saved list.
 *
 * States: loading (skeleton columns), 0 cars (a rail of real cars to start with),
 * 1 car (that car plus similar cars to add), 2-3 cars (the table). A car that was
 * sold or taken down is dropped from the list and the buyer is told.
 */

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import type { ApiCar } from "@/lib/api-types";
import { displayCarName } from "@/lib/car-name";
import { formatPrice } from "@/lib/car-format";
import { toBuyerCar } from "@/lib/buyer-car";
import { MAX_COMPARE } from "@/lib/compare";
import { useLeadFlow } from "@/lib/use-lead-flow";
import LeadSheet from "@/components/car-detail/LeadSheet";
import SimilarCars from "@/components/car-detail/SimilarCars";
import CompareTable from "./CompareTable";

const KEY = "compareCars";

/** The saved list, or null when storage is blocked (so "empty" and "unreadable" differ). */
function readStored(): string[] | null {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string").slice(0, MAX_COMPARE) : [];
  } catch {
    return null;
  }
}

function writeStored(ids: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* storage blocked: the list just lives for this visit */
  }
  window.dispatchEvent(new Event("compareChanged"));
}

/** ?cars=a,b,c → ids, or null when the link has no cars parameter. */
function readUrl(): string[] | null {
  const raw = new URLSearchParams(window.location.search).get("cars");
  if (raw === null) return null;
  return [...new Set(raw.split(",").map((s) => s.trim()).filter((s) => s.length === 36))].slice(0, MAX_COMPARE);
}

function Skeleton({ n }: { n: number }) {
  return (
    <div aria-busy="true" aria-label="Loading comparison" className="pt-3">
      <div className="grid gap-x-3 md:grid-cols-[10rem_minmax(0,1fr)] md:gap-x-6">
        <span className="hidden md:block" />
        <div className="grid gap-x-3 sm:gap-x-5" style={{ gridTemplateColumns: `repeat(${Math.max(n, 2)}, minmax(0, 1fr))` }}>
          {Array.from({ length: Math.max(n, 2) }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[4/3] rounded-xl bg-surface-alt" />
              <div className="mt-3 h-4 w-4/5 rounded bg-surface-alt" />
              <div className="mt-2 h-5 w-1/2 rounded bg-surface-alt" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CompareView() {
  const [ids, setIds] = useState<string[] | null>(null);
  const [cars, setCars] = useState<ApiCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [failedIds, setFailedIds] = useState<string[]>([]);
  const [goneCount, setGoneCount] = useState(0);
  const [suggestions, setSuggestions] = useState<ApiCar[] | null>(null);
  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [shareNote, setShareNote] = useState("");
  const [retry, setRetry] = useState(0);

  const cache = useRef(new Map<string, ApiCar>());
  const gone = useRef(new Set<string>());

  const lead = useLeadFlow({ leadSource: "compare" });

  /* Read the list once on arrival (a shared link wins), then follow the listing
     cards' compare icons through the "compareChanged" event. */
  useEffect(() => {
    const fromUrl = readUrl();
    const stored = readStored();
    const initial = fromUrl ?? stored ?? [];
    if (fromUrl && fromUrl.join(",") !== (stored ?? []).join(",")) writeStored(fromUrl);
    setIds(initial);

    // Other cards' compare icons (and other tabs) change the saved list. If storage is
    // blocked it cannot be read back, and the list the page holds stays as it is.
    const sync = () => {
      const next = readStored();
      if (next === null) return;
      setIds((prev) => (prev && prev.join(",") === next.join(",") ? prev : next));
    };
    window.addEventListener("compareChanged", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("compareChanged", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  /* Keep the address bar equal to the list, so "copy link" is the comparison. */
  const idsKey = ids ? ids.join(",") : null;
  useEffect(() => {
    if (idsKey === null) return;
    const url = idsKey ? `/compare?cars=${idsKey}` : "/compare";
    window.history.replaceState(null, "", url);
  }, [idsKey]);

  /* Fetch the cars that are not loaded yet. view=0 so opening a comparison does not
     add a "view" to every car in it. */
  useEffect(() => {
    if (ids === null) return;
    let cancelled = false;
    const need = ids.filter((id) => !cache.current.has(id) && !gone.current.has(id));

    (async () => {
      if (need.length > 0) {
        setLoading(true);
        await Promise.all(
          need.map(async (id) => {
            try {
              const res = await fetch(`/api/cars/${id}?view=0`);
              if (res.status === 404 || res.status === 410) {
                gone.current.add(id);
                return;
              }
              if (!res.ok) throw new Error(String(res.status));
              cache.current.set(id, toBuyerCar((await res.json()) as ApiCar));
            } catch {
              /* stays uncached: reported below as "could not load", never silently dropped */
            }
          }),
        );
      }
      if (cancelled) return;

      const missing = ids.filter((id) => gone.current.has(id));
      if (missing.length > 0) {
        setGoneCount((c) => c + missing.length);
        const kept = ids.filter((id) => !gone.current.has(id));
        setIds(kept);
        writeStored(kept);
      }
      setCars(ids.filter((id) => cache.current.has(id)).map((id) => cache.current.get(id)!));
      setFailedIds(ids.filter((id) => !cache.current.has(id) && !gone.current.has(id)));
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
    // `retry` re-runs a failed load.
  }, [ids, retry]);

  /* Cars to add: with one car chosen, the same body type nearest in price; with none,
     the newest cars. Never a car that is already in the comparison. */
  const only = cars.length === 1 ? cars[0] : null;
  const needSuggestions = !loading && ids !== null && cars.length < 2;
  const suggestKey = needSuggestions ? (only ? `b:${only.bodyType}` : "all") : "";
  useEffect(() => {
    if (!suggestKey) return;
    let cancelled = false;
    setSuggestions(null);
    const qs = only ? `bodyType=${encodeURIComponent(only.bodyType)}&limit=20` : "limit=8";
    fetch(`/api/cars?${qs}`)
      .then((r) => (r.ok ? r.json() : { cars: [] }))
      .then((d: { cars?: ApiCar[] }) => {
        if (cancelled) return;
        const chosen = new Set(ids ?? []);
        const base = only?.price ?? 0;
        const list = (d.cars ?? []).filter((c) => !chosen.has(c.id));
        if (only) list.sort((a, b) => Math.abs(a.price - base) - Math.abs(b.price - base));
        setSuggestions(list.slice(0, only ? 4 : 8).map(toBuyerCar));
      })
      .catch(() => {
        if (!cancelled) setSuggestions([]);
      });
    return () => {
      cancelled = true;
    };
    // `ids` only matters through the cars already chosen, which `suggestKey` follows.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [suggestKey, idsKey]);

  /* The page keeps its own list, so it still works when storage is blocked. */
  const update = useCallback((next: string[]) => {
    setIds(next);
    writeStored(next);
  }, []);
  const remove = useCallback((id: string) => update((ids ?? []).filter((x) => x !== id)), [ids, update]);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Compare cars on KarBik", url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareNote("Link copied.");
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setShareNote("Copy the link from the address bar.");
    }
  }

  const waiting = ids === null || loading;
  const count = ids?.length ?? 0;

  return (
    <div className="bg-surface pb-28 lg:pb-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <Link
          href="/cars"
          className="inline-flex min-h-11 items-center gap-1.5 pt-2 text-sm font-semibold text-ink-muted hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Used cars in Hyderabad
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-ink-strong">Compare cars</h1>
          {!waiting && cars.length >= 2 && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={share}
                className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-primary-600 hover:underline"
              >
                Share comparison
              </button>
              <button
                type="button"
                onClick={() => update([])}
                className="inline-flex min-h-11 items-center px-2 text-sm font-semibold text-ink-muted hover:text-danger-700 hover:underline"
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        <div aria-live="polite" className="empty:hidden">
          {shareNote && <p className="mt-1 text-sm text-ink-muted">{shareNote}</p>}
          {goneCount > 0 && (
            <p className="mt-1 text-sm text-ink-muted">
              {goneCount === 1 ? "A car you added is" : `${goneCount} cars you added are`} no longer listed and{" "}
              {goneCount === 1 ? "was" : "were"} removed.
            </p>
          )}
        </div>

        {waiting ? (
          <Skeleton n={count} />
        ) : failedIds.length > 0 && cars.length < 2 ? (
          <div className="py-12">
            <p className="text-base font-semibold text-ink-strong">We could not load all your cars.</p>
            <p className="mt-1 text-sm text-ink-muted">Check your connection and try again.</p>
            <button type="button" onClick={() => setRetry((n) => n + 1)} className="btn btn-outline btn-md mt-4">
              Try again
            </button>
          </div>
        ) : cars.length >= 2 ? (
          <>
            {failedIds.length > 0 && (
              <p role="alert" className="mt-1 text-sm text-danger-700">
                {failedIds.length === 1 ? "One car" : `${failedIds.length} cars`} could not be loaded and{" "}
                {failedIds.length === 1 ? "is" : "are"} not shown.{" "}
                <button type="button" onClick={() => setRetry((n) => n + 1)} className="font-semibold underline">
                  Try again
                </button>
              </p>
            )}
            <p className="mt-1 max-w-prose text-base text-ink-muted">
              Side by side, from what each dealer listed. KarBik checks the RC; everything else is as reported.
            </p>

            <button
              type="button"
              role="switch"
              aria-checked={onlyDifferences}
              onClick={() => setOnlyDifferences((v) => !v)}
              className="mt-2 inline-flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold text-ink-strong"
            >
              <span
                aria-hidden
                className={`relative h-6 w-10 shrink-0 rounded-full transition-colors ${
                  onlyDifferences ? "bg-primary-600" : "bg-ink-subtle"
                }`}
              >
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    onlyDifferences ? "translate-x-[18px]" : "translate-x-0.5"
                  }`}
                />
              </span>
              Show only differences
            </button>

            <CompareTable
              cars={cars}
              onlyDifferences={onlyDifferences}
              onRemove={remove}
              uiFor={lead.uiFor}
              busy={lead.busy}
              onAsk={(car, action) => void lead.request({ id: car.id, label: displayCarName(car) }, action)}
            />

            {cars.length < MAX_COMPARE && (
              <p className="pt-8 text-sm text-ink-muted">
                You can compare up to {MAX_COMPARE} cars.{" "}
                <Link href="/cars" className="font-semibold text-primary-600 hover:underline">
                  Add another car
                </Link>
              </p>
            )}
          </>
        ) : (
          <div className="pt-4">
            {only ? (
              <div className="border-y border-border py-4">
                <p className="text-sm text-ink-muted">You picked</p>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-x-4">
                  <p className="min-w-0 text-base font-bold text-ink-strong">
                    {displayCarName(only)} <span className="font-extrabold tabular-nums">· {formatPrice(only.price)}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => remove(only.id)}
                    className="inline-flex min-h-11 items-center text-sm font-semibold text-ink-muted underline-offset-2 hover:text-danger-700 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : null}

            <h2 className="mt-8 font-display text-2xl font-bold tracking-tight text-ink-strong">
              {only ? "Add one more car" : "Pick two or three cars"}
            </h2>
            <p className="mt-1 max-w-prose text-base text-ink-muted">
              Tap the compare icon on a car&apos;s photo to put it here. You can compare up to {MAX_COMPARE}.
            </p>

            <div className="mt-5">
              {suggestions === null ? (
                <p className="text-sm text-ink-muted" role="status">
                  Finding cars to add…
                </p>
              ) : suggestions.length >= 2 ? (
                <SimilarCars cars={suggestions} wide />
              ) : (
                <Link href="/cars" className="btn btn-cta btn-md">
                  Browse used cars
                </Link>
              )}
            </div>
          </div>
        )}
      </div>

      <LeadSheet {...lead.sheetProps} />
    </div>
  );
}
