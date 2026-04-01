import { Suspense } from "react";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import Sponsor from "@/models/Sponsor";
import HeroSection from "@/components/home/HeroSection";
import FeaturedGames from "@/components/home/FeaturedGames";
import StatsBar from "@/components/home/StatsBar";
import SponsorWall from "@/components/sponsors/SponsorWall";

export const revalidate = 3600;

async function getData() {
  await connectDB();
  const [featuredGames, sponsors, totalGames] = await Promise.all([
    Game.find({ isFeatured: true }).sort({ averageRating: -1 }).limit(6).select("title slug shortDescription coverImage genre averageRating reviewCount version platforms isFeatured").lean(),
    Sponsor.find({ isActive: true }).sort({ amount: -1 }).limit(12).lean(),
    Game.countDocuments(),
  ]);
  return { featuredGames, sponsors, totalGames };
}

async function getTopGames(page = 1) {
  await connectDB();
  const skip = (page - 1) * PAGE_SIZE;

  const [games, total] = await Promise.all([
    Game.find()
      .sort({ averageRating: -1, reviewCount: -1 }) // primary & tie-breaker
      .skip(skip)
      .limit(PAGE_SIZE)
      .select(
        'title slug shortDescription coverImage genre averageRating reviewCount version platforms'
      )
      .lean(),
    Game.countDocuments()
  ]);

  return { games, total, page, totalPages: Math.ceil(total / PAGE_SIZE) };
}

export default async function HomePage() {
  let { sponsors, totalGames } = await getData();
  let featuredGames = await getTopGames();
  
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gameslib.net";
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Gameslib',
    url: base,
    description: 'Free PC games download library with installation guides and system requirements.',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${base}/games?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <HeroSection totalGames={totalGames} />
      <StatsBar totalGames={totalGames} />
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="section-title">Featured Games</h2>
        <p className="section-sub">Hand-picked titles with the highest community ratings</p>
        <Suspense fallback={<div className="h-64 skeleton rounded-xl" />}>
          <FeaturedGames games={featuredGames} />
        </Suspense>
      </section>
      {sponsors.length > 0 && (
        <section className="border-t border-g-border py-12 bg-g-card/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="section-title text-center">Our Sponsors</h2>
            <p className="section-sub text-center">Support the platform that keeps games free</p>
            <SponsorWall sponsors={sponsors as any[]} />
          </div>
        </section>
      )}
    </>
  );
}
