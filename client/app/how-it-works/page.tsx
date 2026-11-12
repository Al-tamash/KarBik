import Link from "next/link";
import type { Metadata } from "next";
import InfoPage, { InfoSection } from "@/components/info/InfoPage";
import { StepList, type Step } from "@/components/car-detail/HowItWorks";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How buying a used car on KarBik works: find a car, check what is recorded, tell KarBik support, then meet the dealer. And how dealers list cars and receive enquiries.",
  alternates: { canonical: "/how-it-works" },
  openGraph: {
    title: "How KarBik works",
    description:
      "Find a car, check what is recorded, tell KarBik support, then meet the dealer. And how dealers list cars and receive enquiries.",
    url: "/how-it-works",
  },
};

const BUYER_STEPS: Step[] = [
  {
    title: "Find a car",
    body: "Browse used cars in Hyderabad and filter by brand, price, body type or fuel. Put up to three cars side by side in Compare.",
  },
  {
    title: "Check what is recorded",
    body: "Each car shows what the dealer filled in and whether KarBik has checked the RC. Anything missing says Not provided.",
  },
  {
    title: "Tell KarBik",
    body: "Tap WhatsApp or request a call back. KarBik support talks to you first, then connects you with the dealer so you can see the car and test drive it.",
  },
];

const DEALER_STEPS: Step[] = [
  {
    title: "Create an account",
    body: "Register and add your showroom details. KarBik sets up a public page for your cars.",
  },
  {
    title: "List your cars",
    body: "Add cars from your dashboard; AI can draft the description. Print your storefront QR code for the showroom.",
  },
  {
    title: "Get enquiries",
    body: "KarBik support speaks to each buyer first and then forwards the enquiry to you. You see it in your dashboard, with a push alert when notifications are on.",
  },
];

export default function HowItWorksPage() {
  return (
    <InfoPage
      title="How KarBik works"
      intro="KarBik connects Hyderabad car buyers with local dealers, with KarBik support in between. This is the whole flow."
    >
      <InfoSection id="buyers" title="For buyers">
        <StepList steps={BUYER_STEPS} roomy />
        <p className="pt-2 text-sm text-ink-muted">
          Free for buyers. Questions?{" "}
          <Link href="/faq" className="font-semibold text-primary-600 underline underline-offset-2">
            Read the FAQ
          </Link>
          .
        </p>
        <div className="pt-2">
          <Link href="/cars" className="btn btn-cta btn-md">
            Browse cars
          </Link>
        </div>
      </InfoSection>

      <InfoSection id="dealers" title="For dealers">
        <StepList steps={DEALER_STEPS} roomy />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2">
          <Link href="/register?role=dealer" className="btn btn-outline btn-md">
            Register as a dealer
          </Link>
          <Link href="/pricing" className="inline-flex min-h-11 items-center font-semibold text-primary-600 hover:underline">
            See plans
          </Link>
        </div>
      </InfoSection>
    </InfoPage>
  );
}
