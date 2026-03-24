import Image from "next/image";

export default function SponsorCard({ sponsor, size = "sm" }: { sponsor: any; size?: "sm" | "lg" }) {
  return (
    <a href={sponsor.websiteUrl || "#"} target="_blank" rel="noreferrer" className="card p-4 flex flex-col items-center justify-center text-center hover:border-g-purple min-h-[140px]">
      {sponsor.logoUrl ? (
        <div className={`relative ${size === "lg" ? "h-20 w-40" : "h-12 w-24"} mb-3`}>
          <Image src={sponsor.logoUrl} alt={sponsor.name} fill className="object-contain" />
        </div>
      ) : (
        <div className={`rounded-full bg-g-purple/15 text-g-purple flex items-center justify-center font-bold ${size === "lg" ? "h-20 w-20 text-2xl" : "h-12 w-12 text-sm"} mb-3`}>
          {sponsor.name.slice(0, 2).toUpperCase()}
        </div>
      )}
      <div className="font-semibold text-g-text">{sponsor.name}</div>
      <div className="text-xs text-g-muted mt-1 capitalize">{sponsor.tier} sponsor</div>
    </a>
  );
}
