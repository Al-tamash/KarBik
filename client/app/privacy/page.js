/**
 * WHAT: Privacy Policy page for AutoBazaar.
 * WHY: Legally required — we collect personal data through Better Auth (email, name),
 *      inquiry forms (phone numbers), and Razorpay payments (billing info).
 *      The footer already links here, so this must exist to avoid a 404.
 *      Google also uses this as an E-E-A-T trust signal for search rankings.
 */

import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Privacy Policy",
  description:
    "Learn how AutoBazaar collects, uses, and protects your personal information when you browse listings, send inquiries, or make payments.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Page Header */}
      <section className="bg-white border-b border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-xl bg-primary-50 border border-primary-100">
              <ShieldCheck className="h-5 w-5 text-primary-600" />
            </div>
            <span className="text-xs font-black text-primary-600 uppercase tracking-widest">
              Legal
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-neutral-900 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm text-neutral-500 mt-2">
            Last updated: {new Date().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 md:py-14">
        <div className="space-y-10 text-neutral-700 text-sm leading-relaxed">

          {/* Section 1 */}
          <div>
            <h2 className="text-lg font-bold text-neutral-900 mb-3">
              1. Information We Collect
            </h2>
            <p className="mb-3">
              When you use AutoBazaar, we may collect the following types of information:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-600">
              <li>
                <strong className="text-neutral-800">Account Information:</strong> Name, email address, and password when you register via our authentication system.
              </li>
              <li>
                <strong className="text-neutral-800">Inquiry Data:</strong> Phone number, name, and message content when you send inquiries to dealers through our platform.
              </li>
              <li>
                <strong className="text-neutral-800">Payment Information:</strong> Transaction details processed through Razorpay for subscription plans and listing boosts. We do not store your card or bank details directly — Razorpay handles this securely.
              </li>
              <li>
                <strong className="text-neutral-800">Usage Data:</strong> Pages visited, search queries, listing views, and comparison actions to improve your experience.
              </li>
              <li>
                <strong className="text-neutral-800">Device Information:</strong> Browser type, IP address, and device identifiers for security and analytics purposes.
              </li>
            </ul>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-lg font-bold text-neutral-900 mb-3">
              2. How We Use Your Information
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-neutral-600">
              <li>To authenticate your identity and manage your account securely.</li>
              <li>To facilitate communication between buyers and verified dealers.</li>
              <li>To process subscription payments and listing boost purchases.</li>
              <li>To send you relevant notifications about inquiries, listings, and account activity.</li>
              <li>To improve our platform through anonymised usage analytics.</li>
              <li>To prevent fraud, spam, and abuse on our marketplace.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-lg font-bold text-neutral-900 mb-3">
              3. Information Sharing
            </h2>
            <p className="mb-3">
              We do not sell your personal information to third parties. We may share your data only in these cases:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-600">
              <li>
                <strong className="text-neutral-800">With Dealers:</strong> When you send an inquiry, your name, phone number, and message are shared with the relevant dealer to facilitate contact.
              </li>
              <li>
                <strong className="text-neutral-800">Payment Processors:</strong> Transaction data is shared with Razorpay to process payments securely under their own privacy policy.
              </li>
              <li>
                <strong className="text-neutral-800">Legal Compliance:</strong> If required by Indian law, court order, or government regulation.
              </li>
            </ul>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-lg font-bold text-neutral-900 mb-3">
              4. Data Security
            </h2>
            <p>
              We use industry-standard security measures to protect your data. Authentication is handled via HTTP-only cookies (not localStorage tokens) to prevent XSS attacks. All API endpoints are rate-limited to prevent brute-force attempts. Payment processing is handled entirely by Razorpay&apos;s PCI-DSS compliant infrastructure.
            </p>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-lg font-bold text-neutral-900 mb-3">
              5. Cookies and Tracking
            </h2>
            <p>
              We use essential cookies for authentication sessions. We do not use third-party advertising trackers. Analytics data is collected in aggregated, anonymised form to understand platform usage patterns and improve our service.
            </p>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="text-lg font-bold text-neutral-900 mb-3">
              6. Your Rights
            </h2>
            <p className="mb-3">Under applicable Indian data protection laws, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-600">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate or incomplete data.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Withdraw consent for data processing at any time.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, contact us at{" "}
              <a href="mailto:support@autobazaar.in" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
                support@autobazaar.in
              </a>
            </p>
          </div>

          {/* Section 7 */}
          <div>
            <h2 className="text-lg font-bold text-neutral-900 mb-3">
              7. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. Continued use of AutoBazaar after changes constitutes acceptance of the updated policy.
            </p>
          </div>

          {/* Section 8 */}
          <div>
            <h2 className="text-lg font-bold text-neutral-900 mb-3">
              8. Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy or your personal data, please reach out:
            </p>
            <div className="mt-3 p-4 bg-neutral-100 rounded-xl border border-neutral-200 text-sm">
              <p className="font-semibold text-neutral-900">AutoBazaar India</p>
              <p className="text-neutral-600 mt-1">Viswash Nagar, Mehdipatnam, Hyderabad, Telangana 500028</p>
              <p className="text-neutral-600 mt-0.5">
                Email:{" "}
                <a href="mailto:support@autobazaar.in" className="text-primary-600 hover:underline">
                  support@autobazaar.in
                </a>
              </p>
            </div>
          </div>

        </div>

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-neutral-200">
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
