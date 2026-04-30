// lib/freemius.ts

export const PRODUCT_ID = "28785";       // from Freemius dashboard
export const PUBLIC_KEY = "pk_d7411022d4ceb804ce70f87395953";    // from Freemius dashboard

export const DONATION_TIERS = [
  {
    label: "Coffee",
    plan_id: 47368,           // your Freemius plan ID
    billing_cycle: "lifetime" as const,
    displayAmount: "$5",
    description: "Buy us a coffee ☕",
  },
  {
    label: "Supporter",
    plan_id: 47369,
    billing_cycle: "lifetime" as const,
    displayAmount: "$15",
    description: "One-time supporter",
  },
  {
    label: "Monthly",
    plan_id: 47381,
    billing_cycle: "monthly" as const,
    displayAmount: "$5/mo",
    description: "Monthly recurring support",
  },
  {
    label: "Champion",
    plan_id: 47382,
    billing_cycle: "annual" as const,
    displayAmount: "$50/yr",
    description: "Annual champion 🏆",
  },
];
