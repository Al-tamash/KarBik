/**
 * Root Layout — wraps every page in the app
 *
 * We load Plus Jakarta Sans from Google Fonts via next/font,
 * which automatically optimizes and self-hosts it.
 * The Navbar, CompareBar, and NotificationManager are rendered
 * on every page via this layout.
 */
import { Plus_Jakarta_Sans } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CompareBar from "@/components/CompareBar";
import NotificationManager from "@/components/NotificationManager";
import { ToastProvider } from "@/components/ToastProvider";

/**
 * Plus Jakarta Sans is the primary font defined in the design system.
 * We load it via next/font for automatic optimization and self-hosting.
 * The CSS variable --font-sans is used by globals.css for body text.
 */
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: {
    default: "AutoBazaar — Premium Car Marketplace",
    template: "%s | AutoBazaar",
  },
  description:
    "India's most trusted marketplace to buy and sell certified used cars with inspection reports and dealer reviews.",
  keywords: ["used cars india", "buy second hand cars", "sell car online", "car dealer marketplace"],
  authors: [{ name: "AutoBazaar Team" }],
  manifest: "/manifest.json",
  openGraph: {
    title: "AutoBazaar — Buy & Sell Cars with Trust",
    description: "The premium marketplace for certified used cars.",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "AutoBazaar",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AutoBazaar Marketplace",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AutoBazaar — Premium Car Marketplace",
    description: "Certified used cars with inspection reports.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${jakarta.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <ToastProvider>
          <Script
            src="https://checkout.razorpay.com/v1/checkout.js"
            strategy="beforeInteractive"
          />
          <Navbar />
          <CompareBar />
          <NotificationManager />
          <main className="flex-1">{children}</main>
          <Footer />
        </ToastProvider>
      </body>
    </html>
  );
}
