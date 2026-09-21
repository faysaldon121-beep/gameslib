// import { Helmet } from 'react-helmet';
// import React from 'react';
// import { useRouteData } from 'react-static';

// export default function Home() {
//   // Get the full 'games' array from the route data
//   const { games } = useRouteData();

//   return (
//     <>
//     <Helmet>
//       <link rel="icon" type="image/png" href="/logo.png" />
//       <title>Anglo Sciences Academy Kohla</title>
//       <meta name="description" content="Anglo Sciences Academy Kohla is a trusted educational institution providing quality resources, notes, and exam materials for students, teachers, and parents. Empowering academic excellence and lifelong learning in the Kohla region." />
//       <meta property="og:title" content="Anglo Sciences Academy Kohla" />
//       <meta property="og:description" content="Anglo Sciences Academy Kohla is a trusted educational institution providing quality resources, notes, and exam materials for students, teachers, and parents. Empowering academic excellence and lifelong learning in the Kohla region." />
//       <meta property="og:type" content="website" />
//       <meta property="og:url" content="https://angloacademy.pk/" />
//       <meta property="og:image" content="https://angloacademy.pk/logo.png" />
//       <meta name="twitter:card" content="summary_large_image" />
//       <meta name="twitter:title" content="Anglo Sciences Academy Kohla" />
//       <meta name="twitter:description" content="Anglo Sciences Academy Kohla is a trusted educational institution providing quality resources, notes, and exam materials for students, teachers, and parents. Empowering academic excellence and lifelong learning in the Kohla region." />
//       <meta name="twitter:image" content="https://angloacademy.pk/logo.png" />
//       <script type="application/ld+json">{`
//         {
//           "@context": "https://schema.org",
//           "@type": "EducationalOrganization",
//           "name": "Anglo Sciences Academy Kohla",
//           "url": "https://angloacademy.pk/",
//           "logo": "https://angloacademy.pk/logo.png",
//           "description": "Anglo Sciences Academy Kohla is a trusted educational institution providing quality resources, notes, and exam materials for students, teachers, and parents. Empowering academic excellence and lifelong learning in the Kohla region.",
//           "address": {
//             "@type": "PostalAddress",
//             "addressCountry": "PK"
//           },
//           "sameAs": [
//             "https://facebook.com/angloacademy",
//             "https://twitter.com/angloacademy"
//           ]
//         }
//       `}</script>
//     </Helmet>
//       <div className="bg-gray-900 min-h-screen text-gray-200">
//         <div className="container mx-auto p-8">
//           <h1 className="text-5xl font-extrabold text-white text-center mb-12">
//              The Ultimate Destination for Every Gamer
//           </h1>

//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
//             {games.map(game => (
//               <a
//                 key={game.title_as_slug}
//                 href={`/games/${game.title_as_slug}`}
//                 className="group bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
//               >
//                 <div className="relative">
//                   <img
//                     src={game.image_links.poster}
//                     alt={`${game.game_title} Poster`}
//                     className="w-full h-80 object-cover"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
//                 </div>
//                 <div className="p-4">
//                   <h2 className="text-lg font-bold text-white truncate group-hover:text-red-400 transition-colors">
//                     {game.game_title}
//                   </h2>
//                   <p className="text-sm text-gray-400 mt-1">
//                     {game.game_description.short}
//                   </p>
//                 </div>
//               </a>
//             ))}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

import React, { useContext } from 'react';
import { GameDataContext } from '../context/GameDataContext';
import { Helmet } from 'react-helmet';
// import { Game } from '../types';

