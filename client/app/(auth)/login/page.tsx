import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import { safeNext } from "@/lib/auth-redirect";

// Account pages are for one visitor, not for search engines.
export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to KarBik to see your saved cars and requests.",
  robots: { index: false, follow: true },
};

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function Page({ searchParams }: { searchParams: SearchParams }) {
  const { next } = await searchParams;
  return <LoginForm next={safeNext(typeof next === "string" ? next : null)} />;
}
