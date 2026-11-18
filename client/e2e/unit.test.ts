/**
 * Pure-function tests for listing names and the WhatsApp enquiry text.
 * No browser, network or database needed:  npm run test:unit
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { displayCarName } from "../lib/car-name";
import { describeCar } from "../lib/whatsapp-message";
import { buildWhatsAppUrl } from "../lib/dealer-public";
import { findContactDetails, createCarSchema } from "@autobazaar/shared";
import { insuranceFromMonth, monthFromInsurance, insuranceHasLapsed } from "../lib/car-format";

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

import { buildContactEmail, contactSchema } from "../lib/contact-mail";

describe("contact form", () => {
  const valid = { name: "Asha", email: "asha@example.com", topic: "buying", message: "Is the Bolero still available?" };

  it("accepts a valid message", () => {
    assert.equal(contactSchema.safeParse(valid).success, true);
  });
  it("rejects a bad email, unknown topic and a too-short message", () => {
    assert.equal(contactSchema.safeParse({ ...valid, email: "not-an-email" }).success, false);
    assert.equal(contactSchema.safeParse({ ...valid, topic: "spam" }).success, false);
    assert.equal(contactSchema.safeParse({ ...valid, message: "hi" }).success, false);
  });
  it("escapes HTML and keeps line breaks out of the subject", () => {
    const mail = buildContactEmail({
      ...(valid as { name: string; email: string; topic: "buying"; message: string }),
      name: "Eve\r\nBcc: x@y.z",
      message: "<script>alert(1)</script>",
    });
    assert.ok(!/[\r\n]/.test(mail.subject), "subject contains a line break");
    assert.ok(!mail.html.includes("<script>"), "message was not escaped");
    assert.ok(mail.html.includes("&lt;script&gt;"));
  });
});

describe("findContactDetails", () => {
  it("finds a mobile number in the usual spellings", () => {
    for (const t of ["call 9876543210", "call 98765 43210 now", "+91 98765 43210", "reach me on 91-98765-43210"]) {
      assert.equal(findContactDetails(t), "phone number", t);
    }
  });
  it("finds an email and a link", () => {
    assert.equal(findContactDetails("mail me at dealer@example.com"), "email");
    assert.equal(findContactDetails("see https://example.com/car"), "link");
    assert.equal(findContactDetails("see www.example.com"), "link");
  });
  it("leaves ordinary listing text alone", () => {
    for (const t of [
      "2021 model, 38,000 km, single owner",
      "Serviced 2019 2020 2021 at the authorised centre",
      "Price 12,50,000 negotiable",
      "Engine 1498 cc, 115 bhp, 300 Nm",
      "RC transfer ready, insurance till March 2026",
    ]) {
      assert.equal(findContactDetails(t), null, t);
    }
  });
});

describe("createCarSchema description", () => {
  const base = {
    title: "2021 Hyundai Creta", brand: "Hyundai", model: "Creta", year: 2021, price: 1000000,
    fuelType: "petrol", transmission: "manual", bodyType: "suv", mileage: 30000, color: "White",
    owners: "1st owner", city: "Hyderabad",
  };
  it("refuses a phone number in the description", () => {
    const r = createCarSchema.safeParse({ ...base, description: "Great car, call 9876543210" });
    assert.equal(r.success, false);
  });
  it("accepts a plain description", () => {
    const r = createCarSchema.safeParse({ ...base, description: "Single owner, regular service." });
    assert.equal(r.success, true);
  });
});

describe("insurance month helpers", () => {
  it("round-trips a month and is read by the lapsed check", () => {
    assert.equal(insuranceFromMonth("2026-03"), "Valid till March 2026");
    assert.equal(monthFromInsurance("Valid till March 2026"), "2026-03");
    assert.equal(monthFromInsurance("Comprehensive till Aug 2026"), "2026-08");
    assert.equal(insuranceHasLapsed("Valid till March 2020"), true);
    assert.equal(insuranceHasLapsed(insuranceFromMonth("2999-01")), false);
  });
  it("gives nothing for empty or free text", () => {
    assert.equal(insuranceFromMonth(""), "");
    assert.equal(monthFromInsurance("expired last year"), "");
  });
});

describe("findContactDetails: more spellings", () => {
  it("finds numbers without separators and with a country or trunk prefix", () => {
    for (const t of ["+919876543210", "919876543210", "09876543210", "98 76 54 32 10", "9876 543 210", "987-654-3210", "98765.43210"]) {
      assert.equal(findContactDetails(`call ${t} today`), "phone number", t);
    }
  });
  it("sees through lookalike digits and zero-width characters", () => {
    assert.equal(findContactDetails("call \uFF19\uFF18\uFF17\uFF16\uFF15\uFF14\uFF13\uFF12\uFF11\uFF10"), "phone number");
    assert.equal(findContactDetails("call 98765\u200B43210"), "phone number");
  });
  it("finds a chat link, a bare domain and a handle", () => {
    assert.equal(findContactDetails("chat on wa.me/919876543210"), "link");
    assert.equal(findContactDetails("visit apexmotors.com"), "link");
    assert.equal(findContactDetails("follow @apex_motors"), "link");
  });
  it("does not mistake a price followed by a year, or specs, for a number", () => {
    for (const t of ["950000 2019", "Sold at 9,50,000 in 2019", "VIN MALH351CLM789012", "Reg TS09EQ1234", "1.5 TDI 110 bhp 260 Nm", "46,500 km 2 owners"]) {
      assert.equal(findContactDetails(t), null, t);
    }
  });
});

describe("createCarSchema other free-text fields", () => {
  const base = {
    title: "2021 Hyundai Creta", brand: "Hyundai", model: "Creta", year: 2021, price: 1000000,
    fuelType: "petrol", transmission: "manual", bodyType: "suv", mileage: 30000, color: "White",
    owners: "1st owner", city: "Hyderabad",
  };
  it("refuses contact details in model, city and feature names", () => {
    assert.equal(createCarSchema.safeParse({ ...base, model: "Creta 9876543210" }).success, false);
    assert.equal(createCarSchema.safeParse({ ...base, city: "Hyderabad wa.me/919876543210" }).success, false);
    assert.equal(createCarSchema.safeParse({ ...base, features: JSON.stringify({ comfort: ["Sunroof", "call 9876543210"] }) }).success, false);
  });
  it("accepts ordinary values", () => {
    assert.equal(createCarSchema.safeParse({ ...base, features: JSON.stringify({ comfort: ["Sunroof", "Cruise control"] }) }).success, true);
  });
});

describe("insurance text without the word till", () => {
  it("reads and flags an old free-text value", () => {
    assert.equal(monthFromInsurance("March 2026"), "2026-03");
    assert.equal(insuranceHasLapsed("March 2020"), true);
    assert.equal(insuranceHasLapsed("Comprehensive 2999"), false);
  });
});
