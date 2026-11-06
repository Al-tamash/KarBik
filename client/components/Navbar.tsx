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
import { LayoutDashboard, LogOut, Car, Menu, X, Star, Search, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAppSession, authClient } from "@/lib/auth-client";
import ThemeToggle from "@/components/ThemeToggle";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useAppSession();
  const [isOpen, setIsOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Check if a given path matches the current URL
  const isActive = (path: string) => pathname === path;

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/cars?search=${encodeURIComponent(searchQuery.trim())}`);
    setShowSearch(false);
    setSearchQuery("");
  };

  const handleBrandClick = (brand: string) => {
    router.push(`/cars?brand=${encodeURIComponent(brand)}`);
    setShowSearch(false);
  };

  // Navigation links shown to everyone
  const navLinks = [
    { name: "Browse Cars", href: "/cars", icon: Car },
    { name: "Pricing", href: "/pricing", icon: Star },
  ];

  return (
    <header className="sticky top-0 z-50 bg-surface border-b border-border shadow-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 h-16">

        {/* ─── Logo ─── */}
        <Link href="/" className="flex items-center gap-2 py-2 text-xl font-extrabold tracking-tight text-ink-strong group">
          <Car className="h-6 w-6 text-primary-600 group-hover:scale-110 transition-transform duration-300" />
          <span>Kar<span className="text-primary-600">Bik</span></span>
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
                  : "text-ink-muted hover:text-primary-600"
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
                  : "text-ink-muted hover:text-primary-600"
              }`}
            >
              Sell Car
            </Link>
          )}
        </nav>

        {/* ─── Right Actions ─── */}
        <div className="flex items-center gap-3">
          
          {/* Quick Search Button */}
          <button
            onClick={() => setShowSearch(true)}
            className="inline-flex items-center justify-center h-11 w-11 lg:h-9 lg:w-9 text-ink-subtle hover:text-primary-600 hover:bg-surface-alt rounded-full transition-all duration-200 cursor-pointer"
            title="Search vehicles"
          >
            <Search className="h-5 w-5 shrink-0" />
          </button>

          {/* ─── Colour theme (all breakpoints) ─── */}
          <ThemeToggle />

          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <>
                {session.user?.role === "admin" && (
                  <Link
                    href="/admin"
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                      pathname.startsWith("/admin")
                        ? "bg-primary-600 text-white"
                        : "bg-primary-50 text-primary-700 hover:bg-primary-100 border border-primary-200"
                    }`}
                  >
                    <ShieldAlert className="h-3.5 w-3.5" />
                    Admin Portal
                  </Link>
                )}
                <Link
                  href={session.user?.role === "admin" ? "/admin" : "/dashboard"}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                    pathname.startsWith("/dashboard") || (session.user?.role === "admin" && pathname.startsWith("/admin"))
                      ? "text-primary-600"
                      : "text-ink-muted hover:text-primary-600"
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  {session.user?.role === "admin" ? "Admin Panel" : "Dashboard"}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 rounded-lg bg-surface-alt px-3 py-2 text-sm font-medium text-ink-muted hover:bg-danger-50 hover:text-danger-600 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-medium text-ink-muted hover:text-ink-strong transition-colors"
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
            className="flex md:hidden items-center justify-center h-11 w-11 text-ink hover:bg-surface-alt rounded-lg transition-colors"
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
            className="md:hidden border-t border-border bg-surface overflow-hidden"
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
                      : "text-ink hover:bg-surface-alt"
                  }`}
                >
                  <link.icon className="h-5 w-5" />
                  {link.name}
                </Link>
              ))}

              <div className="h-px bg-border my-2" />

              {session ? (
                <>
                  {session.user?.role === "admin" && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-colors ${
                        pathname.startsWith("/admin")
                          ? "bg-primary-600 text-white"
                          : "bg-primary-50 text-primary-700"
                        }`}
                    >
                      <ShieldAlert className="h-5 w-5" />
                      Super Admin Portal
                    </Link>
                  )}
                  <Link
                    href={session.user?.role === "admin" ? "/admin" : "/dashboard"}
                    onClick={() => setIsOpen(false)}
                    className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                      pathname.startsWith("/dashboard") || (session.user?.role === "admin" && pathname.startsWith("/admin"))
                        ? "bg-primary-50 text-primary-600"
                        : "text-ink hover:bg-surface-alt"
                      }`}
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    {session.user?.role === "admin" ? "Admin Control Center" : "Dashboard"}
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
                    className="flex items-center justify-center rounded-xl bg-surface-alt py-3 text-sm font-semibold text-ink-strong hover:bg-border transition-colors"
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

      {/* ─── Search Overlay Modal ─── */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-95 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-24 px-4"
            onClick={() => setShowSearch(false)}
          >
            <motion.div
              initial={{ scale: 0.97, y: -8, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.97, y: -8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-xl bg-surface rounded-2xl overflow-hidden shadow-xl border border-border p-6 flex flex-col text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Input row */}
              <form onSubmit={handleSearchSubmit} className="relative flex items-center mb-6">
                <Search className="absolute left-4 h-5 w-5 text-ink-subtle" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Type brand, model, or body type (e.g. SUV, Tata)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border border-border bg-surface-alt pl-12 pr-12 py-4 text-sm font-medium focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all text-ink-strong"
                />
                {searchQuery && (
                  <button 
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 p-1 hover:bg-border text-ink-subtle hover:text-ink rounded-full transition-colors cursor-pointer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </form>

              {/* Popular Searches */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-ink-subtle select-none">
                  Popular Brand Filters
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  {["Maruti", "Tata", "Toyota", "Kia", "Hyundai", "Mahindra"].map((brand: string) => (
                    <button
                      key={brand}
                      onClick={() => handleBrandClick(brand)}
                      className="px-4 py-2 rounded-xl border border-border hover:border-primary-500 hover:text-primary-600 bg-surface hover:bg-primary-50/10 text-ink-muted text-xs font-bold transition-all cursor-pointer"
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tips footer */}
              <div className="mt-8 border-t border-border pt-4 flex justify-between items-center text-xs font-semibold text-ink-subtle">
                <span>Press Enter to search entire database</span>
                <button 
                  onClick={() => setShowSearch(false)}
                  className="text-primary-600 hover:underline cursor-pointer font-bold"
                >
                  Cancel Escape
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}
