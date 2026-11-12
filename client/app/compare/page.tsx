import type { Metadata } from "next";
import CompareView from "@/components/compare/CompareView";

// A comparison is one buyer's own list, so it is not for search engines to index.
export const metadata: Metadata = {
  title: "Compare used cars",
  description: "Put up to three used cars from Hyderabad side by side and ask KarBik about the one you like.",
  robots: { index: false, follow: true },
};

export default function ComparePage() {
  return <CompareView />;
}
