"use client";

/**
 * The comparison itself: a sticky row of cars, then grouped rows of facts.
 *
 * Phones put each row's label ABOVE its values so up to three cars fit across
 * 375px with no sideways scroll; from md the label becomes a left column.
 * Nothing here is a card: groups are Archivo headings between hairlines
 * (DESIGN.md, The Cards Are For Repeating Things Rule).
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Car as CarIcon, Check, ChevronDown, Minus, ShieldCheck } from "lucide-react";
import cloudinaryLoader from "@/lib/cloudinary-loader";
import type { ApiCar } from "@/lib/api-types";
import { displayCarName } from "@/lib/car-name";
import { formatPrice } from "@/lib/car-format";
import { buildCompareGroups, buildFeatureGroups, type CompareCell } from "@/lib/compare";
import type { InquiryUi } from "@/components/car-detail/ContactActions";

type Props = {
  cars: ApiCar[];
  onlyDifferences: boolean;
  onRemove: (id: string) => void;
  uiFor: (carId: string) => InquiryUi;
  busy: boolean;
  onAsk: (car: ApiCar, action: "whatsapp" | "callback") => void;
};

const LABEL_COL = "md:grid md:grid-cols-[10rem_minmax(0,1fr)] md:gap-x-6";

/** Same column count in every row, so the cars line up. */
function Columns({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="grid gap-x-2 sm:gap-x-5" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
      {children}
    </div>
  );
}

function Shell({
  label,
  n,
  bare = false,
  children,
}: {
  label?: string;
  n: number;
  /** No hairline or padding: a row of the car header. */
  bare?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={`${bare ? "" : "border-t border-border py-3"} ${LABEL_COL} md:items-start`}>
      {label ? (
        <p className="mb-1.5 text-sm text-ink-muted md:mb-0 md:pt-px">{label}</p>
      ) : (
        <span className="hidden md:block" />
      )}
      <Columns n={n}>{children}</Columns>
    </div>
  );
}

