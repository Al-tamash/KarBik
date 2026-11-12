import type { Metadata } from "next";
import WishlistView from "./WishlistView";

export const metadata: Metadata = {
  title: "Your wishlist",
  description: "Cars you saved on KarBik with the heart button.",
  // Personal list: nothing here for search engines.
  robots: { index: false, follow: true },
};

export default function WishlistPage() {
  return <WishlistView />;
}
