import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import connectDB from "@/lib/mongodb";
import Game from "@/models/Game";
import type { IGame } from "@/models/Game";
import Review from "@/models/Review";
import ImageCarousel from "@/components/games/ImageCarousel";
import SystemRequirements from "@/components/games/SystemRequirements";
import InstallGuide from "@/components/games/InstallGuide";
import RelatedGames from "@/components/games/RelatedGames";
import ReviewList from "@/components/reviews/ReviewList";
import ReviewForm from "@/components/reviews/ReviewForm";
import { formatDate } from "@/lib/utils";
import { 
  FaStar, 
  FaCalendar, 
  FaHdd, 
  FaGamepad, 
  FaDownload, 
  FaWindows,
  FaUsers,
  FaCheckCircle,
  FaShieldAlt,
  FaBolt
} from "react-icons/fa";

// Extended game type with all fields we need
type GameData = IGame & {
  requirements: {
    minimum: {
      os: string;
      cpu: string;
      ram: string;
      gpu: string;
      storage: string;
      directx: string;
    };
    recommended: {
      os: string;
      cpu: string;
      ram: string;
      gpu: string;
      storage: string;
      directx: string;
    };
  };
  installationGuide: string[];
  images: string[];
  tags: string[];
  platforms: string[];
  fileSize: string;
  version: string;
  developer: string;
  publisher: string;
};

// Default placeholder data
const DEFAULT_REQUIREMENTS = {
  minimum: {
    os: "Windows 7/8/10 (64-bit)",
    cpu: "Intel Core i5-2500K / AMD FX-6300",
    ram: "8 GB RAM",
    gpu: "NVIDIA GeForce GTX 770 2GB / AMD Radeon R9 280",
    storage: "150 GB available space",
    directx: "Version 11"
  },
  recommended: {
    os: "Windows 10 (64-bit)",
    cpu: "Intel Core i7-4770K / AMD Ryzen 5 1500X",
    ram: "12 GB RAM",
    gpu: "NVIDIA GeForce GTX 1060 6GB / AMD Radeon RX 480 4GB",
    storage: "150 GB available space",
    directx: "Version 12"
  }
};

const DEFAULT_INSTALL_GUIDE = [
  "Download the game installer from the link above",
  "Extract the downloaded archive using WinRAR or 7-Zip",
  "Run Setup.exe and follow the installation wizard",
  "Wait for the installation to complete",
  "Launch the game from desktop shortcut or installation folder",
  "Enjoy playing!"
];

async function getGame(slug: string): Promise<GameData> {
  await connectDB();
  const game = await Game.findOne({ slug }).lean();
  if (!game) notFound();
  
  // Cast to any first, then build the properly typed object
  const rawGame = game as any;
  
  // Ensure defaults with proper typing
  return {
    ...rawGame,
    requirements: rawGame.requirements || DEFAULT_REQUIREMENTS,
    installationGuide: rawGame.installationGuide?.length > 0 
      ? rawGame.installationGuide 
      : DEFAULT_INSTALL_GUIDE,
    images: rawGame.images?.length > 0 
      ? rawGame.images 
      : (rawGame.coverImage ? [rawGame.coverImage] : []),
    tags: rawGame.tags || ['Action', 'Adventure', 'Open World'],
    platforms: rawGame.platforms || ['Windows'],
    fileSize: rawGame.fileSize || 'TBA',
    version: rawGame.version || '1.0',
    developer: rawGame.developer || 'Unknown Developer',
    publisher: rawGame.publisher || 'Unknown Publisher',
  } as GameData;
}