const Home: React.FC<{ path?: string }> = () => {
  const { games } = useContext(GameDataContext);

  if (!games) {
    return <h1>Loading games...</h1>;
  }

  return (

    <>
      <RockstarPageHelmet />
      <div className="bg-gray-900 min-h-screen text-gray-200">
        <div className="container mx-auto p-8">
          <h1 className="text-5xl font-extrabold text-white text-center mb-12">
            Featured PC Games
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {games.map(game => (
              <a
                key={game.title_as_slug}
                href={`/games/${game.title_as_slug}`}
                className="group bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative">
                  <img
                    src={game.image_links.poster}
                    alt={`${game.game_title} Poster`}
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-bold text-white truncate group-hover:text-red-400 transition-colors">
                    {game.game_title}
                  </h2>
                  <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                    {game.game_description.short}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}




// Processing the raw list of keywords to create a clean, comma-separated string.
// Using a Set to automatically handle duplicate keywords from your list.
const rawKeywords = [
  "rockstar game", "rockstar games launcher", "rockstar games stock", "rockstar games video games",
  "rockstar games social club", "rockstar games careers", "rockstar games login", "rockstar games account",
  "rockstar games support", "unable to connect to rockstar game services", "every rockstar game",
  "bully rockstar game", "next rockstar game", "become a rockstar game", "first rockstar game", "new rockstar game",
  "rockstar game services", "rockstar game after gta 6", "rockstar game app", "rockstar game all games",
  "rockstar game announcements", "rockstar game activation code", "rockstar game banned", "rockstar game budgets",
  "best rockstar game", "bully rockstar game download for android", "rockstar game catalog", "rockstar game company",
  "rockstar game careers", "rockstar game customer support", "can t connect to rockstar game services",
  "create rockstar game account", "rockstar game developer salary", "rockstar game download", "rockstar game download for pc",
  "download rockstar game", "download gta v rockstar game", "rockstar game engine", "every rockstar game ranked",
  "rockstar game franchises", "rockstar game founder", "rockstar game free download", "rockstar game for android",
  "failed to connect to rockstar game services", "rockstar game games", "rockstar game gta online", "gta v rockstar game",
  "gta rockstar game download", "gta san andreas rockstar game", "rockstar game headquarters", "rockstar game history",
  "how to connect to rockstar game services", "how to verify rockstar game files", "rockstar game installer",
  "is rockstar game services down", "what is the best rockstar game", "rockstar game jobs", "juegos de rockstar game"
];
const uniqueKeywords = [...new Set(rawKeywords)];
const keywordString = uniqueKeywords.join(', ');





const RockstarPageHelmet = () => {
  return (
    <>
      <Helmet>
        <meta
          name="description"
          content="Dive into the Modern Warfare saga. Get downloads for MW2 and MW3, explore campaign details, and find the best loadouts for Ghost, Price, and other characters."
        />
        <meta
          name="keywords"
          content="modern warfare, mw3, mw2, ghost, captain price, cod mw download, warzone loadouts"
        />
        <link rel="canonical" href="https://www.gamelibs.com/games/call-of-duty-modern-warfare" />
      </Helmet>
      <Helmet>
        <meta
          name="description"
          content="Explore the complete catalog of Rockstar Games on Gamelibs. Find downloads for PC, including classics like Bully and the iconic GTA series. Get the latest Social Club & Rockstar Games Launcher updates and find solutions for common service connection issues. Your ultimate library for every Rockstar game."
        />
        <meta
          name="keywords"
          content={keywordString}
        />
        <link rel="canonical" href="https://www.gamelibs.com/rockstar-games" />

        {/* -------------------- Open Graph Tags (for social media sharing like Facebook) -------------------- */}
        <meta property="og:title" content="Rockstar Games: All Games, Downloads & Launcher Info | Gamelibs" />
        <meta
          property="og:description"
          content="Your ultimate library for downloading every Rockstar game, from GTA to Bully. Get support for the launcher, Social Club, and more."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.gamelibs.com/rockstar-games" />
        <meta property="og:image" content="https://www.gamelibs.com/images/rockstar-social-image.jpg" />
        <meta property="og:site_name" content="Gamelibs" />

        {/* -------------------- Twitter Card Tags (for Twitter sharing) -------------------- */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Rockstar Games: All Games, Downloads & Launcher Info | Gamelibs" />
        <meta
          name="twitter:description"
          content="Your ultimate library for downloading every Rockstar game, from GTA to Bully. Get support for the launcher, Social Club, and more."
        />
        <meta name="twitter:image" content="https://www.gamelibs.com/images/rockstar-social-image.jpg" />
        {/* Optional: <meta name="twitter:site" content="@YourGamelibsTwitterHandle" /> */}

      </Helmet>
    </>
  );
};


export default Home;