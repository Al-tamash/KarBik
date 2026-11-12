"use client";

/**
 * A dealer's storefront: who they are (name, city, verified), two ways to ask KarBik
 * about the showroom, and their live cars in the shared CarCard grid.
 *
 * No street address, map, phone, social links, ratings or "about" text: see
 * .impeccable/surfaces/app-dealer-slug-page-tsx.md. Contact goes through the same lead
 * flow as the car page, so the dealer is named by slug and the sheet is the same.
 */

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Check, Share2 } from "lucide-react";

import CarCard from "@/components/CarCard";
import HowItWorks from "@/components/car-detail/HowItWorks";
import LeadSheet from "@/components/car-detail/LeadSheet";
import {
  CallbackButton,
  InquiryNotice,
  SentConfirmation,
  WhatsAppButton,
} from "@/components/car-detail/ContactActions";
import cloudinaryLoader from "@/lib/cloudinary-loader";
import { useLeadFlow, type LeadTarget } from "@/lib/use-lead-flow";
import type { ApiCar } from "@/lib/api-types";

type SortKey = "newest" | "price-asc" | "price-desc";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "newest", label: "Newest first" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
];

const BODY_LABELS: Record<string, string> = { suv: "SUV", muv: "MUV" };

function bodyLabel(type: string): string {
  return BODY_LABELS[type] ?? type.charAt(0).toUpperCase() + type.slice(1);
}

function ShareButton({ name }: { name: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: `${name} on KarBik`, url });
        return;
      }
    } catch {
      // Dismissed or unsupported: fall through to copying the link.
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard blocked: nothing more to do.
    }
  }

  return (
    <button type="button" onClick={share} className="btn btn-outline btn-md cursor-pointer">
      {copied ? <Check className="h-5 w-5" aria-hidden /> : <Share2 className="h-5 w-5" aria-hidden />}
      <span aria-live="polite">{copied ? "Link copied" : "Share"}</span>
    </button>
  );
}

export default function DealerStorefront({
  slug,
  name,
  city,
  isVerified,
  isSample,
  bannerUrl,
  cars,
}: {
  slug: string;
  name: string;
  city: string;
  isVerified: boolean;
  isSample: boolean;
  bannerUrl: string;
  cars: ApiCar[];
}) {
  const lead = useLeadFlow({ leadSource: "dealer_profile" });
  const target: LeadTarget = { id: slug, label: name, kind: "dealer" };
  const ui = lead.uiFor(slug);

  const [bodyType, setBodyType] = useState("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [bannerFailed, setBannerFailed] = useState(false);

  /* Body types come from this dealer's live stock, so every pill opens a non-empty list. */
  const bodyTypes = useMemo(() => {
    const counts = new Map<string, number>();
    for (const car of cars) {
      if (car.bodyType) counts.set(car.bodyType, (counts.get(car.bodyType) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [cars]);

  const visible = useMemo(() => {
    const list = bodyType === "all" ? [...cars] : cars.filter((c) => c.bodyType === bodyType);
    if (sort === "price-asc") list.sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [cars, bodyType, sort]);

  const count = cars.length;
  const status = [
    isSample ? "Sample showroom" : isVerified ? "Verified dealer" : "",
    city || "Hyderabad",
    `${count} ${count === 1 ? "car" : "cars"}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
      <header className="pt-2 sm:pt-4">
        <Link
          href="/cars"
          className="inline-flex h-11 items-center gap-1.5 text-sm font-semibold text-ink-muted hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          All cars
        </Link>

        {bannerUrl && !bannerFailed && (
          <div className="relative mt-1 aspect-[16/9] overflow-hidden rounded-2xl bg-surface-alt sm:aspect-[3/1]">
            <Image
              loader={cloudinaryLoader}
              src={bannerUrl}
              alt={`${name} showroom`}
              fill
              priority
              sizes="(min-width: 1152px) 1152px, 100vw"
              className="object-cover"
              onError={() => setBannerFailed(true)}
            />
          </div>
        )}

        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-3xl font-bold tracking-tight text-ink-strong sm:text-4xl">{name}</h1>
            <p className="mt-1.5 text-base text-ink-muted tabular-nums">{status}</p>
          </div>

          <div className="space-y-3">
            {!ui.sent && <InquiryNotice ui={ui} />}
            <div className="flex flex-wrap items-center gap-3">
              {ui.sent ? (
                <div className="w-full sm:w-auto sm:max-w-sm">
                  <SentConfirmation />
                </div>
              ) : (
                <>
                  <WhatsAppButton
                    onClick={() => void lead.request(target, "whatsapp")}
                    sending={ui.sending}
                    className="w-full sm:w-auto"
                  />
                  <CallbackButton
                    onClick={() => void lead.request(target, "callback")}
                    sending={ui.sending}
                    className="flex-1 sm:flex-none"
                  />
                </>
              )}
              <ShareButton name={name} />
            </div>
          </div>
        </div>

        {isSample && (
          <p className="mt-4 max-w-2xl text-sm text-ink-muted">
            This is a sample showroom shown for demonstration. Message KarBik support and we will help you find similar
            real cars.
          </p>
        )}
      </header>

      <section aria-labelledby="stock-heading" className="mt-10 border-t border-border pt-8">
        <h2 id="stock-heading" className="font-display text-2xl font-bold tracking-tight text-ink-strong">
          Cars available
        </h2>

        {count === 0 ? (
          <div className="mt-6 max-w-md">
            <p className="text-base text-ink-muted">
              This dealer has no cars listed right now. The listing page shows what is available across Hyderabad.
            </p>
            <Link href="/cars" className="btn btn-outline btn-md mt-4">
              See all cars
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              {bodyTypes.length > 1 ? (
                <div
                  role="group"
                  aria-label="Filter by body type"
                  className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0"
                >
                  {[["all", count] as const, ...bodyTypes].map(([type, n]) => {
                    const active = bodyType === type;
                    return (
                      <button
                        key={type}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setBodyType(type)}
                        className={`h-11 shrink-0 cursor-pointer whitespace-nowrap rounded-full px-4 text-sm font-semibold tabular-nums ${
                          active
                            ? "bg-ink-strong text-surface"
                            : "border border-border text-ink hover:bg-surface-alt"
                        }`}
                      >
                        {type === "all" ? "All" : bodyLabel(type)} {n}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <span />
              )}

              <div className="flex items-center gap-3">
                <label htmlFor="dealer-sort" className="text-sm font-semibold text-ink-muted">
                  Sort
                </label>
                <select
                  id="dealer-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  className="input h-11 w-auto min-w-0 flex-1 md:flex-none"
                >
                  {SORTS.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p role="status" className="sr-only">
              Showing {visible.length} {visible.length === 1 ? "car" : "cars"}
            </p>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {visible.map((car) => (
                <li key={car.id}>
                  <CarCard car={car} />
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section aria-labelledby="how-heading" className="mt-14 border-t border-border pt-8">
        <h2 id="how-heading" className="font-display text-2xl font-bold tracking-tight text-ink-strong">
          How KarBik connects you
        </h2>
        <div className="mt-5">
          <HowItWorks subject="the cars you like" />
        </div>
      </section>

      <LeadSheet {...lead.sheetProps} />
    </div>
  );
}
