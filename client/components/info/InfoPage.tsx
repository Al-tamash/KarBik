import React from "react";

/**
 * The shared shell for KarBik's reading pages (About, Contact, FAQ, How it works).
 * One narrow column on the white surface: h1, one line of intro, then sections divided by
 * hairlines. No cards (nothing here repeats), no eyebrow labels, no hero. The pages carry
 * the words; the shell only sets the measure and the rhythm.
 */
export default function InfoPage({
  title,
  intro,
  children,
}: {
  title: string;
  intro: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-surface">
      <div className="mx-auto max-w-3xl px-4 pb-16 pt-10 sm:px-6 sm:pb-20 sm:pt-14">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink-strong sm:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">{intro}</p>
        {children}
      </div>
    </div>
  );
}

export function InfoSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  const headingId = id ? `${id}-heading` : undefined;
  return (
    <section id={id} aria-labelledby={headingId} className="mt-10 scroll-mt-24 border-t border-border pt-6 sm:mt-12 sm:pt-8">
      <h2 id={headingId} className="font-display text-xl font-bold tracking-tight text-ink-strong sm:text-2xl">
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-relaxed text-ink">{children}</div>
    </section>
  );
}
