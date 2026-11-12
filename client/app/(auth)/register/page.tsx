import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";
import { safeNext } from "@/lib/auth-redirect";

// Account pages are for one visitor, not for search engines.
export const metadata: Metadata = {
  title: "Create your account",
  description: "Create a free KarBik account to save cars and ask KarBik support about a car.",
  robots: { index: false, follow: true },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const { next, role } = await searchParams;
  // Links like /register?role=dealer (home, how it works, about) open on the dealer choice.
  return (
    <RegisterForm
      next={safeNext(typeof next === "string" ? next : null)}
      initialRole={role === "dealer" ? "dealer" : "buyer"}
    />
  );
}
