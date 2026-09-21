import React from 'react';
import { Helmet } from 'react-helmet';

// --- Keyword Data ---
// This is the full keyword array you provided.
const keywords = [
  "game download free", "pc game download free", "car game download free", "repo game download free", "vice city game download free", "car game download free android",
  "minecraft game download free download", "no mercy game download free", "schedule 1 game download free", "solitaire game download free", "melatonin game download free",
  "game download free app", "game download free app pc windows 7", "games download free app store", "games download free apkpure", "games download free action",
  "stray game download free android", "gauley game download free apk", "aviator game download free bonus", "aviator game download free", "alien vs predator game download free",
  "avatar world game download free", "game download free bonus", "game download free bus simulator", "game download free bike race", "game download free bubble shooter",
  "games download free bike", "block blast game download free", "black myth wukong game download free", "bully game download free", "game download free car racing",
  "game download free candy crush", "game download free cricket", "games download free car driving", "games download free cooking", "games download free computer", "games download free chess",
  "call break game download free", "casino game download free", "computer game download free", "car game download free for pc", "game download free download",
  "games download free desktop", "descenders game download free", "diamond game download free", "demon slayer game download free", "delta force game download free",
  "deadpool game download free pc", "game download free online", "pc game free download exe file", "nintendo switch games download free emulator", "game download free fire online",
  "gta game download free online", "game engine download free", "euro truck simulator 2 game download free", "epic game download free", "game download free for pc",
  "game download free for pc windows 10", "game download free for pc windows 7", "game download free fire wala", "game download free unblocked", "football game download free",
  "fashion show game download free", "f1 2023 game download free", "fifa game download free", "freedom fighters pc game download free", "fnaf into the pit game download free",
  "five nights at freddy's game download free", "game download free games", "game download free gta vice city", "game download free google", "games free download google play",
  "download game garena free fire", "ppsspp games free download gta 5", "gta vice city game download free", "gun game download free", "granny legacy game download free",
  "gta 5 game download free offline", "granny game download free", "games download free horror", "games free download hidden object", "pc game download free highly compressed",
  "hitman game download free", "horror game download free", "how to pc game download free", "game download free in pc", "games download free in laptop", "games download free ios",
  "games download free iphone", "palworld game download free in pc", "inzoi game download free", "inside game download free", "igi game download free", "indian bike game download free",
  "igi 2 game download free", "game download free java", "minecraft game download free java edition", "ps4 games download free jailbreak", "ps3 games download free jailbreak",
  "ps5 games download free jailbreak", "jili slot game download free", "juwa fish game download free", "jackpot game download free", "journey game download free",
  "games download free kids", "game download karo free fire", "kids game download free", "killer bean game download free", "game download free laptop", "games download free ludo",
  "games download free low mb", "ludo game download free", "little kitty big city game download free", "game download free mobile", "game download free mac", "makeup game download free",
  "mobile game download free", "games download free new", "games download free need for speed", "download game free nintendo switch", "naruto game download free",
  "nintendo switch game download free", "new game download free", "game download free offline", "games download free offline for pc", "offline game download free",
  "online game download free", "only up game download free", "one piece game download free", "game download free pc", "game download free ps4", "game download free ps3", "game download free psp",
  "games download free play store", "puzzle game download free", "pc game download free website", "ps4 game download free", "prince of persia pc game download free",
  "quiz game download free", "quest game download free", "games download free racing car", "games download free racing", "games download free roblox", "roblox game download free",
  "repo game download free pc", "royal match game download free", "real minecraft game download free", "game download free sites", "game download free software", "game download free steam",
  "games download free solitaire", "games download free sniper", "games download free shooting", "slot game download free", "squid game download free", "spider man game download free",
  "switch game download free", "tile club game download free", "the bus game download free", "there is no game download free", "tabs game download free", "tomb raider 2013 pc game download free",
  "games download free utorrent", "untitled goose game download free", "uno game download free", "unpacking game download free", "undertale game download free", "games download free video",
  "download games free vr", "video game download free", "vegas casino game download free", "vr game download free", "volleyball game download free", "game download free website",
  "game download free windows", "game download free windows 7", "windows game download free", "world war z game download free", "www game download free", "xbox game download free",
  "xbox 360 game download free", "youtube game download free", "yuzu game download free", "your boyfriend game download free full version android", "games download free zombie",
  "games download free zuma", "zombie game download free", "cricket 07 game download free", "class of 09 game download free", "game download free windows 10", "minecraft game download free 1.21",
  "pc games free download 1gb", "1234 player game download free", "1xbet online game download free", "games download free 2024", "new games download free 2023",
  "pc games download free 2gb ram", "29 card game download free", "2048 game download free", "2 player game download free", "games download free 3d", "pc games download free 32 bit",
  "car games free download 3d", "3d game download free", "3d fighting game download free", "4k game download free", "4 player game download free", "4x4 off road game download free",
  "pc games download free 500mb", "55 club game download free", "500 card game download free", "pc games download free 64 bit", "60 seconds game download free", "tekken 6 game download free"
];

