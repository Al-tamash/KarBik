import React from "react";
import { AlertTriangle, Check, Minus, ShieldCheck } from "lucide-react";
import type { ApiCar } from "@/lib/api-types";

/**
 * "Checks on this car": what is recorded, who recorded it, and "Not provided"
 * where nothing is. RC is the only row that can be green (KarBik checks it); the
 * rest are dealer-reported and say so. An inspection report row appears only
 * when a report file exists.
 */

type Tone = "checked" | "reported" | "warn" | "missing";

type Row = { key: string; title: string; status: string; note: string; tone: Tone };

const MONTHS: Record<string, number> = {
  jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
};

/** "Comprehensive till Aug 2026" → true when that month has already ended. */
function insuranceHasLapsed(text: string, now: Date = new Date()): boolean {
  const m = text.match(/till\s+([A-Za-z]{3})[a-z]*\s+(\d{4})/i);
  if (!m) return false;
  const month = MONTHS[m[1].toLowerCase()];
  if (month === undefined) return false;
  const endOfMonth = new Date(Number(m[2]), month + 1, 0, 23, 59, 59);
  return endOfMonth < now;
}

function iconFor(tone: Tone) {
  const base = "mt-0.5 h-5 w-5 shrink-0";
  if (tone === "checked") return <ShieldCheck className={`${base} text-success-700`} aria-hidden />;
  if (tone === "warn") return <AlertTriangle className={`${base} text-danger-600`} aria-hidden />;
  if (tone === "missing") return <Minus className={`${base} text-ink-subtle`} aria-hidden />;
  return <Check className={`${base} text-ink-muted`} aria-hidden />;
}

export default function CarChecks({ car }: { car: ApiCar }) {
  const insurance = (car.insuranceValid ?? "").trim();
  const lapsed = insurance ? insuranceHasLapsed(insurance) : false;

  const rows: Row[] = [
    car.rcVerified
      ? { key: "rc", title: "Registration (RC)", status: "RC Verified", note: "Checked by KarBik.", tone: "checked" }
      : { key: "rc", title: "Registration (RC)", status: "Not checked yet", note: "KarBik has not checked this car's RC. Ask support before you decide.", tone: "missing" },
    car.accidentHistory
      ? { key: "accident", title: "Accident history", status: "Accident reported", note: "Reported by the dealer. Ask support what was repaired.", tone: "warn" }
      : { key: "accident", title: "Accident history", status: "No accident reported", note: "Reported by the dealer.", tone: "reported" },
    car.serviceHistory
      ? { key: "service", title: "Service history", status: "Service record available", note: "Reported by the dealer.", tone: "reported" }
      : { key: "service", title: "Service history", status: "Not provided", note: "The dealer has not listed a service record.", tone: "missing" },
    insurance
      ? {
          key: "insurance",
          title: "Insurance",
          status: insurance,
          note: lapsed
            ? "This date has passed. Ask support for the current policy."
            : "As entered by the dealer.",
          tone: lapsed ? "warn" : "reported",
        }
      : { key: "insurance", title: "Insurance", status: "Not provided", note: "The dealer has not listed insurance details.", tone: "missing" },
  ];

  const reportUrl = car.isInspected ? car.inspectionReport?.url : undefined;
  if (reportUrl) {
    rows.push({
      key: "report",
      title: "Inspection report",
      status: "Report available",
      note: "",
      tone: "reported",
    });
  }

  return (
    <div>
      <p className="max-w-prose text-sm text-ink-muted">
        KarBik checks the RC. The other items are reported by the dealer.
      </p>
      {/* Two columns from sm so the rows fill the section width instead of leaving the right half empty */}
      <ul className="mt-4 grid sm:grid-cols-2 sm:gap-x-10">
        {rows.map((row) => (
          <li key={row.key} className="flex gap-3 border-t border-border py-4">
            {iconFor(row.tone)}
            <div className="min-w-0">
              <p className="text-sm text-ink-muted">{row.title}</p>
              <p
                className={`text-base font-semibold ${
                  row.tone === "warn" ? "text-danger-700" : row.tone === "missing" ? "text-ink-muted" : "text-ink-strong"
                }`}
              >
                {row.status}
              </p>
              {row.key === "report" && reportUrl ? (
                <a
                  href={reportUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-0.5 inline-block text-sm font-semibold text-primary-600 hover:underline"
                >
                  View report
                </a>
              ) : (
                row.note && <p className="mt-0.5 text-sm text-ink-muted">{row.note}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
