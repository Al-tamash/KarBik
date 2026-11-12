import Link from "next/link";
import { Mail, Phone, MapPin, ShieldCheck, Car } from "lucide-react";

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
            <Link href="/" className="flex items-center gap-2 font-display text-2xl font-bold tracking-tight text-white select-none group">
              <Car className="h-6 w-6 text-primary-400 group-hover:scale-110 transition-transform duration-300" />
              <span>Kar<span className="text-primary-400">Bik</span></span>
            </Link>
            <p className="text-sm leading-relaxed text-neutral-400">
              A Hyderabad marketplace for used cars from local dealers. Browse listings and talk to KarBik support, who connect you with the dealer. Free for buyers.
            </p>
            {/* Trust Seal */}
            <div className="inline-flex items-center gap-2 bg-neutral-800/50 border border-neutral-700/60 rounded-full px-3 py-1 text-xs text-white">
              <ShieldCheck className="h-4 w-4 text-primary-400" />
              <span>KYC-reviewed dealers · free for buyers</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-bold text-base tracking-tight border-b border-neutral-800 pb-2">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              {[
                { name: "Browse Used Cars", href: "/cars" },
                { name: "How It Works", href: "/how-it-works" },
                { name: "Subscription Plans", href: "/pricing" },
                { name: "About Us", href: "/about" },
                { name: "Contact Us", href: "/contact" },
                { name: "FAQ / Help Guide", href: "/faq" },
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
            <h3 className="text-white font-bold text-base tracking-tight border-b border-neutral-800 pb-2">For Car Dealers</h3>
            <ul className="space-y-2.5 text-sm">
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
            <h3 className="text-white font-bold text-base tracking-tight border-b border-neutral-800 pb-2">Get in Touch</h3>
            <ul className="space-y-3.5 text-sm text-neutral-400">
              <li className="flex gap-3">
                <Mail className="h-5 w-5 text-primary-400 shrink-0 mt-0.5" />
                <div>
                  {/* Change text-neutral-500 to text-neutral-400 for high-contrast visibility on dark bg */}
                  <div className="text-xs text-neutral-400 font-medium">Customer Support</div>
                  <a href="mailto:support@karbik.com" className="text-white hover:text-primary-400 transition-colors">
                    support@karbik.com
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <Phone className="h-5 w-5 text-primary-400 shrink-0 mt-0.5" />
                <div>
                  {/* Change text-neutral-500 to text-neutral-400 for high-contrast visibility on dark bg */}
                  <div className="text-xs text-neutral-400 font-medium">Support (Call / WhatsApp)</div>
                  <a href="tel:+919494720878" className="text-white hover:text-primary-400 transition-colors">
                    94947 20878
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <MapPin className="h-5 w-5 text-primary-400 shrink-0 mt-0.5" />
                <div>
                  {/* Change text-neutral-500 to text-neutral-400 for high-contrast visibility on dark bg */}
                  <div className="text-xs text-neutral-400 font-medium">Operated by Edone Solutions</div>
                  <p className="text-neutral-300">
                    Saqlain Paramount Towers, above Fresh &amp; Fresh Bakers, Viswash Nagar, Mehdipatnam, Hyderabad, Telangana 500006
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
            © {new Date().getFullYear()} KarBik India. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <Link href="/privacy" className="hover:text-neutral-300 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-neutral-300 transition-colors">Terms of Service</Link>
            <Link href="/about" className="hover:text-neutral-300 transition-colors">About</Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