// --- Team Member Data ---
const teamMembers = [
  {
    name: 'Abdur Rahman Al Afin',
    image: 'data:image/jpeg;base64,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',
  },
  {
    name: 'Faisal Iqbal',
    image: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAHKAsoDASIAAhEBAxEB/8QAGwABAAIDAQEAAAAAAAAAAAAAAAUGAwQHAgH/xABAEAACAQMCBAMEBwYGAgMBAAABAgMABBEFEgYhMRNBUWEHcRQVInGBkTIzQlKhsRYkYsHRJDTh8PFyguEmU2P/xAAaAQEAAwEBAQAAAAAAAAAAAAAAAQIDBAUG/8QALxEAAgIBAwIDCAIDAQEAAAAAAQIAEQMSITEEE0FRBSJhcYGhIzKRsRVCwdHw4f/aAAAURgMRAD8A7jRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAYfiHjzTdBkNuqyXl2P8A8eAYQe7Hl9Mn2rOf+sW//wDT4f8AqP8A7VzOWRpZGd2LMxLMx5kk9SaZW3Dw4QXqZyvO5O4naP/AFi3/wD6fD/1H/2qZov2g6TqM0dvexyWEzEKGdgyEnuRzH0H1rlFJ9as+HhY3SifPzHdH0SjK6hlIZWGQQcgg0tcN4X401Hw1MIjI1xYk/WtucoPFTyPuOfvXbLK7gv7SG6tXDxSqGVh3BqjJhthyZow4uTcbFiiiisywooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKAMHxF2f0nW5muFWWzus5MtuQAT6qRj8qx5+zPUP8AXrf8n/wrslFaRzZFFUZcOMnc5tpHZSzsr2O5vbs3ojYMIlQIrEdC3Mn6Y+tdIUBQABgDgAUtFVkznk6mbY4xxqoooorMsKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//Z',
  },
];

const AboutPage: React.FC<{ path?: string }> = () => {
  // Process the keyword array to create a clean, unique, comma-separated string.
  // We use useMemo to ensure this computation runs only once.
  const processedKeywords = React.useMemo(() => {
    // A Set automatically handles duplicate phrases from the array.
    const uniqueKeywords = new Set(keywords);
    // Convert the Set back to an array and join into a single string for the meta tag.
    return Array.from(uniqueKeywords).join(', ');
  }, []);

  return (
    <>
      <RockstarPageHelmet />
      {/* SEO Section using React Helmet */}
      <Helmet>
        <title>About Us - Gamelibs | Free Game Downloads</title>
        <meta
          name="description"
          content="Meet the team at Xios Technologies Inc. We are dedicated to providing a vast library of free game downloads for PC (Windows 10, 7), Android, and more. Find action, racing, simulation, and classic games ready for instant download."
        />
        <meta
          name="keywords"
          content={processedKeywords}
        />
        <meta property="og:title" content="About Gamelibs | Free Game Downloads - Xios Technologies Inc.Your source for Free Games" />
        <meta property="og:description" content="Discover the team behind the ultimate platform for free game downloads. Get access to thousands of titles for PC" />
      </Helmet>

      {/* Main Page Content */}
      <div className="bg-gray-900 min-h-screen text-gray-200 font-sans p-4 sm:p-8">
        <div className="container mx-auto text-center">

          {/* Header */}
          <header className="py-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-4">
              Our Team
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              The passionate individuals behind Xios Technologies Inc., dedicated to building the ultimate destination for free game downloads.
            </p>
          </header>

          {/* Profile Cards */}
          <main className="flex flex-wrap justify-center items-center gap-8 md:gap-12 mb-16">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-xs sm:max-w-sm
                           transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
              >
                <img
                  src={member.image}
                  alt={`Profile of ${member.name}`}
                  className="w-40 h-40 object-cover object-center mx-auto rounded-full border-4 border-gray-700 mb-6"
                />
                <h3 className="text-2xl font-bold text-white">
                  {member.name}
                </h3>
              </div>
            ))}
          </main>

          {/* Contact Section */}
          <footer className="bg-gray-800/50 rounded-xl p-8 max-w-3xl mx-auto shadow-lg">
            <h2 className="text-3xl font-bold text-white mb-3">Get in Touch</h2>
            <p className="text-gray-400 mb-6">
              For inquiries, collaborations, or partnership opportunities related to game distribution, feel free to reach out.
            </p>
            <a
              href="mailto:xios.technologies.inc@gmail.com"
              className="inline-block bg-blue-600 text-white font-semibold py-3 px-8 rounded-full
                         transition-colors duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            >
              Contact Us
            </a>
          </footer>

        </div>
      </div>
    </>
  );
};

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
    <Helmet>
      {/* -------------------- Standard SEO Tags -------------------- */}
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
  );
};


export default AboutPage;