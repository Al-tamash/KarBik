/**
 * WHAT: Global loading state for the application.
 * WHY: When Next.js is fetching data for a Server Component (like the homepage
 *      fetching car stats, or the car detail page fetching a listing),
 *      the user sees nothing — a blank screen. This loading.js file
 *      automatically shows a branded spinner during those transitions.
 *
 * CONCEPT: Suspense Boundaries
 * Next.js wraps each route in a React Suspense boundary. When data is loading,
 * React shows the "fallback" — which is this file. Think of it like a "Please
 * wait" sign at a restaurant while your food is being prepared.
 */

import { Car } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-[calc(100vh-200px)] flex flex-col items-center justify-center bg-neutral-50">
      <div className="flex flex-col items-center gap-4">
        {/* Animated brand icon spinner */}
        <div className="relative">
          {/* Outer spinning ring */}
          <div className="h-14 w-14 rounded-full border-2 border-primary-100 border-t-primary-600 animate-spin" />
          {/* Inner car icon — stays stationary for brand recognition */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Car className="h-5 w-5 text-primary-600" />
          </div>
        </div>

        {/* Loading text */}
        <p className="text-sm font-semibold text-neutral-500 animate-pulse">
          Loading...
        </p>
      </div>
    </div>
  );
}
