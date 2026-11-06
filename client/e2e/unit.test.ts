/**
 * Pure-function tests for listing names and the WhatsApp enquiry text.
 * No browser, network or database needed:  npm run test:unit
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { displayCarName } from "../lib/car-name";
import { describeCar } from "../lib/whatsapp-message";
import { buildWhatsAppUrl } from "../lib/dealer-public";

const bolero = {
  year: 2021,
  brand: "Mahindra",
  model: "Bolero Neo",
  variant: "N10 (O) with Multi-Terrain Tech",
  fuelType: "diesel",
  title: "2021 Mahindra Bolero Neo N10 (O) Diesel",
};

describe("displayCarName", () => {
  it("does not repeat year or brand already present in the title", () => {
    assert.equal(displayCarName(bolero), "2021 Mahindra Bolero Neo N10 (O) Diesel");
  });
  it("adds year and brand when the title lacks them", () => {
    assert.equal(displayCarName({ year: 2020, brand: "Maruti", title: "Swift VXi" }), "2020 Maruti Swift VXi");
  });
});

describe("describeCar", () => {
  it("lists year, make, model, variant and fuel once each", () => {
    assert.equal(describeCar(bolero), "2021 Mahindra Bolero Neo N10 (O) with Multi-Terrain Tech (Diesel)");
  });
  it("copes with an empty variant", () => {
    assert.equal(describeCar({ ...bolero, variant: "" }), "2021 Mahindra Bolero Neo (Diesel)");
  });
});

describe("buildWhatsAppUrl", () => {
  it("uses the international number with no plus or spaces and encodes the text", () => {
    const url = buildWhatsAppUrl("94947 20878", "Hi KarBik, ref fd952ff2 & more?");
    assert.ok(url);
    assert.ok(url.startsWith("https://wa.me/919494720878?text="));
    assert.ok(url.includes("%20") && url.includes("%26") && url.includes("%3F"));
  });
  it("accepts a number already carrying the 91 prefix", () => {
    assert.ok(buildWhatsAppUrl("+91 94947 20878", "x")?.startsWith("https://wa.me/919494720878?"));
  });
  it("rejects numbers that are not Indian mobiles", () => {
    assert.equal(buildWhatsAppUrl("12345", "x"), null);
    assert.equal(buildWhatsAppUrl("", "x"), null);
  });
});
