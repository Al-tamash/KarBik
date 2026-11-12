"use client";

import React, { useEffect, useRef } from "react";

/**
 * The frame for every auth page: one centred column under the site header, the same on a
 * phone and a desktop. A heading, one honest line, the form, and a way to the other page.
 * No marketing panel: the buyer came to do one thing.
 *
 * `focusTitle` is for a view that replaces a form (link sent, password changed): the form
 * that held focus is gone, so focus moves to the new heading and screen readers read it.
 */
export default function AuthShell({
  title,
  lead,
  children,
  footer,
  focusTitle = false,
}: {
  title: string;
  lead?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  focusTitle?: boolean;
}) {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (focusTitle) heading.current?.focus();
  }, [focusTitle]);

  return (
    <main className="bg-surface">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] w-full max-w-md flex-col justify-start px-4 py-6 sm:justify-center sm:py-14">
        <h1
          ref={heading}
          tabIndex={-1}
          className="font-display text-3xl font-bold leading-tight tracking-tight text-ink-strong outline-none"
        >
          {title}
        </h1>
        {lead && <p className="mt-2 text-base text-ink-muted">{lead}</p>}
        <div className="mt-6">{children}</div>
        {footer && <div className="mt-4 text-center text-sm text-ink-muted">{footer}</div>}
      </div>
    </main>
  );
}

/** Link in a footer line: a full 44px-tall target, not just the words. */
export const footerLink =
  "inline-flex min-h-11 items-center px-1 font-semibold text-primary-600 hover:underline";

export function FormError({ message, id = "auth-error" }: { message: string; id?: string }) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="rounded-lg border border-danger-600/40 bg-danger-50 px-4 py-3 text-sm text-danger-700"
    >
      {message}
    </p>
  );
}
