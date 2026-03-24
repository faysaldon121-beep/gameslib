import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import Review from "@/models/Review";
import RequestModel from "@/models/Request";
import Sponsor from "@/models/Sponsor";

export default async function AdminDashboardPage() {
  await connectDB();
  const [games, pendingReviews, requests, sponsors] = await Promise.all([
    Game.countDocuments(),
    Review.countDocuments({ isApproved: false }),
    RequestModel.countDocuments({ status: "Pending" }),
    Sponsor.countDocuments({ isActive: true }),
  ]);

  const cards = [
    { label: "Games", value: games },
    { label: "Pending reviews", value: pendingReviews },
    { label: "Pending requests", value: requests },
    { label: "Active sponsors", value: sponsors },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-g-text mb-2">Admin Dashboard</h1>
      <p className="text-g-muted mb-8">Manage content, moderation, and sponsorships from one place.</p>
      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="card p-5">
            <div className="text-sm text-g-muted">{card.label}</div>
            <div className="text-3xl font-bold text-g-text mt-2">{card.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