async function getReviews(gameSlug: string) {
  await connectDB();
  return Review.find({ gameSlug, isApproved: true })
    .sort({ helpfulVotes: -1, createdAt: -1 })
    .limit(20)
    .lean();
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const game = await getGame(params.slug);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gameslib.vercel.app";
  const desc = game.shortDescription || String(game.description || '').slice(0, 160) || `Download ${game.title} for free. Full version PC game with direct download links.`;

  return {
    title: `Download ${game.title} - Free PC Game | GamesLib`,
    description: desc,
    keywords: [
      game.title,
      "free download",
      "pc game",
      "full version",
      game.genre,
      "system requirements",
      "game download"
    ],
    alternates: { canonical: `${base}/games/${game.slug}` },
    openGraph: {
      title: `${game.title} - Free Download Full Version`,
      description: desc,
      url: `${base}/games/${game.slug}`,
      siteName: "GamesLib",
      images: [{ 
        url: game.coverImage || `${base}/default-game.jpg`, 
        width: 1200, 
        height: 630, 
        alt: game.title 
      }],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${game.title} - Free Download`,
      description: desc,
      images: [game.coverImage || `${base}/default-game.jpg`],
    },
  };
}

function buildGameSchema(game: GameData, reviews: any[]) {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gameslib.vercel.app";
  const safeISOString = (date: any) => {
    if (!date) return new Date().toISOString();
    const d = new Date(date);
    return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
  };

  return {
    "@context": "https://schema.org",
    "@type": "VideoGame",
    "@id": `${base}/games/${game.slug}#game`,
    name: game.title,
    description: game.description || game.shortDescription || `Download ${game.title} for free`,
    genre: game.genre,
    gamePlatform: game.platforms?.join(", ") || "Windows",
    image: game.coverImage,
    url: `${base}/games/${game.slug}`,
    applicationCategory: "Game",
    datePublished: safeISOString(game.releaseDate),
    author: { "@type": "Organization", name: game.developer },
    publisher: { "@type": "Organization", name: game.publisher },
    ...(game.reviewCount && game.reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: Number(game.averageRating || 4.5).toFixed(1),
        reviewCount: game.reviewCount,
        bestRating: "5",
        worstRating: "1",
      },
    }),
  };
}

