import Link from "next/link";
import type { Metadata } from "next";
import InfoPage, { InfoSection } from "@/components/info/InfoPage";

export const metadata: Metadata = {
  title: "About",
  description:
    "KarBik is a Hyderabad marketplace for used cars from local dealers. Support talks to you first, then connects you with the dealer. Free for buyers.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About KarBik",
    description:
      "KarBik is a Hyderabad marketplace for used cars from local dealers. Support talks to you first, then connects you with the dealer.",
    url: "/about",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "KarBik" }],
  },
};

/* Only what is literally true today (PRODUCT.md): no superlatives, no stats, no origin story,
   no verification steps that are not in the product. */
export default function AboutPage() {
  return (
    <InfoPage
      title="About KarBik"
      intro="KarBik is a Hyderabad marketplace for used cars from local dealers. You browse and compare cars, tell KarBik support which one you like, and support connects you with the dealer."
    >
      <InfoSection title="How KarBik works for buyers">
        <p>
          Using KarBik is free for buyers. When you ask about a car on WhatsApp or request a call back, KarBik support
          talks to you first and then connects you with the dealer. You do not contact dealers directly, and dealer phone
          numbers are not shown on car pages.
        </p>
        <p>
          <Link href="/how-it-works" className="font-semibold text-primary-600 hover:underline">
            See the steps
          </Link>
        </p>
      </InfoSection>

      <InfoSection title="What a car page tells you">
        <p>
          Each car shows what the dealer recorded: year, kilometres, owners, fuel, gearbox and features. Where something was
          not recorded, the page says Not provided instead of guessing.
        </p>
        <p>
          <strong className="font-semibold text-ink-strong">RC Verified</strong>{" "}
          means the KarBik team looked at the car&apos;s
          registration certificate and checked that its details match the listing. It is not a guarantee about ownership,
          pending challans or loans, so check the papers yourself before you pay. Some dealers also upload an inspection
          report; when they do, the car page links to it.
        </p>
      </InfoSection>

      <InfoSection title="For dealers">
        <p>
          Dealers list their cars on KarBik, get a public page for their stock, and receive buyer enquiries after KarBik
          support has spoken to the buyer. The dashboard has a CRM for those enquiries and a QR code for your showroom.
        </p>
        <p className="flex flex-wrap gap-x-5 gap-y-1">
          <Link href="/register?role=dealer" className="font-semibold text-primary-600 hover:underline">
            Register as a dealer
          </Link>
          <Link href="/pricing" className="font-semibold text-primary-600 hover:underline">
            See plans
          </Link>
        </p>
      </InfoSection>

      <InfoSection title="Who runs KarBik">
        <p>
          KarBik is built and operated by Edone Solutions in Hyderabad. To reach the team, use the{" "}
          <Link href="/contact" className="font-semibold text-primary-600 underline underline-offset-2">
            contact page
          </Link>
          .
        </p>
      </InfoSection>

      <div className="mt-12 flex flex-wrap gap-3 border-t border-border pt-8">
        <Link href="/cars" className="btn btn-cta btn-md">
          Browse cars
        </Link>
        <Link href="/contact" className="btn btn-outline btn-md">
          Contact KarBik
        </Link>
      </div>
    </InfoPage>
  );
}
