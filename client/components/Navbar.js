"use client";

/**
 * Navbar — Shared navigation bar across all pages
 *
 * Shows AutoBazaar logo, navigation links, and auth buttons.
 * When logged in: shows Dashboard link, role badge, and Sign Out.
 * When not logged in: shows Sign In and Get Started buttons.
 */
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const isActive = (path) => pathname === path;

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Logo */}
        <Link href="/" className="text-xl font-bold tracking-tight text-foreground">
          Auto<span className="text-primary">Bazaar</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden sm:flex items-center gap-6">
          <Link
            href="/cars"
            className={`text-sm font-medium transition-colors ${
              isActive("/cars") ? "text-primary" : "text-muted hover:text-foreground"
            }`}
          >
            Browse Cars
          </Link>
        </nav>

        {/* Auth Buttons */}
        <div className="flex items-center gap-3">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  pathname.startsWith("/dashboard") ? "text-primary" : "text-muted hover:text-foreground"
                }`}
              >
                Dashboard
              </Link>
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full capitalize">
                {session.user.role || "buyer"}
              </span>
              <button
                onClick={handleSignOut}
                className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-medium text-muted hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90 transition-opacity"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
