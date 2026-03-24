import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gameslib.net";

export async function POST(req: Request) {
  try {
    const { amount, type } = await req.json() as { amount: number; type: string };
    if (!amount || amount < 100) return NextResponse.json({ error: "Invalid amount" }, { status: 400 });

    if (type === "subscription") {
      const price = await stripe.prices.create({
        unit_amount: amount,
        currency: "usd",
        recurring: { interval: "month" },
        product_data: { name: "Gameslib Monthly Sponsorship" },
      });
      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: price.id, quantity: 1 }],
        success_url: `${BASE_URL}/donate?success=1`,
        cancel_url: `${BASE_URL}/donate?cancelled=1`,
        metadata: { type: "sponsorship", amount: String(amount) },
      });
      return NextResponse.json({ sessionId: session.id });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: { name: "Gameslib Donation", description: "Thank you for supporting Gameslib!", images: [`${BASE_URL}/og-image.jpg`] },
        },
        quantity: 1,
      }],
      success_url: `${BASE_URL}/donate?success=1`,
      cancel_url: `${BASE_URL}/donate?cancelled=1`,
      metadata: { type: "donation", amount: String(amount) },
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    return NextResponse.json({ error: "Stripe session creation failed" }, { status: 500 });
  }
}
