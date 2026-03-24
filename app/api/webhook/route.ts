import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import connectDB from "@/lib/mongodb";
import Sponsor from "@/models/Sponsor";
import { pickSponsorTier } from "@/lib/utils";

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch (err) {
    return NextResponse.json({ error: `Webhook signature failed: ${err}` }, { status: 400 });
  }

  await connectDB();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const amount = session.amount_total ?? 0;
      const tier = pickSponsorTier(amount);
      const name = session.customer_details?.name ?? "Anonymous Sponsor";
      if (session.metadata?.type === "sponsorship") {
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 1);
        await Sponsor.findOneAndUpdate(
          { stripeCustomerId: String(session.customer) },
          { name, tier, amount, isActive: true, expiryDate: expiry, stripeCustomerId: String(session.customer), stripeSubscriptionId: String(session.subscription), websiteUrl: "#" },
          { upsert: true, new: true },
        );
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await Sponsor.findOneAndUpdate({ stripeSubscriptionId: subscription.id }, { isActive: false });
      break;
    }
  }

  return NextResponse.json({ received: true });
}
