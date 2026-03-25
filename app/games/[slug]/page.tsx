import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import Review from "@/models/Review";
import ImageCarousel from "@/components/games/ImageCarousel";
import SystemRequirements from "@/components/games/SystemRequirements";
import InstallGuide from "@/components/games/InstallGuide";
import DownloadBox from "@/components/games/DownloadBox";
import RelatedGames from "@/components/games/RelatedGames";
import ReviewList from "@/components/reviews/ReviewList";
import ReviewForm from "@/components/reviews/ReviewForm";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { Star, Calendar, HardDrive, Monitor, Tag } from "lucide-react";

async function getGame(slug: string) {
  await connectDB();
  const game = await Game.findOne({ slug }).lean();
  if (!game) notFound();
  return game as any;
}

async function getReviews(gameSlug: string) {
  await connectDB();
  return Review.find({ gameSlug, isApproved: true }).sort({ helpfulVotes: -1, createdAt: -1 }).limit(20).lean();
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  await connectDB();
  const game = await Game.findOne({ slug: params.slug }).select("title shortDescription description coverImage genre slug averageRating reviewCount").lean() as any;
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
    twitter: { card: "summary_large_image", title: `${game.title} | Gameslib`, description: desc, images: [game.coverImage] },
  };
}

function buildGameSchema(game: any, reviews: any[]) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gameslib.vercel.app";
  const safeISOString = (date:any) => {
  const d = new Date(date);
  return isNaN(d.getTime()) ? undefined : d.toISOString();
};

const appSchema = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  '@id': `${base}/games/${game.slug}#software`,
  name: game.title,
  applicationCategory: 'Game',
  applicationSubCategory: game.genre,
  operatingSystem: (game.platforms || []).join(', '),
  softwareVersion: game.version,
  description: game.description,
  image: game.images?.[0] ?? game.coverImage,
  url: `${base}/games/${game.slug}`,
  downloadUrl: game.downloadLinks?.[0]?.url,
  fileSize: game.fileSize,
  datePublished: safeISOString(game.releaseDate),
  dateModified: safeISOString(game.updatedAt),
  author: { '@type': 'Organization', name: game.developer ?? 'Unknown' },
  publisher: { '@type': 'Organization', name: game.publisher ?? 'Unknown' },
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD', availability: 'https://schema.org/InStock' },
  ...(game.reviewCount > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: Number(game.averageRating || 0).toFixed(1), reviewCount: game.reviewCount, bestRating: '5', worstRating: '1' } } : {}),
  ...(reviews.length > 0 ? { review: reviews.slice(0, 5).map((r) => ({ '@type': 'Review', name: r.title, reviewBody: r.body, reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: '5', worstRating: '1' }, author: { '@type': 'Person', name: r.userName }, datePublished: safeISOString(r.createdAt) })) } : {}),
};
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: base },
      { '@type': 'ListItem', position: 2, name: 'Games', item: `${base}/games` },
      { '@type': 'ListItem', position: 3, name: game.genre, item: `${base}/games/genre/${String(game.genre).toLowerCase()}` },
      { '@type': 'ListItem', position: 4, name: game.title, item: `${base}/games/${game.slug}` },
    ],
  };
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: `What are the minimum system requirements for ${game.title}?`, acceptedAnswer: { '@type': 'Answer', text: `To run ${game.title} you need: OS: ${game.requirements?.minimum?.os ?? 'N/A'}, CPU: ${game.requirements?.minimum?.cpu ?? 'N/A'}, RAM: ${game.requirements?.minimum?.ram ?? 'N/A'}, GPU: ${game.requirements?.minimum?.gpu ?? 'N/A'}, Storage: ${game.requirements?.minimum?.storage ?? 'N/A'}.` } },
      { '@type': 'Question', name: `How to install ${game.title}?`, acceptedAnswer: { '@type': 'Answer', text: game.installationGuide?.length ? game.installationGuide.map((s: string, i: number) => `Step ${i + 1}: ${s}`).join(' ') : `Download ${game.title}, extract the archive, and run the installer.` } },
      { '@type': 'Question', name: `Is ${game.title} free to download?`, acceptedAnswer: { '@type': 'Answer', text: `Yes, ${game.title} is available as a free download on Gameslib with no registration required.` } },
    ],
  };
  return [appSchema, breadcrumbSchema, faqSchema];
}

