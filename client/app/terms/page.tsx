/**
 * WHAT: Terms of Service page for KarBik.
 * WHY: Legally required for any platform that processes payments (Razorpay),
 *      facilitates transactions between buyers and dealers, and handles user accounts.
 *      The footer already links here — without this page it's a 404.
 */

import Link from "next/link";
import { Scale } from "lucide-react";

export const metadata = {
  title: "Terms of Service",
  description:
    "Read the Terms of Service for using KarBik — Hyderabad's trusted used car marketplace for buyers and dealers.",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface-alt">
      {/* Page Header */}
      <section className="bg-surface border-b border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary-50 border border-primary-100">
              <Scale className="h-5 w-5 text-primary-600" />
            </div>
            <span className="text-xs font-black text-primary-600 uppercase tracking-widest">
              Legal
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold text-ink-strong tracking-tight">
            Terms of Service
          </h1>
          <p className="text-sm text-ink-muted mt-2">
            Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="space-y-10 text-ink text-sm leading-relaxed">

          {/* Introduction */}
          <div>
            <p>
              Welcome to KarBik. By accessing or using our platform at karbik.com, you agree to be bound by these Terms of Service. If you do not agree, please do not use the platform.
            </p>
          </div>

          {/* Section 1 */}
          <div>
            <h2 className="text-lg font-bold text-ink-strong mb-3">
              1. Definitions
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-ink-muted">
              <li>
                <strong className="text-ink">&quot;Platform&quot;</strong> refers to the KarBik website, APIs, and all associated services.
              </li>
              <li>
                <strong className="text-ink">&quot;Buyer&quot;</strong> refers to any user who browses listings and sends inquiries to dealers.
              </li>
              <li>
                <strong className="text-ink">&quot;Dealer&quot;</strong> refers to any user who creates and manages car listings on the platform.
              </li>
              <li>
                <strong className="text-ink">&quot;Listing&quot;</strong> refers to any vehicle advertisement posted by a Dealer on the platform.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-lg font-bold text-ink-strong mb-3">
              2. Account Registration
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-ink-muted">
              <li>You must provide accurate, complete information when creating your account.</li>
              <li>You are responsible for maintaining the confidentiality of your login credentials.</li>
              <li>You must be at least 18 years of age to create an account.</li>
              <li>One person may not maintain multiple accounts without prior written approval.</li>
              <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-lg font-bold text-ink-strong mb-3">
              3. For Dealers — Listing Guidelines
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-ink-muted">
              <li>All vehicle information must be accurate and truthful, including year, mileage, ownership history, and price.</li>
              <li>Images must represent the actual vehicle being sold. Stock photos or misleading images are prohibited.</li>
              <li>Dealers must respond to buyer inquiries within a reasonable timeframe.</li>
              <li>Listings for stolen vehicles, vehicles with undisclosed damage, or vehicles without proper documentation are strictly prohibited.</li>
              <li>KarBik reserves the right to remove any listing that violates these guidelines without prior notice.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-lg font-bold text-ink-strong mb-3">
              4. For Buyers — Inquiry Guidelines
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-ink-muted">
              <li>Inquiries must be genuine and related to a specific vehicle listing.</li>
              <li>Spam, abusive messages, or fraudulent inquiries will result in account suspension.</li>
              <li>KarBik facilitates communication between buyers and dealers but is not a party to any vehicle sale transaction.</li>
              <li>You are responsible for independently verifying vehicle condition, documentation, and pricing before completing any purchase.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-lg font-bold text-ink-strong mb-3">
              5. Payments and Subscriptions
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-ink-muted">
              <li>Dealer subscription plans and listing boost payments are processed securely through Razorpay.</li>
              <li>All prices are displayed in Indian Rupees (INR) and are inclusive of applicable taxes unless stated otherwise.</li>
              <li>Subscription plans auto-expire at the end of the billing period unless renewed.</li>
              <li>Refund requests for subscriptions are handled on a case-by-case basis. Contact support within 7 days of purchase.</li>
              <li>Listing boost purchases are non-refundable once the boost period has started.</li>
            </ul>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="text-lg font-bold text-ink-strong mb-3">
              6. Intellectual Property
            </h2>
            <p>
              All content, design, code, and branding on KarBik is the intellectual property of KarBik India. You may not copy, modify, distribute, or reverse-engineer any part of our platform without explicit written permission. User-uploaded content (images, descriptions) remains the property of the uploading user, but you grant KarBik a non-exclusive license to display it on the platform.
            </p>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="text-lg font-bold text-ink-strong mb-3">
              7. Limitation of Liability
            </h2>
            <p className="mb-3">
              KarBik is a marketplace platform that connects buyers with dealers. We do not:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-ink-muted">
              <li>Own, inspect, or certify any vehicles listed on the platform (unless explicitly stated through our inspection program).</li>
              <li>Guarantee the accuracy of information provided by dealers.</li>
              <li>Assume liability for transactions conducted between buyers and dealers.</li>
              <li>Provide warranty on vehicles purchased through the platform (warranty terms, if any, are between the buyer and dealer).</li>
            </ul>
          </div>

          {/* Section 8 */}
          <div>
            <h2 className="text-lg font-bold text-ink-strong mb-3">
              8. Prohibited Activities
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-ink-muted">
              <li>Scraping, crawling, or automated data extraction from the platform.</li>
              <li>Attempting to access other users&apos; accounts or private data.</li>
              <li>Posting misleading, fraudulent, or illegal content.</li>
              <li>Circumventing rate limits, security measures, or access controls.</li>
              <li>Using the platform for any purpose other than buying or selling vehicles.</li>
            </ul>
          </div>

          {/* Section 9 */}
          <div>
            <h2 className="text-lg font-bold text-ink-strong mb-3">
              9. Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of India. Any disputes arising from the use of KarBik shall be subject to the exclusive jurisdiction of the courts located in Hyderabad, Telangana.
            </p>
          </div>

          {/* Section 10 */}
          <div>
            <h2 className="text-lg font-bold text-ink-strong mb-3">
              10. Contact
            </h2>
            <p>
              For questions about these Terms of Service, contact us at:
            </p>
            <div className="mt-3 p-4 bg-surface-alt rounded-xl border border-border text-sm">
              <p className="font-semibold text-ink-strong">KarBik, operated by Edone Solutions</p>
              <p className="text-ink-muted mt-1">Saqlain Paramount Towers, above Fresh &amp; Fresh Bakers, Viswash Nagar, Mehdipatnam, Hyderabad, Telangana 500006</p>
              <p className="text-ink-muted mt-0.5">
                Email:{" "}
                <a href="mailto:support@karbik.com" className="text-primary-600 hover:underline">
                  support@karbik.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-border">
          <Link
            href="/"
            className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline"
          >
            ← Back to Home
          </Link>
        </div>
      </section>
    </div>
  );
}
