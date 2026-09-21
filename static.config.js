import React from 'react';
import path from 'path';
import fs from 'fs';
import FlexSearch from 'flexsearch';

// --- DATA FETCHING ---
let games = [];
try {
  const gamesJsonPath = path.join(__dirname, "data", 'games.json');
  const gamesData = fs.readFileSync(gamesJsonPath, 'utf-8');
  games = JSON.parse(gamesData);
} catch (error) {
  console.error('Error: Could not read or parse games.json.', error);
  process.exit(1);
}

const software = JSON.parse(
  fs.readFileSync(path.resolve('./data/softwares.json'), 'utf-8')
);

const searchIndex = new FlexSearch.Document({
  document: {
    id: 'title_as_slug',
    index: ['game_title', 'game_description:short'],
    // NOTE: The 'store' option is NOT needed here because the react-use-flexsearch
    // hook requires you to pass the original data array separately.
  },
  tokenize: 'forward',
});

const softwareIndex = new FlexSearch.Document({
  document: {
    id: 'title_as_slug',
    index: ['title', 'description:short'],
    // NOTE: The 'store' option is NOT needed here because the react-use-flexsearch
    // hook requires you to pass the original data array separately.
  },
  tokenize: 'forward',
});

software.forEach(software => softwareIndex.add(software));

// Add all the game documents to the index
games.forEach(game => searchIndex.add(game));

const softwarePages = software.map(soft => ({
  path: `/software/${soft.title_as_slug}`,
  template: 'src/pages/SoftwarePage', // Path to your React component
  getData: () => ({
    soft, // Pass the individual software object to the component
  }),
}));
// --- CONFIGURATION ---
export default {
  // --- ADD THIS LINE ---
  // This explicitly tells React Static where your React application starts.
  entry: path.join(__dirname, 'src', 'index.tsx'),
  // --------------------
  getSiteData: () => ({
    games, softwares: software
  }),

  getRoutes: async () => {
    // ... your getRoutes logic (no changes needed here)
    const gameRoutes = games.map(game => ({
      path: `/games/${game.title_as_slug}`,
      template: 'src/pages/game.tsx',
      getData: () => ({ game }),
    }));

    return [
      { path: '/', template: 'src/pages/index.tsx', getData: () => ({ games }) },
      ...gameRoutes,
      ...softwarePages,
      { path: '/categories', template: 'src/pages/categories.tsx' },
      { path: '/about', template: 'src/pages/about.tsx' },
      { path: '404', template: 'src/pages/404.tsx' },
    ];
  },

  Document: ({ Html, Head, Body, children, state }) => {
    // ... your Document component (no changes needed here)
    const isGamePage = state.routeInfo?.template === 'src/pages/game.tsx';
    const gameData = isGamePage ? state.routeInfo.getData.game : null;
    const title = gameData
      ? `${gameData.game_title} | Gameslib`
      : 'Gameslib- Download Free PC Games';
    const description = gameData
      ? gameData.game_description.short
      : 'Your ultimate source for free PC games. Download the latest titles, activated and ready to play. Get your game pass key to a world of adventure at GamePassKey.com.';
    const ogImageUrl = gameData
      ? gameData.image_links.poster
      : 'https://gameslib.vercel.app/logo.png';

    return (
      <Html lang="en-US">
        <Head>
          <meta charSet="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>{title}</title>
          <meta name="description" content={description} />
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://gamepasskey.com/" />
          <meta property="og:image" content={ogImageUrl} />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={title} />
          <meta name="google-site-verification" content="Oxz_vV17FHU_g0ColbVp2jZ2ANwgg1udZlvwTRMrqgI" />
          <script src='https://cdn.tailwindcss.com/3.4.17'></script>
          <meta name="twitter:description" content={description} />
          <meta name="twitter:image" content={ogImageUrl} />
          <link rel="icon" type="image/png" href="/logo.png" />
          <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9450117740233483"
            crossorigin="anonymous"></script>
          <meta name="google-adsense-account" content="ca-pub-9450117740233483"></meta>
          <meta name="google-adsense-account" content="ca-pub-9450117740233483"></meta>
        </Head>
        <Body>{children}</Body>
      </Html>
    );

  },
  plugins: [
    // ... your plugins (no changes needed here)
    'react-static-plugin-typescript',
    'react-static-plugin-sitemap',
  ],
};