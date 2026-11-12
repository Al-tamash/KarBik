"use client";

import React from "react";
import { Star } from "lucide-react";
import type { ApiReview } from "@/lib/api-types";

/**
 * Reviews of the dealer behind this car, as plain rows. Rendered only when a real
 * review exists or this buyer is allowed to leave one. Nothing is invented.
 */
export default function DealerReviews({
  reviews,
  canReview,
  hasReviewed,
  form,
  setForm,
  submitting,
  onSubmit,
}: {
  reviews: ApiReview[];
  canReview: boolean;
  hasReviewed: boolean;
  form: { rating: number; comment: string };
  setForm: React.Dispatch<React.SetStateAction<{ rating: number; comment: string }>>;
  submitting: boolean;
  onSubmit: (e?: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div>
      {reviews.length > 0 && (
        <ul className="divide-y divide-border border-y border-border">
          {reviews.slice(0, 4).map((r, i) => (
            <li key={i} className="py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ink-strong">{r.buyerName || "Verified buyer"}</p>
                <p className="flex items-center gap-0.5" aria-label={`${r.rating} out of 5 stars`}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      aria-hidden
                      className={`h-4 w-4 ${n <= r.rating ? "fill-warning-400 text-warning-400" : "text-border-strong"}`}
                    />
                  ))}
                </p>
              </div>
              {r.comment && <p className="mt-1.5 max-w-prose text-sm text-ink-muted">{r.comment}</p>}
            </li>
          ))}
        </ul>
      )}

      {canReview && !hasReviewed && (
        <form onSubmit={onSubmit} className="mt-6 max-w-xl">
          <h3 className="text-base font-bold text-ink-strong">Review this dealer</h3>
          <div className="mt-2 flex" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={n === form.rating}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                onClick={() => setForm((p) => ({ ...p, rating: n }))}
                className="flex h-11 w-11 items-center justify-center"
              >
                <Star className={`h-6 w-6 ${n <= form.rating ? "fill-warning-400 text-warning-400" : "text-ink-subtle"}`} aria-hidden />
              </button>
            ))}
          </div>
          <label htmlFor="review-comment" className="label mt-2">
            Your experience
          </label>
          <textarea
            id="review-comment"
            value={form.comment}
            onChange={(e) => setForm((p) => ({ ...p, comment: e.target.value }))}
            rows={3}
            required
            className="input resize-none"
          />
          <button
            type="submit"
            disabled={submitting}
            className="btn btn-md mt-3 cursor-pointer bg-ink-strong text-surface hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : "Submit review"}
          </button>
        </form>
      )}
    </div>
  );
}
