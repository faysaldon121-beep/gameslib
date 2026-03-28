// app/games/[slug]/page.tsx

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import Review from "@/models/Review";
import ImageCarousel from "@/components/games/ImageCarousel";
import SystemRequirements from "@/components/games/SystemRequirements";
import InstallGuide from "@/components/games/InstallGuide";
import RelatedGames from "@/components/games/RelatedGames";
import ReviewList from "@/components/reviews/ReviewList";
import ReviewForm from "@/components/reviews/ReviewForm";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Star, Calendar, HardDrive, Monitor, Tag, Download } from "lucide-react";

// load one game by slug, 404 if missing
async function getGame(slug: string) {
  await connectDB();
  const game = await Game.findOne({ slug }).lean();
  if (!game) notFound();
  // NOTE: Assuming reviewStats are part of the Game model for the "Player Statistics" section
  // e.g., game.reviewStats = { "5": 1150, "4": 95, "3": 15, "2": 8, "1": 15 }
  return game as any;
}

// load approved reviews sorted by helpful votes + date
async function getReviews(gameSlug: string) {
  await connectDB();
  return Review
    .find({ gameSlug, isApproved: true })
    .sort({ helpfulVotes: -1, createdAt: -1 })
    .limit(20)
    .lean();
}

// generate per‐page <head> metadata
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  await connectDB();
  const game = await Game
    .findOne({ slug: params.slug })
    .select("title shortDescription description coverImage genre slug averageRating reviewCount")
    .lean() as any;
  if (!game) return { title: "Game Not Found" };

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gameslib.net";
  const desc = game.shortDescription || String(game.description).slice(0, 160);

  return {
    title: `${game.title} Free Download`,
    description: desc,
    keywords: [game.title, "free download", "pc game", game.genre, "system requirements"],
    alternates: { canonical: `${base}/games/${game.slug}` },
    openGraph: {
      title: `${game.title} — Free Download | Gameslib`,
      description: desc,
      url: `${base}/games/${game.slug}`,
      siteName: "Gameslib",
      images: [{ url: game.coverImage, width: 1200, height: 630, alt: game.title }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${game.title} | Gameslib`,
      description: desc,
      images: [game.coverImage],
    },
  };
}

// build JSON-LD for rich result markup (no changes needed here)
function buildGameSchema(game: any, reviews: any[]) {
    // This function remains the same as in your original code
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gameslib.vercel.app";
    const safeISOString = (date: any) => {
        const d = new Date(date);
        return isNaN(d.getTime()) ? undefined : d.toISOString();
    };

    const appSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": `${base}/games/${game.slug}#software`,
        name: game.title,
        applicationCategory: "Game",
        applicationSubCategory: game.genre,
        operatingSystem: (game.platforms || []).join(", "),
        softwareVersion: game.version,
        description: game.description,
        image: game.images?.[0] ?? game.coverImage,
        url: `${base}/games/${game.slug}`,
        downloadUrl: game.downloadLinks?.[0]?.url,
        fileSize: game.fileSize,
        datePublished: safeISOString(game.releaseDate),
        dateModified: safeISOString(game.updatedAt),
        author: { "@type": "Organization", name: game.developer ?? "Unknown" },
        publisher: { "@type": "Organization", name: game.publisher ?? "Unknown" },
        offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        },
        ...(game.reviewCount > 0 && {
        aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(game.averageRating || 0).toFixed(1),
            reviewCount: game.reviewCount,
            bestRating: "5",
            worstRating: "1",
        },
        }),
        ...(reviews.length > 0 && {
        review: reviews.slice(0, 5).map(r => ({
            "@type": "Review",
            name: r.title,
            reviewBody: r.body,
            reviewRating: {
            "@type": "Rating",
            ratingValue: r.rating,
            bestRating: "5",
            worstRating: "1",
            },
            author: { "@type": "Person", name: r.userName },
            datePublished: safeISOString(r.createdAt),
        })),
        }),
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: base },
        { "@type": "ListItem", position: 2, name: "Games", item: `${base}/games` },
        {
            "@type": "ListItem",
            position: 3,
            name: game.genre,
            item: `${base}/games/genre/${String(game.genre).toLowerCase()}`,
        },
        {
            "@type": "ListItem",
            position: 4,
            name: game.title,
            item: `${base}/games/${game.slug}`,
        },
        ],
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: [
        {
            "@type": "Question",
            name: `What are the minimum system requirements for ${game.title}?`,
            acceptedAnswer: {
            "@type": "Answer",
            text: `To run ${game.title} you need: OS: ${
                game.requirements?.minimum?.os ?? "N/A"
            }, CPU: ${game.requirements?.minimum?.cpu ?? "N/A"}, RAM: ${
                game.requirements?.minimum?.ram ?? "N/A"
            }, GPU: ${game.requirements?.minimum?.gpu ?? "N/A"}, Storage: ${
                game.requirements?.minimum?.storage ?? "N/A"
            }.`,
            },
        },
        {
            "@type": "Question",
            name: `How to install ${game.title}?`,
            acceptedAnswer: {
            "@type": "Answer",
            text: game.installationGuide?.length
                ? game.installationGuide.map((s: string, i: number) => `Step ${i + 1}: ${s}`).join(" ")
                : `Download ${game.title}, extract the archive, and run the installer.`,
            },
        },
        {
            "@type": "Question",
            name: `Is ${game.title} free to download?`,
            acceptedAnswer: {
            "@type": "Answer",
            text: `Yes, ${game.title} is available as a free download on Gameslib with no registration required.`,
            },
        },
        ],
    };
    return [appSchema, breadcrumbSchema, faqSchema];
}