export default async function GameDetailPage({ params }: { params: { slug: string } }) {
  const [game, reviews] = await Promise.all([
    getGame(params.slug),
    getReviews(params.slug),
  ]);
  
  const schema = buildGameSchema(game, reviews as any[]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <div className="min-h-screen bg-gray-950">
        {/* Hero Section - AnkerGames Style */}
        <div className="relative h-[500px] overflow-hidden">
          {game.coverImage ? (
            <Image
              src={game.coverImage}
              alt={game.title}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 to-cyan-900/50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent" />
          
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="max-w-7xl mx-auto">
              {/* Breadcrumb */}
              <nav className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                <Link href="/" className="hover:text-purple-400 transition-colors">Home</Link>
                <span>/</span>
                <Link href="/games" className="hover:text-purple-400 transition-colors">Games</Link>
                <span>/</span>
                <span className="text-white">{game.title}</span>
              </nav>

              <div className="flex items-end gap-6">
                {/* Game Cover */}
                <div className="relative w-48 h-64 rounded-xl overflow-hidden border-4 border-gray-800 shadow-2xl flex-shrink-0 hidden sm:block">
                  {game.coverImage ? (
                    <Image
                      src={game.coverImage}
                      alt={game.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-cyan-600 flex items-center justify-center">
                      <FaGamepad className="text-6xl text-white/30" />
                    </div>
                  )}
                </div>

                {/* Title & Meta */}
                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
                    {game.title}
                  </h1>
                  
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="flex items-center gap-1">
                      <FaStar className="text-yellow-400" />
                      <span className="text-white font-bold text-lg">
                        {Number(game.averageRating || 4.5).toFixed(1)}
                      </span>
                      <span className="text-gray-400 text-sm">
                        ({game.reviewCount || 0} reviews)
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-semibold border border-green-500/30">
                      Free Download
                    </span>
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-semibold border border-purple-500/30">
                      {game.genre}
                    </span>
                  </div>

                  <p className="text-gray-300 text-lg max-w-3xl mb-6">
                    {game.shortDescription || `Download ${game.title} for free. Enjoy the full version of this amazing ${game.genre} game on your PC.`}
                  </p>

                  {/* Download Button */}
                  <Link
                    href={`/download/${game.slug}`}
                    className="inline-flex items-center gap-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg text-lg"
                  >
                    <FaDownload className="text-xl" />
                    Download Now
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Screenshots */}
              {game.images?.length > 0 && (
                <ImageCarousel images={game.images} title={game.title} />
              )}

              {/* About */}
              <section className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaGamepad className="text-purple-400" />
                  About {game.title}
                </h2>
                <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {game.description || `${game.title} is an exciting ${game.genre} game that offers an immersive gaming experience. Download the full version for free and enjoy hours of entertainment on your PC.`}
                </div>
                
                {game.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-6 pt-6 border-t border-gray-800">
                    {game.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-gray-800 text-gray-400 rounded-lg text-sm hover:bg-gray-700 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </section>

              {/* System Requirements */}
              <SystemRequirements 
                requirements={game.requirements} 
                title={game.title} 
              />

              {/* Installation Guide */}
              <InstallGuide 
                steps={game.installationGuide} 
                title={game.title} 
              />

              {/* Reviews */}
              <section className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800" id="reviews">
                <h2 className="text-2xl font-bold text-white mb-6">
                  Community Reviews
                </h2>
                <ReviewList reviews={reviews as any[]} gameTitle={game.title} />
                <div className="mt-8 pt-8 border-t border-gray-800">
                  <h3 className="text-xl font-bold text-white mb-4">Write a Review</h3>
                  <ReviewForm gameSlug={game.slug} gameId={String(game._id)} />
                </div>
              </section>
            </div>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Download Card */}
              <div className="bg-gradient-to-br from-purple-900/30 to-cyan-900/30 rounded-2xl p-6 border border-purple-500/30 sticky top-4">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <FaDownload className="text-purple-400" />
                  Quick Download
                </h3>
                
                <Link
                  href={`/download/${game.slug}`}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white font-bold py-3 px-4 rounded-xl transition-all mb-4"
                >
                  <FaDownload />
                  Download {game.title}
                </Link>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-green-400">
                    <FaCheckCircle className="flex-shrink-0" />
                    <span>No registration required</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <FaBolt className="flex-shrink-0" />
                    <span>Direct high-speed download</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <FaShieldAlt className="flex-shrink-0" />
                    <span>Virus scanned & safe</span>
                  </div>
                </div>
              </div>

              {/* Game Info */}
              <div className="bg-gray-900/50 rounded-2xl p-6 border border-gray-800">
                <h3 className="text-lg font-bold text-white mb-4">Game Information</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <dt className="text-gray-400 flex items-center gap-2">
                      <FaUsers className="text-purple-400" />
                      Developer
                    </dt>
                    <dd className="text-white font-medium">{game.developer}</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-gray-400">Publisher</dt>
                    <dd className="text-white font-medium">{game.publisher}</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-gray-400 flex items-center gap-2">
                      <FaCalendar className="text-purple-400" />
                      Release Date
                    </dt>
                    <dd className="text-white font-medium">
                      {formatDate(game.releaseDate)}
                    </dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-gray-400">Version</dt>
                    <dd className="text-white font-medium">v{game.version}</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-gray-400">Genre</dt>
                    <dd className="text-white font-medium capitalize">{game.genre}</dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-gray-400 flex items-center gap-2">
                      <FaWindows className="text-purple-400" />
                      Platform
                    </dt>
                    <dd className="text-white font-medium">
                      {game.platforms?.join(", ")}
                    </dd>
                  </div>
                  <div className="flex justify-between items-center">
                    <dt className="text-gray-400 flex items-center gap-2">
                      <FaHdd className="text-purple-400" />
                      File Size
                    </dt>
                    <dd className="text-white font-medium">{game.fileSize}</dd>
                  </div>
                </dl>
              </div>

              {/* Related Games */}
              <RelatedGames genre={game.genre} currentSlug={game.slug} />
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
