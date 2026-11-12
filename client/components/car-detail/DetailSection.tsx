import React from "react";

/**
 * A page section on the car detail page: an Archivo heading and content between
 * hairlines. Never a card (DESIGN.md, The Cards Are For Repeating Things Rule).
 */
export default function DetailSection({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32 border-t border-border py-8">
      <h2 className="font-display text-2xl font-bold tracking-tight text-ink-strong">{title}</h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}
