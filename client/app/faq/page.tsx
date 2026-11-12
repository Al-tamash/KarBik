import Link from "next/link";
import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import InfoPage, { InfoSection } from "@/components/info/InfoPage";
import { EMI_DEFAULT_DOWN_PERCENT, EMI_DEFAULT_MONTHS, EMI_RATE_PERCENT } from "@/lib/emi";

export const metadata: Metadata = {
  title: "Frequently asked questions",
  description:
    "Answers for KarBik buyers and dealers: what RC Verified means, how support connects you with a dealer, boosting a listing and payments.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "KarBik FAQ",
    description:
      "Answers for KarBik buyers and dealers: what RC Verified means, how support connects you with a dealer, boosting a listing and payments.",
    url: "/faq",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "KarBik" }],
  },
};

type Faq = { q: string; a: string };

/* Every answer restates something the product really does (PRODUCT.md). Plain text, so the
   same strings feed the page and the FAQPage structured data. */
const GROUPS: { id: string; title: string; items: Faq[] }[] = [
  {
    id: "buyers",
    title: "Buying a car",
    items: [
      {
        q: "What does RC Verified mean?",
        a: "RC Verified means the KarBik team has looked at the car's registration certificate (RC) and checked that its details match the listing. It is not a guarantee about ownership, pending challans, loans or police cases. Check the papers yourself, and at the RTO, before you pay.",
      },
      {
        q: "How do I contact the dealer?",
        a: "You do not contact the dealer directly. Tap WhatsApp or Request call back on a car. KarBik support talks to you first, then connects you with the dealer.",
      },
      {
        q: "Can I see a car and take a test drive?",
        a: "Viewing and test drives are arranged with the dealer after KarBik support connects you. Ask on the car page to start.",
      },
      {
        q: "Are the prices negotiable?",
        a: "Each dealer sets their own price. After KarBik support has connected you, you can talk about the price with the dealer.",
      },
      {
        q: "Does every car have an inspection report?",
        a: "No. Some dealers upload one. When they do, the car page links to it. If a car has none, ask support what you want checked before you visit.",
      },
      {
        q: "What is the Est. EMI on a car?",
        a: `An estimate from a standard formula: a ${100 - EMI_DEFAULT_DOWN_PERCENT}% loan at ${EMI_RATE_PERCENT}% a year for ${EMI_DEFAULT_MONTHS / 12} years. KarBik does not offer loans or approve them; your bank decides the rate and the amount.`,
      },
    ],
  },
  {
    id: "dealers",
    title: "For dealers",
    items: [
      {
        q: "How do I list my cars?",
        a: "Create a dealer account on the register page. Then add car details and photos from your dashboard; AI can draft the description. Your cars also appear on your public KarBik page.",
      },
      {
        q: "How do enquiries reach me?",
        a: "KarBik support talks to each buyer first, then forwards the enquiry to you. You see it in your dashboard, with a push alert when notifications are on.",
      },
      {
        q: "What is the QR code?",
        a: "Your dashboard has a QR code for your public page. Print it for your showroom; scanning it opens your current listings.",
      },
      {
        q: "How does boosting a listing work?",
        a: "A boosted car is shown at the top of browse results for the boost period, and its card carries a Featured badge. You can boost with plan credits (Starter and Pro) or pay per boost.",
      },
    ],
  },
  {
    id: "general",
    title: "General",
    items: [
      {
        q: "What is KarBik's role in a sale?",
        a: "KarBik is a marketplace that introduces buyers to local dealers in Hyderabad. Support talks to the buyer first, then connects them with the dealer. Paperwork and payment for the car happen between you and the dealer.",
      },
      {
        q: "How are dealer plans paid for?",
        a: "Dealer plans and boosts are paid through Razorpay. KarBik does not store your card, bank or UPI details.",
      },
      {
        q: "How do I reach KarBik support?",
        a: "Use the contact page: WhatsApp, call, email or the message form.",
      },
    ],
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: GROUPS.flatMap((g) => g.items).map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function FAQPage() {
  return (
    <InfoPage
      title="Frequently asked questions"
      intro="Short answers about buying a car through KarBik and about listing as a dealer."
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />

      {GROUPS.map((group) => (
        <InfoSection key={group.id} id={group.id} title={group.title}>
          <div className="-mt-2 divide-y divide-border border-y border-border">
            {group.items.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-base font-semibold text-ink-strong marker:hidden [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown
                    className="h-5 w-5 shrink-0 text-ink-muted transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <p className="pb-4 text-base leading-relaxed text-ink-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </InfoSection>
      ))}

      <p className="mt-12 border-t border-border pt-8 text-base text-ink">
        Did not find your answer?{" "}
        <Link href="/contact" className="font-semibold text-primary-600 underline underline-offset-2">
          Contact KarBik support
        </Link>
        .
      </p>
    </InfoPage>
  );
}
