import type { Metadata } from "next";

/* The billing page is a client component, so its title and robots rule live here. */
export const metadata: Metadata = {
  title: "Plan and billing",
  robots: { index: false, follow: false },
};

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
