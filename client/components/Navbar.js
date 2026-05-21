"use client";

/**
 * Navbar — CarDekho-style sticky top navigation
 *
 * WHAT: A clean, professional header that sticks to the top of every page.
 * WHY: The navbar is the first thing users see. A clean, trustworthy navbar
 *      signals quality — just like CarDekho and Spinny have.
 *
 * Key features:
 * - Sticky top with white background + subtle border + shadow
 * - Logo on the left, nav links in center, auth actions on right
 * - Mobile hamburger menu with slide-down drawer
 * - Active link highlighting via usePathname
 */
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Car, Menu, X, Star, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { authClient } from "@/lib/auth-client";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [isOpen, setIsOpen] = useState(false);

  // Check if a given path matches the current URL
  const isActive = (path) => pathname === path;

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  // Navigation links shown to everyone
  const navLinks = [
    { name: "Browse Cars", href: "/cars", icon: Car },
    { name: "Pricing", href: "/pricing", icon: Star },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 h-16">

        {/* ─── Logo ─── */}
        <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-neutral-900 group">
          <Car className="h-6 w-6 text-primary-600 group-hover:scale-110 transition-transform duration-300" />
          Auto<span className="text-primary-600">Bazaar</span>
        </Link>

        {/* ─── Desktop Nav Links (center) ─── */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-sm font-medium transition-colors ${
                isActive(link.href)
                  ? "text-primary-600 font-semibold"
                  : "text-neutral-600 hover:text-primary-600"
              }`}
            >
              {link.name}
            </Link>
          ))}

          {/* Show "Sell Car" link only for dealers */}
          {session?.user?.role === "dealer" && (
            <Link
              href="/dashboard/new"
              className={`text-sm font-medium transition-colors ${
                pathname === "/dashboard/new"
                  ? "text-primary-600 font-semibold"
                  : "text-neutral-600 hover:text-primary-600"
              }`}
            >
              Sell Car
            </Link>
          )}
        </nav>

        {/* ─── Right Actions ─── */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    pathname.startsWith("/dashboard")
                      ? "text-primary-600"
                      : "text-neutral-600 hover:text-primary-600"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 rounded-lg bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-600 hover:bg-danger-50 hover:text-danger-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white hover:bg-primary-800 transition-colors shadow-sm"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* ─── Mobile Menu Toggle ─── */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex md:hidden p-2 text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* ─── Mobile Menu Drawer ─── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-neutral-100 bg-white overflow-hidden"
          >
            <nav className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                    isActive(link.href)
                      ? "bg-primary-50 text-primary-600"
                      : "text-neutral-700 hover:bg-neutral-50"
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.name}
                </Link>
              ))}

              <div className="h-px bg-neutral-100 my-2" />

              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      pathname.startsWith("/dashboard")
                        ? "bg-primary-50 text-primary-600"
                        : "text-neutral-700 hover:bg-neutral-50"
                    }`}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Link>
                  <button
                    onClick={() => { handleSignOut(); setIsOpen(false); }}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-danger-600 hover:bg-danger-50 transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-2 pt-2">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-neutral-100 py-3 text-sm font-semibold text-neutral-900 hover:bg-neutral-200 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center rounded-xl bg-primary-600 py-3 text-sm font-semibold text-white hover:bg-primary-800 transition-colors"
                  >
                    Register Free
                  </Link>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
