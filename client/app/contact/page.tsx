import type { Metadata } from "next";
import { MessageCircle, Phone } from "lucide-react";
import InfoPage, { InfoSection } from "@/components/info/InfoPage";
import ContactForm from "@/components/info/ContactForm";
import { SUPPORT_EMAIL, SUPPORT_PHONE, SUPPORT_PHONE_DISPLAY } from "@/lib/lead-routing";

export const metadata: Metadata = {
  title: "Contact",
  description: "Reach KarBik support on WhatsApp, by phone or email, or send a message.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact KarBik",
    description: "Reach KarBik support on WhatsApp, by phone or email, or send a message.",
    url: "/contact",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "KarBik" }],
  },
};

const WA_TEXT = encodeURIComponent("Hi KarBik, I have a question.");

/* No office hours and no reply-time promise: PRODUCT.md gives none. */
export default function ContactPage() {
  return (
    <InfoPage
      title="Contact KarBik"
      intro="Questions about a car, your dealer account or a listing? Reach KarBik support."
    >
      <InfoSection title="Reach support">
        <div className="flex flex-wrap gap-3">
          <a
            href={`https://wa.me/91${SUPPORT_PHONE}?text=${WA_TEXT}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-cta btn-md"
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
            WhatsApp support
          </a>
          <a href={`tel:+91${SUPPORT_PHONE}`} className="btn btn-outline btn-md">
            <Phone className="h-5 w-5" aria-hidden />
            Call {SUPPORT_PHONE_DISPLAY}
          </a>
        </div>
        <p>
          Or email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-primary-600 underline underline-offset-2">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </InfoSection>

      <InfoSection id="message" title="Send a message">
        <ContactForm />
      </InfoSection>

      <InfoSection title="Who runs KarBik">
        <address className="not-italic text-ink-muted">
          <span className="font-semibold text-ink-strong">Edone Solutions</span>, operator of KarBik
          <br />
          Saqlain Paramount Towers, above Fresh &amp; Fresh Bakers,
          <br />
          Viswash Nagar, Mehdipatnam, Hyderabad, Telangana 500006
        </address>
      </InfoSection>
    </InfoPage>
  );
}
