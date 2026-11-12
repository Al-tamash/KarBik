import { ImageResponse } from "next/og";

/**
 * The default share card (WhatsApp, X, Facebook previews) for every page that does not set
 * its own. It replaces a /og-image.png that was referenced but never existed. Words only,
 * from what KarBik really is (PRODUCT.md): no photo, no claims, no stats.
 */
export const alt = "KarBik: used cars from local dealers in Hyderabad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 96px",
          background: "#FFFFFF",
          color: "#1B212B",
        }}
      >
        <div style={{ display: "flex", fontSize: 72, fontWeight: 800, letterSpacing: -2 }}>
          <span>Kar</span>
          <span style={{ color: "#1B6EF3" }}>Bik</span>
        </div>
        <div style={{ display: "flex", marginTop: 40, fontSize: 64, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1.5 }}>
          Used cars from local dealers in Hyderabad
        </div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 32, color: "#5D6375" }}>
          KarBik support connects you with the dealer. Free for buyers.
        </div>
        <div style={{ display: "flex", marginTop: 56, width: 120, height: 8, background: "#C2410C", borderRadius: 4 }} />
      </div>
    ),
    size,
  );
}
