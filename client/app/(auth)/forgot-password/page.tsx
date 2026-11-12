import type { Metadata } from "next";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";

// Account pages are for one visitor, not for search engines.
export const metadata: Metadata = {
  title: "Forgot password",
  description: "Get a link to choose a new KarBik password.",
  robots: { index: false, follow: true },
};

export default function Page() {
  return <ForgotPasswordForm />;
}
