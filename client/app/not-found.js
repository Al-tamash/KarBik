/**
 * WHAT: Custom 404 Not Found page.
 * WHY: Without this, users who hit invalid URLs see the default Next.js 404 page
 *      which has zero brand styling. A branded 404 keeps users engaged and
 *      guides them back to useful pages instead of bouncing.
 *
 * This is a Server Component — Next.js automatically renders this when
 * no route matches the requested URL.
 */

import Link from "next/link";
import { Car, Search, Home, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center bg-neutral-50 px-4 py-16">
      <div className="text-center max-w-md mx-auto">

        {/* Visual — Clean animated car icon, not an emoji */}
        <div className="relative mb-8">
          <div className="h-24 w-24 mx-auto rounded-full bg-primary-50 border border-primary-100 flex items-center justify-center">
            <Car className="h-10 w-10 text-primary-600 animate-scale-in" />
          </div>
          {/* Subtle floating "404" above the icon */}
          <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-7xl font-black text-neutral-200/70 select-none pointer-events-none tracking-tighter">
            404
          </span>
        </div>

        {/* Message */}
        <h1 className="text-2xl md:text-3xl font-black text-neutral-900 tracking-tight mb-3">
          This road doesn&apos;t exist
        </h1>
        <p className="text-sm text-neutral-500 leading-relaxed mb-8 max-w-sm mx-auto">
          The page you&apos;re looking for might have been moved, deleted, or never existed. Let&apos;s get you back on track.
        </p>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
          <Link
            href="/cars"
            className="inline-flex items-center gap-2 bg-white border border-neutral-300 text-neutral-700 hover:border-primary-400 hover:text-primary-600 px-6 py-3 rounded-xl font-bold text-sm transition-all"
          >
            <Search className="h-4 w-4" />
            Browse Cars
          </Link>
        </div>
      </div>
    </div>
  );
}
