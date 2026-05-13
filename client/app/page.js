import Link from "next/link";

/**
 * Home Page — Landing page with hero section and CTA
 *
 * This is the first thing visitors see. It has a clear value proposition
 * and a prominent "Browse Cars" button that leads to the /cars page.
 */
export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-57px)] bg-slate-50 px-4">
      <main className="text-center max-w-xl">
        {/* Decorative emoji */}
        <div className="text-5xl mb-6">🚗</div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
          Find Your Perfect
          <span className="text-primary"> Car</span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg text-muted mb-8 max-w-md mx-auto leading-relaxed">
          AutoBazaar connects buyers with trusted dealers.
          Browse listings, compare prices, and find the right car for you.
        </p>

        {/* CTA Buttons */}
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/cars"
            className="rounded-xl bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground hover:opacity-90 active:opacity-80 transition-opacity shadow-md shadow-primary/20"
          >
            Browse Cars →
          </Link>
          <Link
            href="/register"
            className="rounded-xl border-2 border-border px-8 py-3.5 text-sm font-semibold text-foreground hover:bg-white hover:border-muted transition-colors"
          >
            List Your Car
          </Link>
        </div>

        {/* Trust line */}
        <p className="mt-10 text-xs text-muted-foreground">
          Free to browse • No registration required • Trusted dealers
        </p>
      </main>
    </div>
  );
}
