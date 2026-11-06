"use client";

/**
 * Reveal — scroll-triggered entrance for MARKETING/STATIC pages only.
 *
 * WHAT: Fades + slides content in the first time it enters the viewport.
 * WHY: The motion decision (see docs/adr + design brief) allows scroll
 *      reveals on marketing surfaces (home, about, how-it-works, pricing)
 *      but NOT on app/data pages, where reveal delays read as latency.
 *
 * Accessibility: <MotionConfig reducedMotion="user"> in ToastProvider wraps
 * the whole app, so framer-motion skips transforms automatically for users
 * with prefers-reduced-motion.
 *
 * Usage (from server components is fine — children are serialised JSX):
 *   <Reveal><h2>…</h2></Reveal>
 *   <Reveal delay={0.1}>…</Reveal>
 */

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export default function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
