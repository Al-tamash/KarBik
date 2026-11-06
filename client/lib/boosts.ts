export const BOOST_PLANS = {
  "1day": { label: "1 Day Spotlight", amount: 9900, days: 1 },
  "3day": { label: "3 Day Spotlight", amount: 24900, days: 3 },
  "7day": { label: "7 Day Spotlight", amount: 49900, days: 7 },
} as const;

export type BoostType = keyof typeof BOOST_PLANS;
