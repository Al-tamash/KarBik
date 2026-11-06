"use client";

/**
 * WHAT: Global error boundary for the entire application.
 * WHY: If any page crashes in production (e.g., a component throws an error),
 *      without this file users see an ugly unbranded error screen.
 *      This catches the error, shows a professional recovery UI,
 *      and gives users a "Try Again" button to reset the page.
 *
 * CONCEPT: Error Boundaries
 * Think of this like a safety net at a circus. If a performer (component)
 * falls, the safety net (error boundary) catches them and prevents the
 * entire show (app) from crashing. In Next.js, `error.js` is automatically
 * used as the error boundary for every route segment.
 *
 * NOTE: This must be a Client Component ("use client") because error
 * boundaries require React hooks (useEffect) and the `reset` function.
 */

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // Log the error to help with debugging — in production, you'd send this
  // to an error tracking service like Sentry instead of console.error
  useEffect(() => {
    console.error("KarBik caught error:", error);
  }, [error]);

  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center bg-neutral-50 px-4 py-16">
      <div className="text-center max-w-md mx-auto">

        {/* Visual — Warning icon in a branded circle */}
        <div className="h-20 w-20 mx-auto rounded-full bg-danger-50 border border-danger-100 flex items-center justify-center mb-6">
          <AlertTriangle className="h-9 w-9 text-danger-500" />
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight mb-3">
          Something went wrong
        </h1>
        <p className="text-sm text-neutral-500 leading-relaxed mb-8 max-w-sm mx-auto">
          We hit an unexpected error. This has been logged and our team will look into it. You can try again or go back to the homepage.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98] cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-white border border-neutral-300 text-neutral-700 hover:border-primary-400 hover:text-primary-600 px-6 py-3 rounded-xl font-bold text-sm transition-all"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
