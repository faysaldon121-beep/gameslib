// app/collections/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Gamepad2, 
  TrendingUp, 
  Clock, 
  Download, 
  ChevronRight,
  Grid3x3,
  Sparkles,
  Star,
  Zap,
  Trophy,
  Target,
  Sword,
  Car,
  Ghost,
  Puzzle,
  Music,
  Globe
} from 'lucide-react';

interface Game {
  _id: string;
  title: string;
  slug: string;
  coverImage: string;
}

interface Collection {
  name: string;
  slug: string;
  description: string;
  icon: string;
  count: number;
  thumbnail: string;
  gradient: string;
  featuredGames: Game[];
}

// Predefined collections data
const COLLECTION_CONFIG: Record<string, { description: string; icon: string; gradient: string }> = {
  'new-releases': {
    description: 'Latest games added to our collection',
    icon: 'clock',
    gradient: 'from-green-500 to-emerald-600',
  },
  'most-downloaded': {
    description: 'Most popular games by download count',
    icon: 'download',
    gradient: 'from-blue-500 to-cyan-600',
  },
  'trending': {
    description: 'Games that are trending this week',
    icon: 'trending',
    gradient: 'from-orange-500 to-red-600',
  },
  'featured': {
    description: 'Hand-picked games by our editors',
    icon: 'star',
    gradient: 'from-yellow-500 to-amber-600',
  },
  'action': {
    description: 'High-octane action and combat games',
    icon: 'sword',
    gradient: 'from-red-500 to-rose-600',
  },
  'adventure': {
    description: 'Epic journeys and exploration',
    icon: 'globe',
    gradient: 'from-purple-500 to-violet-600',
  },
  'racing': {
    description: 'Fast cars and thrilling races',
    icon: 'car',
    gradient: 'from-cyan-500 to-blue-600',
  },
  'horror': {
    description: 'Scary and thrilling experiences',
    icon: 'ghost',
    gradient: 'from-gray-700 to-gray-900',
  },
  'puzzle': {
    description: 'Brain teasers and strategy games',
    icon: 'puzzle',
    gradient: 'from-pink-500 to-fuchsia-600',
  },
  'sports': {
    description: 'Football, basketball, and more',
    icon: 'trophy',
    gradient: 'from-emerald-500 to-teal-600',
  },
  'rpg': {
    description: 'Role-playing adventures',
    icon: 'target',
    gradient: 'from-indigo-500 to-purple-600',
  },
  'simulation': {
    description: 'Life and world simulators',
    icon: 'zap',
    gradient: 'from-teal-500 to-green-600',
  },
};

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalGames, setTotalGames] = useState(0);

  useEffect(() => {
    async function fetchCollections() {
      try {
        // Fetch games from API to build collections
        const res = await fetch('/api/games?limit=100');
        
        if (!res.ok) {
          // If API fails, use static collections
          setCollections(getStaticCollections());
          setLoading(false);
          return;
        }

        const data = await res.json();
        const games = data.games || [];
        setTotalGames(data.total || games.length);

        // Build collections from games
        const collectionsMap = new Map<string, Collection>();

        // Dynamic collections
        const dynamicCollections = [
          { 
            name: 'New Releases', 
            slug: 'new-releases', 
            games: [...games].sort((a: any, b: any) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            ).slice(0, 20)
          },
          { 
            name: 'Most Downloaded', 
            slug: 'most-downloaded', 
            games: [...games].sort((a: any, b: any) => 
              (b.downloads || 0) - (a.downloads || 0)
            ).slice(0, 20)
          },
          { 
            name: 'Trending', 
            slug: 'trending', 
            games: [...games].sort((a: any, b: any) => 
              (b.views || 0) - (a.views || 0)
            ).slice(0, 20)
          },
          { 
            name: 'Featured', 
            slug: 'featured', 
            games: games.filter((g: any) => g.isFeatured).slice(0, 20)
          },
        ];

        dynamicCollections.forEach(col => {
          if (col.games.length > 0) {
            const config = COLLECTION_CONFIG[col.slug] || {
              description: `Browse ${col.name} games`,
              icon: 'grid',
              gradient: 'from-purple-500 to-blue-600',
            };
            
            collectionsMap.set(col.slug, {
              name: col.name,
              slug: col.slug,
              description: config.description,
              icon: config.icon,
              count: col.games.length,
              thumbnail: col.games[0]?.coverImage || '/placeholder.jpg',
              gradient: config.gradient,
              featuredGames: col.games.slice(0, 4),
            });
          }
        });

        // Category-based collections
        const categoryMap = new Map<string, any[]>();
        games.forEach((game: any) => {
          const category = game.category?.toLowerCase() || 'other';
          if (!categoryMap.has(category)) {
            categoryMap.set(category, []);
          }
          categoryMap.get(category)?.push(game);
        });

        categoryMap.forEach((categoryGames, category) => {
          const slug = category.toLowerCase().replace(/\s+/g, '-');
          const config = COLLECTION_CONFIG[slug] || {
            description: `Browse ${category} games`,
            icon: 'grid',
            gradient: 'from-purple-500 to-blue-600',
          };

          collectionsMap.set(slug, {
            name: category.charAt(0).toUpperCase() + category.slice(1),
            slug,
            description: config.description,
            icon: config.icon,
            count: categoryGames.length,
            thumbnail: categoryGames[0]?.coverImage || '/placeholder.jpg',
            gradient: config.gradient,
            featuredGames: categoryGames.slice(0, 4),
          });
        });

        setCollections(Array.from(collectionsMap.values()));
      } catch (err) {
        console.error('Error fetching collections:', err);
        setCollections(getStaticCollections());
      } finally {
        setLoading(false);
      }
    }

    fetchCollections();
  }, []);

  const getStaticCollections = (): Collection[] => {
    return Object.entries(COLLECTION_CONFIG).map(([slug, config]) => ({
      name: slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      slug,
      description: config.description,
      icon: config.icon,
      count: 0,
      thumbnail: '/placeholder.jpg',
      gradient: config.gradient,
      featuredGames: [],
    }));
  };

  const getIcon = (iconName: string) => {
    const iconClass = "w-8 h-8";
    switch (iconName) {
      case 'clock': return <Clock className={iconClass} />;
      case 'download': return <Download className={iconClass} />;
      case 'trending': return <TrendingUp className={iconClass} />;
      case 'star': return <Star className={iconClass} />;
      case 'sword': return <Sword className={iconClass} />;
      case 'car': return <Car className={iconClass} />;
      case 'ghost': return <Ghost className={iconClass} />;
      case 'puzzle': return <Puzzle className={iconClass} />;
      case 'trophy': return <Trophy className={iconClass} />;
      case 'target': return <Target className={iconClass} />;
      case 'zap': return <Zap className={iconClass} />;
      case 'globe': return <Globe className={iconClass} />;
      case 'music': return <Music className={iconClass} />;
      default: return <Grid3x3 className={iconClass} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400 text-lg">Loading collections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900/20 to-gray-900 text-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">Browse by Collection</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-black mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
              Game Collections
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover curated collections of the best games across different genres and categories
            </p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-2xl p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-3xl font-bold text-purple-400">{collections.length}</div>
              <div className="text-sm text-gray-400">Collections</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">{totalGames}</div>
              <div className="text-sm text-gray-400">Total Games</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-pink-400">Free</div>
              <div className="text-sm text-gray-400">All Downloads</div>
            </div>
          </div>
        </div>
      </div>

      {/* Collections Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-8 text-red-400 text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <Link
              key={collection.slug}
              href={`/games?category=${collection.slug}`}
              className="group relative bg-gray-800/50 backdrop-blur-sm rounded-2xl overflow-hidden border border-gray-700/50 hover:border-purple-500/50 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/20"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${collection.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
              
              {/* Thumbnail Background */}
              <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity">
                {collection.thumbnail && (
                  <img
                    src={collection.thumbnail}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-transparent"></div>
              </div>

              {/* Content */}
              <div className="relative p-6">
                {/* Icon */}
                <div className={`mb-4 w-16 h-16 rounded-xl bg-gradient-to-br ${collection.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                  {getIcon(collection.icon)}
                </div>

                {/* Title & Description */}
                <h3 className="text-2xl font-bold mb-2 group-hover:text-purple-400 transition-colors">
                  {collection.name}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                  {collection.description}
                </p>

                {/* Game Count */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-3xl font-black bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    {collection.count}
                  </span>
                  <span className="text-gray-500">Games</span>
                </div>

                {/* Featured Games Preview */}
                {collection.featuredGames.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {collection.featuredGames.map((game, idx) => (
                      <div
                        key={game._id || idx}
                        className="aspect-square rounded-lg overflow-hidden border border-gray-700/50 group-hover:border-purple-500/30 transition-colors"
                      >
                        <img
                          src={game.coverImage || '/placeholder.jpg'}
                          alt={game.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      </div>
                    ))}
                    {/* Placeholder for missing games */}
                    {Array.from({ length: Math.max(0, 4 - collection.featuredGames.length) }).map((_, idx) => (
                      <div
                        key={`placeholder-${idx}`}
                        className="aspect-square rounded-lg bg-gray-700/50 border border-gray-700/50"
                      ></div>
                    ))}
                  </div>
                )}

                {/* View Button */}
                <div className="flex items-center text-purple-400 group-hover:text-purple-300 transition-colors">
                  <span className="text-sm font-semibold">Browse Collection</span>
                  <ChevronRight className="w-5 h-5 ml-1 group-hover:translate-x-2 transition-transform" />
                </div>
              </div>

              {/* Corner Badge */}
              {collection.slug === 'trending' && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  🔥 HOT
                </div>
              )}
              {collection.slug === 'new-releases' && (
                <div className="absolute top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                  ✨ NEW
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {collections.length === 0 && !loading && (
          <div className="text-center py-20">
            <Gamepad2 className="w-20 h-20 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-400 mb-2">No Collections Found</h3>
            <p className="text-gray-500 mb-6">Check back soon for curated game collections!</p>
            <Link
              href="/games"
              className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              <Gamepad2 className="w-5 h-5" />
              Browse All Games
            </Link>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 rounded-3xl border border-purple-500/20 p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            Use our advanced search to find exactly the game you want, or browse all games in our library.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/games"
              className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105"
            >
              <Gamepad2 className="w-5 h-5" />
              Browse All Games
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 px-8 py-4 rounded-xl font-semibold transition-all hover:scale-105"
            >
              <Target className="w-5 h-5" />
              Advanced Search
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
