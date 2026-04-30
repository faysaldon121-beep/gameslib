"use client";

import { useEffect, useRef, useState } from "react";
import { Checkout } from "@freemius/checkout";
import { Heart, CreditCard, Building2, Copy, CheckCheck } from "lucide-react";
import { DONATION_TIERS, PRODUCT_ID, PUBLIC_KEY } from "@/lib/freemius";

export default function DonatePage() {
  const checkoutRef = useRef<Checkout | null>(null);
  const [loading, setLoading] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const IBAN = "PK71MUCB1651244871012691";

  // Initialise a single Checkout instance on mount (required for cart
  // abandonment recovery to work correctly per Freemius docs)
  useEffect(() => {
    checkoutRef.current = new Checkout({
      product_id: PRODUCT_ID,
      public_key: PUBLIC_KEY,
    });
  }, []);

  const copyIBAN = async () => {
    await navigator.clipboard.writeText(IBAN);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDonate = async (tier: (typeof DONATION_TIERS)[number]) => {
    if (!checkoutRef.current) return;
    setLoading(tier.plan_id);
    try {
      await checkoutRef.current.open({
        plan_id: tier.plan_id,
        billing_cycle: tier.billing_cycle,
        licenses: 1,
        title: `Support Gameslib – ${tier.label}`,
        purchaseCompleted: (data) => {
          console.log("Purchase completed:", data);
          // e.g. save data.purchase / data.user to your DB here
        },
        success: () => {
          setLoading(null);
        },
        cancel: () => {
          setLoading(null);
        },
      });
    } catch {
      alert("Checkout failed. Please try again.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-g-purple/20 mb-4">
          <Heart size={28} className="text-g-purple" fill="currentColor" />
        </div>
        <h1 className="text-3xl font-bold text-g-text mb-3">Support Gameslib</h1>
        <p className="text-g-muted max-w-xl mx-auto">
          Gameslib is free because of community support. Every donation helps us
          keep the servers running and the game library growing.
        </p>
      </div>

      {/* Card Payment via Freemius */}
      <section className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <CreditCard size={18} className="text-g-purple" />
          <h2 className="text-lg font-bold text-g-text">Card Payment</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DONATION_TIERS.map((tier) => (
            <button
              key={tier.plan_id}
              onClick={() => handleDonate(tier)}
              disabled={loading === tier.plan_id}
              className="card p-4 text-left hover:border-g-purple transition-all disabled:opacity-50 group"
            >
              <p className="font-bold text-g-text group-hover:text-g-purple transition-colors">
                {tier.label}
              </p>
              <p className="text-g-gold font-semibold text-sm mt-1">
                {tier.displayAmount}
              </p>
              <p className="text-xs text-g-muted mt-2">{tier.description}</p>
              {loading === tier.plan_id && (
                <span className="text-xs text-g-purple mt-2 block">
                  Opening checkout…
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Bank Transfer */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={18} className="text-g-purple" />
          <h2 className="text-lg font-bold text-g-text">Bank Transfer (IBAN)</h2>
        </div>
        <div className="card p-5">
          <p className="text-g-muted text-sm mb-4">
            For manual bank transfers, use the IBAN below. Please include your
            name in the transfer reference so we can list you as a sponsor.
          </p>
          <div className="flex items-center justify-between gap-3 bg-g-bg rounded-lg p-3 border border-g-border">
            <code className="text-g-text font-mono text-sm tracking-wider">
              {IBAN}
            </code>
            <button
              onClick={copyIBAN}
              className="flex items-center gap-1.5 text-xs text-g-purple hover:text-g-purpleLight transition-colors"
            >
              {copied ? <CheckCheck size={14} /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-g-muted mt-3">
            Bank: Meezan Bank · Account: 1651244871012691
          </p>
        </div>
      </section>
    </div>
  );
}