export default async function GameDetailPage({ params }: { params: { slug: string } }) {
  const [game, reviews] = await Promise.all([getGame(params.slug), getReviews(params.slug)]);
  const schemas = buildGameSchema(game, reviews as any[]);
  return (
    <>
      {schemas.map((schema, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />)}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-g-muted mb-6">
          <Link href="/" className="hover:text-g-purple transition-colors">Home</Link><span>/</span>
          <Link href="/games" className="hover:text-g-purple transition-colors">Games</Link><span>/</span>
          <Link href={`/games/genre/${String(game.genre).toLowerCase()}`} className="hover:text-g-purple transition-colors capitalize">{game.genre}</Link><span>/</span>
          <span className="text-g-text truncate max-w-[200px]">{game.title}</span>
        </nav>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <article className="xl:col-span-2 space-y-8" itemScope itemType="https://schema.org/SoftwareApplication">
            <header>
              <div className="flex flex-wrap items-start gap-3 mb-3">
                <Badge variant="genre">{game.genre}</Badge>
                {game.isFeatured && <Badge variant="featured">Featured</Badge>}
                <Badge variant="version">v{game.version}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-g-text mb-3" itemProp="name">{game.title} Free Download</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-g-muted">
                {game.averageRating > 0 && <span className="flex items-center gap-1 text-g-gold font-semibold"><Star size={15} fill="currentColor" />{Number(game.averageRating).toFixed(1)}<span className="text-g-muted font-normal">({game.reviewCount} reviews)</span></span>}
                <span className="flex items-center gap-1"><Calendar size={14} /> {formatDate(game.releaseDate)}</span>
                {game.fileSize && <span className="flex items-center gap-1"><HardDrive size={14} /> {game.fileSize}</span>}
                <span className="flex items-center gap-1"><Monitor size={14} /> {(game.platforms || []).join(', ')}</span>
              </div>
            </header>
            {(game.images?.length > 0 || game.coverImage) && <ImageCarousel images={game.images?.length > 0 ? game.images : [game.coverImage]} title={game.title} priority />}
            <section aria-labelledby="about-heading">
              <h2 id="about-heading" className="text-xl font-bold text-g-text mb-3">About {game.title}</h2>
              <p className="text-g-muted leading-relaxed whitespace-pre-wrap" itemProp="description">{game.description}</p>
              {game.tags?.length > 0 && <div className="flex flex-wrap gap-2 mt-4">{game.tags.map((tag: string) => <span key={tag} className="flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-g-border text-g-muted hover:text-g-purple cursor-pointer transition-colors"><Tag size={10} /> {tag}</span>)}</div>}
            </section>
            <SystemRequirements requirements={game.requirements} title={game.title} />
            {game.installationGuide?.length > 0 && <InstallGuide steps={game.installationGuide} title={game.title} />}
            <section aria-labelledby="reviews-heading" id="reviews">
              <h2 id="reviews-heading" className="text-xl font-bold text-g-text mb-2">Community Reviews</h2>
              <p className="text-g-muted text-sm mb-6">Share your experience to help others — and help Google understand this game better.</p>
              <ReviewList reviews={reviews as any[]} gameTitle={game.title} />
              <div className="mt-8 pt-8 border-t border-g-border">
                <h3 className="text-lg font-bold text-g-text mb-4">Write a Review</h3>
                <ReviewForm gameSlug={game.slug} gameId={String(game._id)} />
              </div>
            </section>
          </article>
          <aside className="space-y-6">
            <DownloadBox game={game} />
            <div className="card p-5 space-y-3">
              <h3 className="font-bold text-g-text">Game Info</h3>
              <dl className="space-y-2 text-sm">
                {[["Developer", game.developer], ["Publisher", game.publisher], ["Version", `v${game.version}`], ["Genre", game.genre], ["Platform", (game.platforms || []).join(', ')], ["Size", game.fileSize || 'N/A']].map(([label, value]) => (
                  <div key={String(label)} className="flex justify-between gap-3"><dt className="text-g-muted">{label}</dt><dd className="text-g-text font-medium text-right max-w-[60%]">{String(value)}</dd></div>
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
