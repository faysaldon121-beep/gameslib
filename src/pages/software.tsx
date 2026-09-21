import React, { useState, useEffect } from 'react';
import { RouteComponentProps, navigate } from '@reach/router';
import { Helmet } from 'react-helmet';
import { useSoftData } from '../context/GameDataContext';
import { Software } from '../types';

// Reusable component for section titles
const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="text-3xl font-bold text-white border-l-4 border-red-500 pl-4 mb-6">
    {children}
  </h2>
);

// Reusable component for system requirement lists
interface RequirementsListProps {
  title: string;
  requirements: Software['system_requirements']['minimum'];
}

const RequirementsList: React.FC<RequirementsListProps> = ({ title, requirements }) => (
  <div>
    <h3 className="text-2xl font-semibold text-gray-200 mb-4">{title}</h3>
    <ul className="space-y-2 text-gray-400">
      {Object.entries(requirements).map(([key, value]) => (
        <li key={key} className="flex justify-between border-b border-gray-700 pb-2">
          <span className="font-semibold text-gray-300">{key}:</span>
          <span>{value}</span>
        </li>
      ))}
    </ul>
  </div>
);

// Define the component's props, which it receives from the Reach Router
interface GamePageProps extends RouteComponentProps {
  slug?: string;
}

export default function GamePage({ slug }: GamePageProps) {
  // Use our custom hook for cleaner context access
  const { softwares: games } = useSoftData();

  // State to hold the found game object
  const [game, setGame] = useState<Software | undefined>(undefined);

  // State to manage the currently displayed media (can be a video or image URL)
  const [activeMediaUrl, setActiveMediaUrl] = useState<string>('');

  // This effect runs when the page loads or the 'slug' from the URL changes.
  // It finds the correct game from our global list.
  useEffect(() => {
    if (slug && games.length > 0) {
      const foundGame = games.find(g => g.title_as_slug === slug);

      if (foundGame) {
        setGame(foundGame);
        // Set the initial media to display. Prioritize the trailer if it exists.
        const initialMedia = foundGame.image_links.video_trailer || foundGame.image_links.screenshots[0];
        setActiveMediaUrl(initialMedia);
      } else {
        // If the slug doesn't match any game, redirect to the 404 page.
        navigate('/404', { replace: true });
      }
    }
  }, [slug, games]);

  // Render a loading state until the game data is found.
  if (!game) {
    return <div className="text-white text-center p-10 text-xl">Loading Game Details...</div>;
  }

  // Helper booleans for conditional rendering
  const hasFeatures = game.description.long.features && game.description.long.features.length > 0;
  const hasVideoTrailer = !!game.image_links.video_trailer;
  const isVideoActive = activeMediaUrl === game.image_links.video_trailer;

  return (
    <>
      {/* This Helmet component injects all SEO meta tags into the document's <head> */}
      <Helmet>
        <title>{game.seo.title}</title>
        <meta name="description" content={game.seo.description} />
        <meta name="keywords" content={game.seo.keywords} />

        {/* Open Graph Tags (for social sharing on platforms like Facebook) */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={game.seo.title} />
        <meta property="og:description" content={game.seo.description} />
        <meta property="og:image" content={game.image_links.poster} />
        <meta property="og:url" content={`https://gamepasskey.com/games/${game.title_as_slug}`} />

        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={game.seo.title} />
        <meta name="twitter:description" content={game.seo.description} />
        <meta name="twitter:image" content={game.image_links.poster} />

        {/* Canonical Link to prevent duplicate content issues */}
        <link rel="canonical" href={`https://gamepasskey.com/games/${game.title_as_slug}`} />
      </Helmet>

      <div className="bg-gray-900 font-sans text-gray-300">
        <div className="container mx-auto p-4 md:p-8">
          <header className="mb-8">
            <p className="text-red-500 font-semibold">{game.category}</p>
            <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight">{game.title}</h1>
          </header>

          <div className="flex flex-col lg:flex-row gap-8">
            <main className="w-full lg:w-2/3 space-y-12">

              {/* Dynamic Media Display Section */}
              <section>
                <div className="bg-black rounded-lg overflow-hidden shadow-2xl aspect-video relative">
                  {isVideoActive ? (
                    <iframe
                      src={activeMediaUrl}
                      title={`${game.title} Trailer`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  ) : (
                    <img src={activeMediaUrl} alt="Game screenshot" className="w-full h-full object-cover" />
                  )}
                </div>

                {/* Thumbnail Gallery */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mt-4">
                  {/* Conditionally render the video trailer thumbnail ONLY if it exists */}
                  {hasVideoTrailer && (
                    <button
                      onClick={() => setActiveMediaUrl(game.image_links.video_trailer!)}
                      className={`relative rounded-md overflow-hidden aspect-video transition-all duration-200 ${isVideoActive ? 'ring-4 ring-red-500' : 'opacity-60 hover:opacity-100'}`}
                    >
                      <img src={game.image_links.poster} alt="Video Trailer Thumbnail" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center" aria-hidden="true">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"></path></svg>
                      </div>
                    </button>
                  )}
                  {/* Render screenshot thumbnails */}
                  {game.image_links.screenshots.map((img, index) => (
                    <img key={index} src={img} alt={`Thumbnail ${index + 1}`} className={`cursor-pointer rounded-md transition-all duration-200 aspect-video object-cover ${activeMediaUrl === img ? 'ring-4 ring-red-500' : 'opacity-60 hover:opacity-100'}`} onClick={() => setActiveMediaUrl(img)} />
                  ))}
                </div>
              </section>

              <section>
                <SectionTitle>About The Game</SectionTitle>
                <p className="text-lg text-gray-400 whitespace-pre-line">{game.description.long.story}</p>
              </section>

              {/* Conditionally render the features section ONLY if there are features */}
              {hasFeatures && (
                <section>
                  <SectionTitle>Features</SectionTitle>
                  <ul className="list-disc list-inside space-y-2 text-lg text-gray-400">
                    {game.description.long.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </section>
              )}

              <section>
                <SectionTitle>System Requirements</SectionTitle>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-gray-800 p-6 rounded-lg">
                  <RequirementsList title="Minimum" requirements={game.system_requirements.minimum} />
                  <RequirementsList title="Recommended" requirements={game.system_requirements.recommended} />
                </div>
              </section>

            </main>

            <aside className="w-full lg:w-1/3">
              <div className="sticky top-8 space-y-6">
                <img src={game.image_links.poster} alt={`${game.title} Poster`} className="w-full rounded-lg shadow-xl" />
                <a href={game.download_link} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center text-center bg-red-600 text-white font-bold text-lg py-4 px-6 rounded-lg hover:bg-red-700 transition-colors duration-300 shadow-lg transform hover:scale-105">
                  Download Now
                </a>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}