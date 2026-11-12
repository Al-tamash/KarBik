/**
 * One EMI formula for the whole site, so the "Est. EMI" on a card, the one on the
 * detail page and the calculator can never disagree.
 *
 * It is an estimate, not an offer: KarBik does not lend or approve loans.
 */

export const EMI_RATE_PERCENT = 10.8;
export const EMI_DEFAULT_DOWN_PERCENT = 20;
export const EMI_DEFAULT_MONTHS = 60;

export const EMI_DISCLAIMER =
  "Indicative only. KarBik does not offer loans or approve them; your bank decides the rate and the amount.";

/** Monthly instalment in rupees for a car priced `price`. */
export function calculateEmi(
  price: number,
  downPercent: number = EMI_DEFAULT_DOWN_PERCENT,
  months: number = EMI_DEFAULT_MONTHS,
  ratePercent: number = EMI_RATE_PERCENT,
): number {
  const loan = price * (1 - downPercent / 100);
  if (!Number.isFinite(loan) || loan <= 0 || months <= 0) return 0;
  const monthlyRate = ratePercent / 12 / 100;
  return Math.round((loan * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months)));
}

/** Tooltip text for the short "Est. EMI" line on cards and the summary. */
export function emiAssumption(
  downPercent: number = EMI_DEFAULT_DOWN_PERCENT,
  months: number = EMI_DEFAULT_MONTHS,
): string {
  return `Estimate only: ${100 - downPercent}% loan at ${EMI_RATE_PERCENT}% a year for ${months / 12} years. KarBik does not offer loans.`;
}
