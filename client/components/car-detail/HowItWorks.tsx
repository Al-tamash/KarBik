import React from "react";

/** The real lead flow in three steps (PRODUCT.md, Operating Context). No claims beyond it. */
const stepsFor = (subject: string) => [
  {
    title: "Tell KarBik which car you like",
    body: "Message us on WhatsApp or ask for a call back. It is free for buyers.",
  },
  {
    title: "KarBik support talks to you first",
    body: `We confirm what you want to know about ${subject}.`,
  },
  {
    title: "Support connects you with the dealer",
    body: "After that you speak to the dealer about seeing the car.",
  },
];

/* Stacked on phones; three columns from sm so the steps use the full width of the
   section instead of hugging the left edge. No phone number here: the WhatsApp and
   Call back buttons are already on screen. */
export default function HowItWorks({ subject = "this car" }: { subject?: string }) {
  return (
    <ol className="grid gap-6 sm:grid-cols-3 sm:gap-8">
      {stepsFor(subject).map((s, i) => (
        <li key={s.title} className="flex gap-4 sm:flex-col sm:gap-3">
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-alt text-sm font-bold text-ink-strong tabular-nums"
          >
            {i + 1}
          </span>
          <div>
            <h3 className="text-base font-bold leading-snug text-ink-strong sm:text-lg">{s.title}</h3>
            <p className="mt-1 text-sm text-ink-muted">{s.body}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