// Mock data for player statistics, assuming it comes from the `game` object
const MOCK_REVIEW_STATS = { "5": 1150, "4": 95, "3": 15, "2": 8, "1": 15 };

export default async function GameDetailPage({ params }: { params: { slug: string } }) {
  const [game, reviews] = await Promise.all([
    getGame(params.slug),
    getReviews(params.slug),
  ]);
  const schemas = buildGameSchema(game, reviews as any[]);
  const totalVotes = Object.values(MOCK_REVIEW_STATS).reduce((a, b) => a + b, 0);

  return (
    <>
      {/* JSON-LD for SEO */}
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-g-text">
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-sm text-g-muted mb-6"
        >
          {/* Breadcrumbs as before */}
          <Link href="/" className="hover:text-g-purple transition-colors">Home</Link>
          <span>/</span>
          <Link href="/games" className="hover:text-g-purple transition-colors">Games</Link>
          <span>/</span>
          <Link
            href={`/games/genre/${String(game.genre).toLowerCase()}`}
            className="hover:text-g-purple transition-colors capitalize"
          >
            {game.genre}
          </Link>
          <span>/</span>
          <span className="text-g-text truncate max-w-[200px]">{game.title}</span>
        </nav>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* MAIN CONTENT */}
          <article
            className="xl:col-span-2 space-y-8"
            itemScope
            itemType="https://schema.org/SoftwareApplication"
          >
            {/* --- NEW HEADER SECTION --- */}
            <section className="bg-g-card-alpha p-6 rounded-lg">
              <h1 className="text-4xl font-extrabold text-white mb-3" itemProp="name">
                {game.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
                <Badge variant="green">Free Download</Badge>
                <Badge>v{game.version}</Badge>
                <Badge>Offline</Badge>
                <div className="flex items-center gap-1 text-yellow-400" itemProp="aggregateRating" itemType="https://schema.org/AggregateRating">
                    <Star size={20} fill="currentColor" />
                    <span className="font-bold text-white text-lg" itemProp="ratingValue">{Number(game.averageRating || 0).toFixed(1)}</span>
                    <span className="text-g-muted text-sm ml-1" itemProp="reviewCount">({game.reviewCount} reviews)</span>
                </div>
              </div>
              <p className="text-g-muted mb-5 leading-relaxed" itemProp="description">
                {game.shortDescription}
              </p>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 mb-6 text-sm">
                  <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-g-purple" />
                      <span className="text-g-muted">Release Date: <time className="text-white font-medium" itemProp="datePublished">{formatDate(game.releaseDate)}</time></span>
                  </div>
                  <div className="flex items-center gap-2">
                      <HardDrive size={18} className="text-g-purple" />
                      <span className="text-g-muted">File Size: <span className="text-white font-medium" itemProp="fileSize">{game.fileSize}</span></span>
                  </div>
                  <div className="flex items-center gap-2">
                      <Monitor size={18} className="text-g-purple" />
                      <span className="text-g-muted">Genre: <span className="text-white font-medium capitalize" itemProp="applicationSubCategory">{game.genre}</span></span>
                  </div>
              </div>
              <a href={game.downloadLinks?.[0]?.url || "#"} className="flex items-center justify-center gap-3 bg-g-purple hover:bg-g-purple-dark text-white font-bold py-4 px-6 rounded-lg transition-colors w-full sm:w-auto sm:max-w-xs text-lg">
                <Download size={22} />
                Download Now
              </a>
            </section>

            {/** Carousel */}
            {(game.images?.length > 0 || game.coverImage) && (
              <ImageCarousel
                images={game.images?.length > 0 ? game.images : [game.coverImage]}
                title={game.title}
                priority
              />
            )}

            {/* About */}
            <section aria-labelledby="about-heading">
              <h2 id="about-heading" className="text-xl font-bold text-white mb-3">About {game.title}</h2>
              <div className="text-g-muted leading-relaxed whitespace-pre-wrap" itemProp="description">
                {game.description}
              </div>
              {game.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {game.tags.map((tag: string) => (
                    <span key={tag} className="flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-g-border text-g-muted hover:text-g-purple cursor-pointer transition-colors">
                      <Tag size={10} /> {tag}
                    </span>
                  ))}
                </div>
              )}
            </section>

            {/* System Requirements & Install Guide */}
            <SystemRequirements requirements={game.requirements} title={game.title} />
            {game.installationGuide?.length > 0 && (
              <InstallGuide steps={game.installationGuide} title={game.title} />
            )}

            {/* --- NEW PLAYER STATISTICS SECTION --- */}
            <section aria-labelledby="player-stats-heading" className="card p-5">
              <h2 id="player-stats-heading" className="text-lg font-bold text-white mb-4">Player Statistics</h2>
              <div className="space-y-2">
                {(Object.keys(MOCK_REVIEW_STATS).reverse() as (keyof typeof MOCK_REVIEW_STATS)[]).map(star => {
                  const count = MOCK_REVIEW_STATS[star];
                  const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
                  return (
                    <div key={star} className="flex items-center gap-3 text-sm">
                      <span className="w-12 text-g-muted">{star} Stars</span>
                      <div className="flex-grow bg-g-border rounded-full h-2.5">
                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${percentage}%` }}></div>
                      </div>
                      <span className="w-12 text-right text-g-muted font-medium">{count}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Reviews */}
            <section aria-labelledby="reviews-heading" id="reviews">
              <h2 id="reviews-heading" className="text-xl font-bold text-white mb-2">Community Reviews</h2>
              <p className="text-g-muted text-sm mb-6">Share your experience to help others — and help Google understand this game better.</p>
              <ReviewList reviews={reviews as any[]} gameTitle={game.title} />
              <div className="mt-8 pt-8 border-t border-g-border">
                <h3 className="text-lg font-bold text-white mb-4">Write a Review</h3>
                <ReviewForm gameSlug={game.slug} gameId={String(game._id)} />
              </div>
            </section>
          </article>

          {/* SIDEBAR */}
          <aside className="space-y-6">
            {/* DownloadBox removed from here */}

            <div className="card p-5 space-y-3">
              <h3 className="font-bold text-white">Game Information</h3>
              <dl className="space-y-3 text-sm">
                {[
                  ["Developer", game.developer],
                  ["Publisher", game.publisher],
                  ["Release Date", formatDate(game.releaseDate)],
                  ["Version", `v${game.version}`],
                  ["Genre", game.genre],
                  ["Platform", (game.platforms || []).join(", ")],
                  ["Size", game.fileSize || "N/A"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center gap-3">
                    <dt className="text-g-muted">{label}</dt>
                    <dd className="text-white font-medium text-right truncate max-w-[60%] capitalize">
                      {String(value)}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <RelatedGames genre={game.genre} currentSlug={game.slug} />
          </aside>
        </div>
      </div>
    </>
  );
}
