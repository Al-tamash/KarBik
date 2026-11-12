/**
 * Root Layout — wraps every page in the app
 *
 * We load Inter from Google Fonts via next/font,
 * which automatically optimizes and self-hosts it.
 * The Navbar, CompareBar, and NotificationManager are rendered
 * on every page via this layout.
 */
import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CompareBar from "@/components/CompareBar";
import NotificationManager from "@/components/NotificationManager";
import MobileBottomNav from "@/components/MobileBottomNav";
import { ToastProvider } from "@/components/ToastProvider";

/**
 * Inter is the body/UI face defined in the design system.
 * Neutral, engineered, and highly legible at small sizes — right for
 * data-dense listing cards. The CSS variable --font-sans is used by
 * globals.css for body text.
 */
// Fonts are self-hosted (app/fonts, OFL licence). next/font/google downloaded them at
// BUILD time and the first build after a code change failed 3 times out of 5.
const inter = localFont({
  src: "./fonts/inter-latin.woff2",
  variable: "--font-sans",
  display: "swap",
  weight: "300 800",
  fallback: ["system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
});

/**
 * Archivo is the automotive grotesque used ONLY for display headlines
 * (.heading-*, font-display). Bold and tightly tracked, it reads like
 * vehicle badging / engineering brochures rather than an editorial serif.
 * Body text never uses this face — see globals.css DESIGN RULES.
 */
const archivo = localFont({
  src: "./fonts/archivo-latin.woff2",
  variable: "--font-heading",
  display: "swap",
  weight: "400 900",
  fallback: ["system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
});

/**
 * Anti-flash theme bootstrap — runs before first paint (and before React
 * hydrates) so a dark-mode user never sees a white flash. Must stay in sync
 * with components/ThemeToggle.tsx (same localStorage key + system fallback).
 */
const themeBootstrap = `(function(){try{var t=localStorage.getItem('ab-theme');var d=t==='dark'||((t===null||t==='system')&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "KarBik: used cars from local dealers in Hyderabad",
    template: "%s | KarBik",
  },
  // Site-wide fallback text. PRODUCT.md: claims literally true, no superlatives, nothing
  // "certified", no reviews or inspection promises (not every car has a report).
  description:
    "KarBik is a Hyderabad marketplace for used cars from local dealers. Browse and compare cars, tell KarBik support which one you like, and support connects you with the dealer. Free for buyers.",
  keywords: ["used cars hyderabad", "second hand cars hyderabad", "used car dealers hyderabad", "compare used cars"],
  authors: [{ name: "KarBik Team" }],
  manifest: "/manifest.json",
  // The share image comes from app/opengraph-image.tsx and app/twitter-image.tsx.
  openGraph: {
    title: "KarBik: used cars from local dealers in Hyderabad",
    description: "Browse and compare used cars. KarBik support connects you with the dealer. Free for buyers.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "KarBik",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KarBik: used cars from local dealers in Hyderabad",
    description: "Browse and compare used cars. KarBik support connects you with the dealer. Free for buyers.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html data-scroll-behavior="smooth"
      lang="en"
      className={`${inter.variable} ${archivo.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        {/* Anti-flash theme bootstrap — runs before any content paints so a
            dark-mode user never sees a white flash. Kept as the FIRST node of
            <body> (App Router forbids manual <head> tags). */}
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
        {/* 
          Razorpay checkout.js — loaded lazily after page is idle.
          "lazyOnload" is correct here: Razorpay is only needed when 
          the user clicks a payment button, not before the page hydrates.
          Using "beforeInteractive" caused React 19 to warn about script 
          tags being injected during hydration of the React component tree.
        */}
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
        <ToastProvider>
          <Navbar />
          <CompareBar />
          <NotificationManager />
          <MobileBottomNav />
          <main className="flex-1 pb-16 lg:pb-0">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
