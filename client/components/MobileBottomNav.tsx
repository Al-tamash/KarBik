"use client";

/**
 * WHAT: Sticky bottom navigation bar for mobile users.
 * WHY: Mobile users make up 70%+ of Indian vehicle marketplace traffic.
 *      Spinny and Cars24 use sticky bottom bars to allow instant, thumb-reachable
 *      access to main features without scrolling back to the top navbar.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, SlidersHorizontal, User } from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();

  const navItems = [
    {
      label: "Home",
      icon: Home,
      href: "/"
    },
    {
      label: "Browse",
      icon: Search,
      href: "/cars"
    },
    {
      label: "Compare",
      icon: SlidersHorizontal,
      href: "/compare"
    },
    {
      label: "Account",
      icon: User,
      href: "/dashboard"
    }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 shadow-lg px-4 py-2 flex justify-around items-center pb-safe-bottom select-none">
      {navItems.map((item) => {
        const Icon = item.icon;
        // Strict active state check or sub-path match
        const isActive = 
          item.href === "/" 
            ? pathname === "/" 
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-1.5 py-1 px-3.5 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
              isActive 
                ? "text-primary-600 font-bold" 
                : "text-neutral-500 font-medium hover:text-neutral-900"
            }`}
          >
            <div className={`p-1.5 rounded-lg transition-colors ${isActive ? "bg-primary-50 text-primary-600" : "bg-transparent text-neutral-500"}`}>
              <Icon className="h-5 w-5 shrink-0" />
            </div>
            <span className="text-xs tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
