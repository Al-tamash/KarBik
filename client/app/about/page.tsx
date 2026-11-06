/**
 * WHAT: About Us page for KarBik.
 * WHY: Trust signal — buyers and dealers want to know who runs the platform.
 *      Google uses About pages as E-E-A-T (Experience, Expertise, Authority, Trust)
 *      signals for SEO ranking. Every competitor (CarDekho, Spinny, Cars24) has one.
 *
 * DESIGN: Editorial split-layout. Left-aligned text, clean structure.
 *         No glassmorphism, no floating badges, no AI-template patterns.
 */

import Link from "next/link";
import {
  ShieldCheck, Users, MapPin, Target,
  Car, Award, Phone, Mail,
  FileText, Star, MessageSquare
} from "lucide-react";

export const metadata = {
  title: "About Us",
  description:
    "KarBik is Hyderabad's most trusted marketplace for verified used cars. Learn about our mission and how KarBik connects Hyderabad buyers with verified local showrooms.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-surface-alt">

      {/* ─── Hero Section ─── */}
      <section className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Headline */}
            <div className="text-left">
              <span className="text-xs font-black text-primary-600 uppercase tracking-widest mb-3 block">
                About KarBik
              </span>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-ink-strong tracking-tight leading-tight mb-4">
                Building Hyderabad&apos;s Most Transparent Car Marketplace
              </h1>
              <p className="text-sm text-ink-muted leading-relaxed max-w-lg">
                KarBik was built with a single goal — to eliminate the trust deficit in India&apos;s used car market. We connect verified dealers with serious buyers through a platform that prioritises transparency, fair pricing, and genuine vehicle documentation.
              </p>
            </div>

            {/* Right: Mission card */}
            <div className="bg-surface-alt rounded-2xl border border-border p-6 md:p-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-xl bg-primary-50 border border-primary-100">
                  <Target className="h-5 w-5 text-primary-600" />
                </div>
                <h2 className="text-lg font-bold text-ink-strong">Our Mission</h2>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed mb-4">
                To become the default platform Hyderabad residents trust when buying or selling a used car — by ensuring every listing is verified, every dealer is accountable, and every buyer gets a fair deal.
              </p>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="text-center p-3 bg-surface rounded-xl border border-border">
                  <ShieldCheck className="h-5 w-5 text-primary-600 mx-auto" aria-hidden />
                  <p className="text-xs font-semibold text-ink-muted mt-1.5 uppercase tracking-wider">Verified Listings</p>
                </div>
                <div className="text-center p-3 bg-surface rounded-xl border border-border">
                  <FileText className="h-5 w-5 text-primary-600 mx-auto" aria-hidden />
                  <p className="text-xs font-semibold text-ink-muted mt-1.5 uppercase tracking-wider">Inspection Reports</p>
                </div>
                <div className="text-center p-3 bg-surface rounded-xl border border-border">
                  <Star className="h-5 w-5 text-primary-600 mx-auto" aria-hidden />
                  <p className="text-xs font-semibold text-ink-muted mt-1.5 uppercase tracking-wider">Dealer Reviews</p>
                </div>
                <div className="text-center p-3 bg-surface rounded-xl border border-border">
                  <MessageSquare className="h-5 w-5 text-primary-600 mx-auto" aria-hidden />
                  <p className="text-xs font-semibold text-ink-muted mt-1.5 uppercase tracking-wider">Direct Contact</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Why We Built This Section ─── */}
      <section className="py-16 md:py-20 bg-surface-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-2xl md:text-3xl font-display font-bold text-ink-strong tracking-tight mb-4">
              The Problem We&apos;re Solving
            </h2>
            <p className="text-sm text-ink-muted leading-relaxed mb-6">
              The Indian used car market is worth over ₹2 lakh crore, yet buying a used car remains a stressful experience. Fake listings, inflated prices, hidden damage, and unverified ownership plague every major platform.
            </p>
            <p className="text-sm text-ink-muted leading-relaxed">
              We started KarBik because we experienced this firsthand in Hyderabad. We partnered with multi-brand showrooms across Kukatpally, Secunderabad, and Gachibowli to build a curated network where every dealer is physically verified and every car passes a documentation check before going live.
            </p>
          </div>
        </div>
      </section>

      {/* ─── Values Section ─── */}
      <section className="py-16 md:py-20 bg-surface border-t border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-ink-strong tracking-tight mb-10">
            What We Stand For
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-primary-50 border border-primary-100">
                  <ShieldCheck className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="text-base font-bold text-ink-strong">Verification First</h3>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed">
                Every dealer on our platform passes a physical location audit. Every car listing goes through documentation and ownership verification. No exceptions.
              </p>
            </div>

            {/* Value 2 */}
            <div className="text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-primary-50 border border-primary-100">
                  <Award className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="text-base font-bold text-ink-strong">Fair Pricing</h3>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed">
                We use AI-powered price analysis to flag overpriced listings and help buyers understand fair market value. No hidden charges, no bait-and-switch pricing.
              </p>
            </div>

            {/* Value 3 */}
            <div className="text-left">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-xl bg-primary-50 border border-primary-100">
                  <Users className="h-5 w-5 text-primary-600" />
                </div>
                <h3 className="text-base font-bold text-ink-strong">Dealer Partnership</h3>
              </div>
              <p className="text-sm text-ink-muted leading-relaxed">
                We don&apos;t compete with dealers — we empower them. Our digital tools (micro-websites, QR standees, CRM, analytics) help local showrooms grow their business online.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Coverage Section ─── */}
      <section className="py-16 md:py-20 bg-surface-alt">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold text-ink-strong tracking-tight mb-4">
                Serving Hyderabad, One Neighborhood at a Time
              </h2>
              <p className="text-sm text-ink-muted leading-relaxed">
                We operate across all major automotive corridors in Hyderabad — from the multi-brand showrooms of Kukatpally and Miyapur to the established dealer networks of Secunderabad, the premium segments of Madhapur and Jubilee Hills, and the budget-friendly markets of LB Nagar and Dilsukhnagar.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { area: "Kukatpally & Miyapur", desc: "Multi-brand showrooms and yards" },
                { area: "Secunderabad & Minister Road", desc: "Established dealer corridor" },
                { area: "Madhapur & Gachibowli", desc: "Premium and luxury inventory" },
                { area: "LB Nagar & Dilsukhnagar", desc: "Budget-friendly family options" },
                { area: "Begumpet & Somajiguda", desc: "Central business district dealers" },
              ].map(({ area, desc }) => (
                <div key={area} className="flex items-start gap-3 p-4 bg-surface rounded-xl border border-border">
                  <MapPin className="h-4 w-4 text-primary-600 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-ink-strong">{area}</p>
                    <p className="text-xs text-ink-muted mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA Section ─── */}
      <section className="py-14 bg-surface border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-ink-strong tracking-tight mb-3">
            Ready to get started?
          </h2>
          <p className="text-sm text-ink-muted mb-8 max-w-md mx-auto">
            Whether you&apos;re looking to buy your next car or grow your dealership online, KarBik is here to help.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/cars"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-7 py-3 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
            >
              <Car className="h-4 w-4" />
              Browse Cars
            </Link>
            <Link
              href="/register?role=dealer"
              className="inline-flex items-center gap-2 bg-surface border border-border-strong text-ink hover:border-primary-400 hover:text-primary-600 px-7 py-3 rounded-xl font-bold text-sm transition-all"
            >
              Partner as Dealer
            </Link>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-ink-muted">
            <a href="mailto:support@karbik.com" className="flex items-center gap-2 hover:text-primary-600 transition-colors">
              <Mail className="h-4 w-4" /> support@karbik.com
            </a>
            <a href="tel:+919494720878" className="flex items-center gap-2 hover:text-primary-600 transition-colors">
              <Phone className="h-4 w-4" /> 94947 20878
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}
