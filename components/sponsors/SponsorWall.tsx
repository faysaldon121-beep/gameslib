import SponsorCard from "@/components/sponsors/SponsorCard";

export default function SponsorWall({ sponsors }: { sponsors: Array<Record<string, any>> }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {sponsors.map((sponsor) => (
        <SponsorCard key={String(sponsor._id)} sponsor={sponsor} />
      ))}
    </div>
  );
}
