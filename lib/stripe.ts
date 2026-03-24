import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder", {
  apiVersion: "2024-06-20",
  typescript: true,
});

export const DONATION_TIERS = [
  { label: "Coffee", amount: 500, description: "Buy us a coffee ☕", type: "one_time" },
  { label: "Bronze", amount: 1000, description: "Bronze Supporter 🥉", type: "one_time" },
  { label: "Silver", amount: 5000, description: "Silver Sponsor /mo 🥈", type: "subscription" },
  { label: "Gold", amount: 10000, description: "Gold Sponsor /mo 👑", type: "subscription" },
] as const;
