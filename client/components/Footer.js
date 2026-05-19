import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck } from "lucide-react";

/**
 * Footer Component — Reusable premium footer
 * 
 * WHAT: Clean, editorial-grade dark footer rendered globally at the bottom of every page.
 * WHY: Professional footer signals brand credibility, provides necessary SEO navigation, 
 *      and builds instant trust with buyers and dealers alike.
 */
export default function Footer() {
  return (
    <footer className="bg-neutral-900 border-t-2 border-primary-600/20 text-neutral-400 pt-16 pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        
        {/* ─── Main Footer Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          
          {/* Column 1: Brand Info & Socials */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-extrabold tracking-tight text-white select-none">
              <span className="text-2xl">🚗</span>
              Auto<span className="text-primary-600">Bazaar</span>
            </Link>
            <p className="text-body-sm leading-relaxed text-neutral-400">
              Hyderabad&apos;s most trusted premium marketplace for certified used cars. Buying and selling with 200-point assurance inspections and dealer warranty pillars.
            </p>
            {/* Trust Seal */}
            <div className="inline-flex items-center gap-2 bg-neutral-800/50 border border-neutral-700/60 rounded-full px-3 py-1 text-xs text-white">
              <ShieldCheck className="h-4 w-4 text-primary-400" />
              <span>100% Verified Dealer Network</span>
            </div>
            {/* Social Icons Row */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-neutral-800/80 border border-neutral-700/50 text-neutral-400 rounded-lg transition-all duration-200 hover:bg-primary-600 hover:text-white"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-neutral-800/80 border border-neutral-700/50 text-neutral-400 rounded-lg transition-all duration-200 hover:bg-primary-600 hover:text-white"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-neutral-800/80 border border-neutral-700/50 text-neutral-400 rounded-lg transition-all duration-200 hover:bg-primary-600 hover:text-white"
              >
                <svg className="h-4 w-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-neutral-800/80 border border-neutral-700/50 text-neutral-400 rounded-lg transition-all duration-200 hover:bg-primary-600 hover:text-white"
              >
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.003 3.003 0 0 0 .5 6.163C0 8.024 0 12 0 12s0 3.976.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.976 24 12 24 12s0-3.976-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-heading-sm tracking-tight border-b border-neutral-800 pb-2">Quick Links</h3>
            <ul className="space-y-2.5 text-body-sm">
              {[
                { name: "Browse Used Cars", href: "/cars" },
                { name: "Subscription Plans", href: "/pricing" },
                { name: "Compare Listings", href: "/compare" },
                { name: "Register Free", href: "/register" }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-primary-400 transition-colors flex items-center gap-1 group">
                    <span className="w-1.5 h-1.5 bg-neutral-700 rounded-full group-hover:bg-primary-400 transition-all duration-200 mr-1.5"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: For Dealers */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-heading-sm tracking-tight border-b border-neutral-800 pb-2">For Car Dealers</h3>
            <ul className="space-y-2.5 text-body-sm">
              {[
                { name: "Dealer Dashboard", href: "/dashboard" },
                { name: "Upgrade Membership", href: "/pricing" },
                { name: "Create Car Listing", href: "/dashboard/new" },
                { name: "Authentication Login", href: "/login" }
              ].map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="hover:text-primary-400 transition-colors flex items-center gap-1 group">
                    <span className="w-1.5 h-1.5 bg-neutral-700 rounded-full group-hover:bg-primary-400 transition-all duration-200 mr-1.5"></span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Locations */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-heading-sm tracking-tight border-b border-neutral-800 pb-2">Get in Touch</h3>
            <ul className="space-y-3.5 text-body-sm text-neutral-400">
              <li className="flex gap-3">
                <Mail className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
                <div>
                  {/* Change text-neutral-500 to text-neutral-400 for high-contrast visibility on dark bg */}
                  <div className="text-xs text-neutral-400 font-medium">Customer Support</div>
                  <a href="mailto:support@autobazaar.in" className="text-white hover:text-primary-400 transition-colors">
                    support@autobazaar.in
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <Phone className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
                <div>
                  {/* Change text-neutral-500 to text-neutral-400 for high-contrast visibility on dark bg */}
                  <div className="text-xs text-neutral-400 font-medium">Toll-Free Helpline</div>
                  <a href="tel:18002886229" className="text-white hover:text-primary-400 transition-colors">
                    1800-AUTO-BAZAAR
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 text-primary-600 shrink-0 mt-0.5" />
                <div>
                  {/* Change text-neutral-500 to text-neutral-400 for high-contrast visibility on dark bg */}
                  <div className="text-xs text-neutral-400 font-medium">Corporate Office</div>
                  <p className="text-neutral-300">
                    Viswash Nagar, Mehdipatnam, Hyderabad, Telangana 500028
                  </p>
                </div>
              </li>
            </ul>
          </div>

        </div>

        {/* ─── Bottom Copyright Bar ─── */}
        {/* Change text-neutral-500 to text-neutral-400 for high-contrast visibility on dark bg */}
        <div className="border-t border-neutral-800/80 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
          <div>
            © {new Date().getFullYear()} AutoBazaar India. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-neutral-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-neutral-300 transition-colors">Terms of Service</Link>
            <Link href="/sitemap" className="hover:text-neutral-300 transition-colors">Sitemap</Link>
          </div>
          {/* Change text-neutral-600 to text-neutral-400 for high-contrast signature row */}
          <div className="text-neutral-400">
            Crafted with ❤️ for premium Indian dealerships.
          </div>
        </div>

      </div>
    </footer>
  );
}
