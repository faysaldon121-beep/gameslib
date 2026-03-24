import type { Metadata } from "next";
import connectDB from "@/lib/mongodb";
import Sponsor from "@/models/Sponsor";
import SponsorCard from "@/components/sponsors/SponsorCard";

export const metadata: Metadata = {
  title: "Our Sponsors",
  description: "Meet the sponsors who keep Gameslib free. Join our sponsor wall with Gold, Silver, or Bronze tier sponsorship.",
};

export const revalidate = 3600;

export default async function SponsorsPage() {
  await connectDB();
  const sponsors = await Sponsor.find({ isActive: true }).sort({ amount: -1 }).lean() as any[];
  const gold = sponsors.filter((s) => s.tier === "gold");
  const silver = sponsors.filter((s) => s.tier === "silver");
  const bronze = sponsors.filter((s) => s.tier === "bronze");
  const tierConfig = {
    gold: { label: "Gold Sponsors", color: "text-g-gold", border: "border-g-gold/30", bg: "bg-g-gold/5" },
    silver: { label: "Silver Sponsors", color: "text-g-silver", border: "border-g-silver/30", bg: "bg-g-silver/5" },
    bronze: { label: "Bronze Sponsors", color: "text-g-bronze", border: "border-g-border", bg: "" },
  } as const;
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-g-text mb-3">Wall of Sponsors</h1>
        <p className="text-g-muted max-w-xl mx-auto">These organizations and individuals make Gameslib possible. Their support keeps every game free for everyone.</p>
        <a href="/donate" className="btn-primary mt-6 inline-flex">Become a Sponsor</a>
      </div>
      {([['gold', gold], ['silver', silver], ['bronze', bronze]] as const).map(([tier, list]) => list.length > 0 ? (
        <section key={tier} className="mb-12">
          <h2 className={`text-xl font-bold mb-5 ${tierConfig[tier].color}`}>{tierConfig[tier].label}</h2>
          <div className={`rounded-xl border ${tierConfig[tier].border} ${tierConfig[tier].bg} p-6`}>
            <div className={`grid gap-4 ${tier === 'gold' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4'}`}>
              {list.map((sponsor) => <SponsorCard key={String(sponsor._id)} sponsor={sponsor} size={tier === 'gold' ? 'lg' : 'sm'} />)}
            </div>
          </div>
        </section>
      ) : null)}
      {sponsors.length === 0 && <div className="text-center py-20 text-g-muted"><p className="text-xl mb-2">No sponsors yet</p><p>Be the first to support Gameslib!</p></div>}
    </div>
  );
}