function Value({ cell, carName, strong }: { cell: CompareCell; carName: string; strong: boolean }) {
  const tone = cell.verified
    ? "font-semibold text-success-700"
    : cell.warn
      ? "font-semibold text-danger-700"
      : cell.missing
        ? "text-ink-subtle"
        : strong
          ? "font-semibold text-ink-strong"
          : "text-ink";
  return (
    <div className="min-w-0 text-sm leading-snug">
      <p className={`flex items-start gap-1 break-words tabular-nums ${tone}`}>
        <span className="sr-only">{carName}: </span>
        {cell.verified && <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
        <span className="min-w-0">{cell.text}</span>
      </p>
      {cell.note && <p className="mt-0.5 text-xs text-ink-muted">{cell.note}</p>}
    </div>
  );
}

/** Photo and name, linked to the car. Not a heading: the groups below are the h2s of the page. */
function CarLink({ car }: { car: ApiCar }) {
  const name = displayCarName(car);
  const photo = car.images?.[0]?.url;
  const [broken, setBroken] = useState(false);
  return (
    <Link href={`/cars/${car.id}`} className="group block min-w-0">
      <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-alt">
        {photo && !broken ? (
          <Image
            loader={cloudinaryLoader}
            src={photo}
            alt=""
            fill
            sizes="(max-width: 768px) 33vw, 25vw"
            className="object-cover"
            onError={() => setBroken(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-muted">
            <CarIcon className="h-8 w-8 text-border-strong" aria-hidden />
          </div>
        )}
      </div>
      <p className="mt-2 line-clamp-3 text-sm font-bold leading-snug text-ink-strong group-hover:text-primary-700 sm:line-clamp-2 sm:text-base">
        {name}
      </p>
    </Link>
  );
}

export default function CompareTable({ cars, onlyDifferences, onRemove, uiFor, busy, onAsk }: Props) {
  const n = cars.length;
  const [showFeatures, setShowFeatures] = useState(false);
  const headRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);

  /* While the compact bar is up, keyboard focus must not scroll in underneath it. */
  useEffect(() => {
    const root = document.documentElement;
    root.style.scrollPaddingTop = stuck ? "7rem" : "";
    return () => {
      root.style.scrollPaddingTop = "";
    };
  }, [stuck]);

  useEffect(() => {
    const el = headRef.current;
    if (!el) return;
    // The site header is 64px tall; "gone" means the whole block is above it.
    const io = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting && entry.boundingClientRect.top < 64),
      { rootMargin: "-64px 0px 0px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [n]);

  const groups = useMemo(() => buildCompareGroups(cars), [cars]);
  const featureGroups = useMemo(() => buildFeatureGroups(cars), [cars]);

  const visibleGroups = groups
    .map((g) => ({ ...g, rows: onlyDifferences ? g.rows.filter((r) => r.differs) : g.rows }))
    .filter((g) => g.rows.length > 0);

  const visibleFeatureGroups = featureGroups
    .map((g) => ({ ...g, rows: onlyDifferences ? g.rows.filter((r) => r.differs) : g.rows }))
    .filter((g) => g.rows.length > 0);
  const featureCount = visibleFeatureGroups.reduce((sum, g) => sum + g.rows.length, 0);

  const nothingDiffers = onlyDifferences && visibleGroups.length === 0 && featureCount === 0;

  return (
    <div>
      {stuck && (
        <div aria-hidden="true" className="fixed inset-x-0 top-16 z-30 border-b border-border bg-surface">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className={LABEL_COL}>
              <span className="hidden md:block" />
              <Columns n={n}>
                {cars.map((car) => (
                  <div key={car.id} className="flex min-w-0 items-center gap-2 py-2">
                    {car.images?.[0]?.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={car.images[0].url} alt="" className="hidden h-9 w-12 shrink-0 rounded-md object-cover sm:block" />
                    )}
                    <div className="min-w-0 text-xs leading-tight">
                      <p className="truncate font-semibold text-ink-strong">
                        {[car.brand, car.model].filter(Boolean).join(" ") || displayCarName(car)}
                      </p>
                      <p className="font-bold text-ink-strong tabular-nums">{formatPrice(car.price)}</p>
                    </div>
                  </div>
                ))}
              </Columns>
            </div>
          </div>
        </div>
      )}

      {/* Cars. Once this block scrolls away, a one-line bar below the site header keeps
          the columns named (a full-height sticky block would eat a third of a phone). */}
      <div ref={headRef} className="border-b border-border pb-1 pt-3">
        {/* Three aligned rows, so every price and Remove sits on one line however long a name is */}
        <Shell n={n} bare>
          {cars.map((car) => (
            <CarLink key={car.id} car={car} />
          ))}
        </Shell>
        <Shell n={n} bare>
          {cars.map((car) => (
            <div key={car.id} className="min-w-0">
              <p className="mt-1 text-base font-extrabold leading-tight tracking-tight text-ink-strong tabular-nums sm:text-lg">
                {formatPrice(car.price)}
              </p>
              {(car.dealerIsSample || car.dealerProfile?.isSample) && (
                <p className="text-xs text-ink-muted">Sample listing</p>
              )}
            </div>
          ))}
        </Shell>
        <Shell n={n} bare>
          {cars.map((car) => (
            <div key={car.id}>
              <button
                type="button"
                onClick={() => onRemove(car.id)}
                aria-label={`Remove ${displayCarName(car)} from comparison`}
                className="-ml-1 inline-flex min-h-11 items-center px-1 text-sm font-semibold text-ink-muted underline-offset-2 hover:text-danger-700 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </Shell>
      </div>

      {nothingDiffers && (
        <p className="py-6 text-base text-ink" role="status">
          These cars say the same thing on every row we have. Turn off &ldquo;Show only differences&rdquo; to see them.
        </p>
      )}

      {visibleGroups.map((group) => (
        <section key={group.key} aria-labelledby={`cmp-${group.key}`} className="pt-8">
          <h2 id={`cmp-${group.key}`} className="font-display text-xl font-bold tracking-tight text-ink-strong">
            {group.title}
          </h2>
          {group.note && <p className="mt-1 max-w-prose text-sm text-ink-muted">{group.note}</p>}
          <div className="mt-3">
            {group.rows.map((r) => (
              <Shell key={r.key} label={r.label} n={n}>
                {r.cells.map((cell, i) => (
                  <Value key={cars[i].id} cell={cell} carName={displayCarName(cars[i])} strong={r.differs} />
                ))}
              </Shell>
            ))}
          </div>
        </section>
      ))}

      {featureGroups.length > 0 && featureCount > 0 && (
        <section aria-labelledby="cmp-features" className="pt-8">
          <div className="flex flex-wrap items-center justify-between gap-x-4">
            <h2 id="cmp-features" className="font-display text-xl font-bold tracking-tight text-ink-strong">
              Features
            </h2>
            <button
              type="button"
              onClick={() => setShowFeatures((v) => !v)}
              aria-expanded={showFeatures}
              aria-controls="cmp-features-body"
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline"
            >
              {showFeatures ? "Hide features" : `Show features (${featureCount})`}
              <ChevronDown className={`h-4 w-4 transition-transform ${showFeatures ? "rotate-180" : ""}`} aria-hidden />
            </button>
          </div>
          {showFeatures && (
            <div id="cmp-features-body">
              {visibleFeatureGroups.map((g) => (
                <div key={g.key} className="mt-4">
                  <h3 className="text-base font-bold text-ink-strong">{g.title}</h3>
                  <div className="mt-1">
                    {g.rows.map((r) => (
                      <Shell key={r.key} label={r.label} n={n}>
                        {r.has.map((has, i) => (
                          <div key={cars[i].id} className="min-w-0 text-sm">
                            {has ? (
                              <Check className="h-4 w-4 text-ink-strong" aria-hidden />
                            ) : (
                              <Minus className="h-4 w-4 text-ink-subtle" aria-hidden />
                            )}
                            <span className="sr-only">
                              {displayCarName(cars[i])}: {has ? "has this" : "does not list this"}
                            </span>
                          </div>
                        ))}
                      </Shell>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Next step: ask KarBik about the car you lean towards. Outline, not orange:
          three of the same primary button would break the One Orange Rule. */}
      <section aria-labelledby="cmp-next" className="pt-8">
        <h2 id="cmp-next" className="font-display text-xl font-bold tracking-tight text-ink-strong">
          Ask KarBik
        </h2>
        <p className="mt-1 max-w-prose text-sm text-ink-muted">
          Support talks to you first, then connects you with the dealer. It is free for buyers.
        </p>
        <div className="mt-3 border-t border-border pt-3">
          <div className={LABEL_COL}>
            <span className="hidden md:block" />
            <Columns n={n}>
              {cars.map((car) => {
                const name = displayCarName(car);
                const ui = uiFor(car.id);
                return (
                  <div key={car.id} className="min-w-0">
                    <button
                      type="button"
                      onClick={() => onAsk(car, "whatsapp")}
                      disabled={busy || ui.sent}
                      aria-label={ui.sent ? `Request sent for ${name}` : `Ask KarBik about ${name} on WhatsApp`}
                      className="btn btn-outline btn-md btn-full cursor-pointer !px-2 disabled:opacity-60"
                    >
                      {ui.sent ? "Sent" : ui.sending ? "Connecting…" : "Ask KarBik"}
                    </button>
                    {!ui.sent && (
                      <button
                        type="button"
                        onClick={() => onAsk(car, "callback")}
                        disabled={busy}
                        aria-label={`Request a call back about ${name}`}
                        className="mt-1 inline-flex min-h-11 w-full items-center justify-center text-sm font-semibold text-primary-600 hover:underline disabled:opacity-60"
                      >
                        Call back
                      </button>
                    )}
                  </div>
                );
              })}
            </Columns>
          </div>
          <div className="mt-2 space-y-1" aria-live="polite">
            {cars.map((car) => {
              const ui = uiFor(car.id);
              if (!ui.message) return null;
              return (
                <p
                  key={car.id}
                  role={ui.status === "error" ? "alert" : "status"}
                  className={`text-sm ${ui.status === "error" ? "text-danger-700" : "text-ink"}`}
                >
                  <span className="font-semibold">{displayCarName(car)}:</span> {ui.message}
                </p>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
