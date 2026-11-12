import type { Metadata } from "next";
import ResetPasswordForm from "@/components/auth/ResetPasswordForm";

// Account pages are for one visitor, not for search engines.
export const metadata: Metadata = {
  title: "Choose a new password",
  description: "Choose a new password for your KarBik account.",
  robots: { index: false, follow: true },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const { token, error } = await searchParams;
  return (
    <ResetPasswordForm
      token={typeof token === "string" ? token : ""}
      linkFailed={typeof error === "string" && error.length > 0}
    />
  );
}
