import connectDB from './mongodb';
import Genre from '../models/Genre';
import Game from '../models/Game';

const genresData = [
  {
    name: "Action",
    slug: "action",
    description: "Fast-paced games with combat, platforming, and high-energy gameplay. Free PC downloads available.",
    icon: "/icons/genres/action.svg",
    metaTitle: "Action Games - Free PC Downloads & System Requirements | Gameslib",
    metaDescription: "Explore 200+ free action games for PC. Pre-installed, portable titles with combat and adventure. Download hits like Doom now!",
    ogImage: "/og/action-games.jpg",
  },
  {
    name: "Adventure",
    slug: "adventure",
    description: "Story-driven games focusing on exploration, puzzle-solving, and narrative. Free PC downloads.",
    icon: "/icons/genres/adventure.svg",
    metaTitle: "Adventure Games - Free Story-Rich PC Downloads | Gameslib",
    metaDescription: "Download 150+ free adventure games for PC. Immersive stories, puzzles, and exploration. Pre-installed and ready to play!",
    ogImage: "/og/adventure-games.jpg",
  },
  {
    name: "Role-Playing (RPG)",
    slug: "role-playing",
    description: "Character-driven games with deep narratives, leveling systems, and expansive worlds. Free RPGs for PC.",
    icon: "/icons/genres/rpg.svg",
    metaTitle: "RPG Games - Free Role-Playing PC Downloads | Gameslib",
    metaDescription: "Play 180+ free RPG games on PC. Experience epic quests, character progression, and immersive worlds. Download now!",
    ogImage: "/og/rpg-games.jpg",
  },
  {
    name: "Strategy",
    slug: "strategy",
    description: "Games that require careful planning, resource management, and tactical thinking. Free PC downloads.",
    icon: "/icons/genres/strategy.svg",
    metaTitle: "Strategy Games - Free Tactical PC Downloads | Gameslib",
    metaDescription: "Download 120+ free strategy games for PC. Build empires, command armies, and outsmart opponents. Pre-installed titles!",
    ogImage: "/og/strategy-games.jpg",
  },
  {
    name: "Simulation",
    slug: "simulation",
    description: "Realistic simulations of vehicles, life, and systems. Free simulator games for PC.",
    icon: "/icons/genres/simulation.svg",
    metaTitle: "Simulation Games - Free Realistic PC Downloads | Gameslib",
    metaDescription: "Explore 100+ free simulation games for PC. From farming to flight sims, experience realistic gameplay. Download free!",
    ogImage: "/og/simulation-games.jpg",
  },
  {
    name: "Sports",
    slug: "sports",
    description: "Competitive games based on real-world and extreme sports. Free sports games for PC.",
    icon: "/icons/genres/sports.svg",
    metaTitle: "Sports Games - Free Competitive PC Downloads | Gameslib",
    metaDescription: "Download 90+ free sports games for PC. Play football, basketball, racing, and more. Pre-installed and ready to play!",
    ogImage: "/og/sports-games.jpg",
  },
  {
    name: "Racing",
    slug: "racing",
    description: "High-speed vehicle racing games with arcade and simulation styles. Free PC downloads.",
    icon: "/icons/genres/racing.svg",
    metaTitle: "Racing Games - Free High-Speed PC Downloads | Gameslib",
    metaDescription: "Download 80+ free racing games for PC. Drift, speed, and compete in thrilling races. Pre-installed titles!",
    ogImage: "/og/racing-games.jpg",
  },
  {
    name: "Puzzle",
    slug: "puzzle",
    description: "Brain-teasing games that challenge logic, pattern recognition, and problem-solving. Free PC downloads.",
    icon: "/icons/genres/puzzle.svg",
    metaTitle: "Puzzle Games - Free Brain-Teasing PC Downloads | Gameslib",
    metaDescription: "Play 200+ free puzzle games for PC. Sharpen your mind with matching, logic, and physics puzzles. Download now!",
    ogImage: "/og/puzzle-games.jpg",
  },
  {
    name: "Horror",
    slug: "horror",
    description: "Terrifying games with suspense, jumpscares, and dark atmospheres. Free survival horror PC downloads.",
    icon: "/icons/genres/horror.svg",
    metaTitle: "Horror Games - Free Scary PC Downloads | Gameslib",
    metaDescription: "Download 100+ free horror games for PC. Experience jumpscares and survival in titles like Resident Evil. Pre-installed and ready to play!",
    ogImage: "/og/horror-games.jpg",
  },
  {
    name: "Shooter",
    slug: "shooter",
    description: "Gun-based combat games from first-person and third-person perspectives. Free PC downloads.",
    icon: "/icons/genres/shooter.svg",
    metaTitle: "Shooter Games - Free FPS & TPS PC Downloads | Gameslib",
    metaDescription: "Download 150+ free shooter games for PC. Intense gunplay, multiplayer mayhem, and campaign action. Pre-installed!",
    ogImage: "/og/shooter-games.jpg",
  },
  {
    name: "Fighting",
    slug: "fighting",
    description: "One-on-one combat games with special moves, combos, and competitive multiplayer. Free PC downloads.",
    icon: "/icons/genres/fighting.svg",
    metaTitle: "Fighting Games - Free Competitive PC Downloads | Gameslib",
    metaDescription: "Download 70+ free fighting games for PC. Master combos, challenge friends, and enjoy brawler action. Pre-installed!",
    ogImage: "/og/fighting-games.jpg",
  },
  {
    name: "Platformer",
    slug: "platformer",
    description: "Jumping and running games across 2D and 3D environments. Free platformer PC downloads.",
    icon: "/icons/genres/platformer.svg",
    metaTitle: "Platformer Games - Free Jump & Run PC Downloads | Gameslib",
    metaDescription: "Play 120+ free platformer games for PC. Classic side-scrollers, modern 3D adventures. Download pre-installed!",
    ogImage: "/og/platformer-games.jpg",
  },
  {
    name: "Stealth",
    slug: "stealth",
    description: "Games emphasizing sneaking, avoiding detection, and silent takedowns. Free PC downloads.",
    icon: "/icons/genres/stealth.svg",
    metaTitle: "Stealth Games - Free Tactical PC Downloads | Gameslib",
    metaDescription: "Download 60+ free stealth games for PC. Become a shadow, outwit enemies, and execute silent missions. Pre-installed!",
    ogImage: "/og/stealth-games.jpg",
  },
  {
    name: "Survival",
    slug: "survival",
    description: "Games focused on resource management, crafting, and staying alive. Free PC downloads.",
    icon: "/icons/genres/survival.svg",
    metaTitle: "Survival Games - Free Crafting & Exploration PC Downloads | Gameslib",
    metaDescription: "Explore 90+ free survival games for PC. Build, gather, and survive against the elements. Pre-installed and ready!",
    ogImage: "/og/survival-games.jpg",
  },
  {
    name: "Open World",
    slug: "open-world",
    description: "Large, free-roaming environments with non-linear gameplay. Free PC downloads.",
    icon: "/icons/genres/open-world.svg",
    metaTitle: "Open World Games - Free Sandbox PC Downloads | Gameslib",
    metaDescription: "Download 110+ free open world games for PC. Vast landscapes, freedom to explore, endless adventures. Pre-installed!",
    ogImage: "/og/open-world-games.jpg",
  },
  {
    name: "Sandbox",
    slug: "sandbox",
    description: "Creative games with minimal constraints, allowing players to shape the world. Free PC downloads.",
    icon: "/icons/genres/sandbox.svg",
    metaTitle: "Sandbox Games - Free Creative PC Downloads | Gameslib",
    metaDescription: "Play 80+ free sandbox games for PC. Build, create, and experiment in virtual playgrounds. Download now!",
    ogImage: "/og/sandbox-games.jpg",
  },
  {
    name: "Indie",
    slug: "indie",
    description: "Innovative games developed by independent creators, often with unique art styles. Free PC downloads.",
    icon: "/icons/genres/indie.svg",
    metaTitle: "Indie Games - Free Unique PC Downloads | Gameslib",
    metaDescription: "Discover 300+ free indie games for PC. Creative storytelling, innovative gameplay, and artistic gems. Pre-installed!",
    ogImage: "/og/indie-games.jpg",
  },
  {
    name: "Casual",
    slug: "casual",
    description: "Easy-to-play games suitable for short sessions and all ages. Free PC downloads.",
    icon: "/icons/genres/casual.svg",
    metaTitle: "Casual Games - Free Relaxing PC Downloads | Gameslib",
    metaDescription: "Download 250+ free casual games for PC. Simple mechanics, fun for all ages, perfect for quick play. Pre-installed!",
    ogImage: "/og/casual-games.jpg",
  },
  {
    name: "MMO",
    slug: "mmo",
    description: "Massively multiplayer online games with persistent worlds and large communities. Free PC downloads.",
    icon: "/icons/genres/mmo.svg",
    metaTitle: "MMO Games - Free Massive Multiplayer PC Downloads | Gameslib",
    metaDescription: "Join 50+ free MMO games for PC. Play with thousands, explore vast worlds, and forge alliances. Pre-installed!",
    ogImage: "/og/mmo-games.jpg",
  },
  {
    name: "MOBA",
    slug: "moba",
    description: "Multiplayer online battle arena games featuring team-based competitive combat. Free PC downloads.",
    icon: "/icons/genres/moba.svg",
    metaTitle: "MOBA Games - Free Competitive PC Downloads | Gameslib",
    metaDescription: "Download 40+ free MOBA games for PC. Team up, strategize, and dominate the battlefield. Pre-installed titles!",
    ogImage: "/og/moba-games.jpg",
  },
  {
    name: "Battle Royale",
    slug: "battle-royale",
    description: "Last-man-standing games with large-scale PvP and survival elements. Free PC downloads.",
    icon: "/icons/genres/battle-royale.svg",
    metaTitle: "Battle Royale Games - Free Last-Man-Standing PC Downloads | Gameslib",
    metaDescription: "Play 60+ free battle royale games for PC. Fight to be the last one standing in intense matches. Pre-installed!",
    ogImage: "/og/battle-royale-games.jpg",
  },
  {
    name: "Card Game",
    slug: "card-game",
    description: "Strategy-based games using collectible or traditional card mechanics. Free PC downloads.",
    icon: "/icons/genres/card-game.svg",
    metaTitle: "Card Games - Free Strategy PC Downloads | Gameslib",
    metaDescription: "Download 80+ free card games for PC. Build decks, outsmart opponents, and enjoy CCG/TCG action. Pre-installed!",
    ogImage: "/og/card-games.jpg",
  },
  {
    name: "Board Game",
    slug: "board-game",
    description: "Digital adaptations of classic and modern board games. Free PC downloads.",
    icon: "/icons/genres/board-game.svg",
    metaTitle: "Board Games - Free Digital Tabletop PC Downloads | Gameslib",
    metaDescription: "Play 70+ free board games for PC. Chess, Monopoly, and more. Enjoy classic tabletop fun online. Pre-installed!",
    ogImage: "/og/board-games.jpg",
  },
  {
    name: "Educational",
    slug: "educational",
    description: "Games designed to teach concepts in math, science, history, and more. Free PC downloads.",
    icon: "/icons/genres/educational.svg",
    metaTitle: "Educational Games - Free Learning PC Downloads | Gameslib",
    metaDescription: "Download 100+ free educational games for PC. Learn while playing—math, coding, languages, and more. Pre-installed!",
    ogImage: "/og/educational-games.jpg",
  },
  {
    name: "Rhythm",
    slug: "rhythm",
    description: "Games based on timing, music, and beat-matching. Free PC downloads.",
    icon: "/icons/genres/rhythm.svg",
    metaTitle: "Rhythm Games - Free Music-Based PC Downloads | Gameslib",
    metaDescription: "Download 50+ free rhythm games for PC. Test your timing, dance to the beat, and enjoy music gameplay. Pre-installed!",
    ogImage: "/og/rhythm-games.jpg",
  },
  {
    name: "Music",
    slug: "music",
    description: "Games focused on music creation, performance, or interaction. Free PC downloads.",
    icon: "/icons/genres/music.svg",
    metaTitle: "Music Games - Free Interactive PC Downloads | Gameslib",
    metaDescription: "Explore 40+ free music games for PC. Compose, perform, and experience music in new ways. Pre-installed!",
    ogImage: "/og/music-games.jpg",
  },
  {
    name: "Party",
    slug: "party",
    description: "Multiplayer games designed for social gatherings and group fun. Free PC downloads.",
    icon: "/icons/genres/party.svg",
    metaTitle: "Party Games - Free Multiplayer Fun PC Downloads | Gameslib",
    metaDescription: "Download 60+ free party games for PC. Play with friends, mini-games, and hilarious challenges. Pre-installed!",
    ogImage: "/og/party-games.jpg",
  },
  {
    name: "Visual Novel",
    slug: "visual-novel",
    description: "Narrative-driven games with anime-style art and branching stories. Free PC downloads.",
    icon: "/icons/genres/visual-novel.svg",
    metaTitle: "Visual Novel Games - Free Story-Rich PC Downloads | Gameslib",
    metaDescription: "Discover 80+ free visual novels for PC. Immersive stories, character choices, and beautiful art. Pre-installed!",
    ogImage: "/og/visual-novel-games.jpg",
  },
  {
    name: "Dating Sim",
    slug: "dating-sim",
    description: "Romance-focused games where players build relationships. Free PC downloads.",
    icon: "/icons/genres/dating-sim.svg",
    metaTitle: "Dating Sim Games - Free Romance PC Downloads | Gameslib",
    metaDescription: "Download 30+ free dating sim games for PC. Forge relationships, make choices, and find love. Pre-installed!",
    ogImage: "/og/dating-sim-games.jpg",
  },
  {
    name: "Text-Based",
    slug: "text-based",
    description: "Interactive fiction and adventure games driven by text input. Free PC downloads.",
    icon: "/icons/genres/text-based.svg",
    metaTitle: "Text-Based Games - Free Interactive Fiction PC Downloads | Gameslib",
    metaDescription: "Play 40+ free text-based games for PC. Classic interactive fiction and modern narrative adventures. Pre-installed!",
    ogImage: "/og/text-based-games.jpg",
  },
  {
    name: "Tower Defense",
    slug: "tower-defense",
    description: "Strategy games where players build defenses to stop waves of enemies. Free PC downloads.",
    icon: "/icons/genres/tower-defense.svg",
    metaTitle: "Tower Defense Games - Free Strategy PC Downloads | Gameslib",
    metaDescription: "Download 70+ free tower defense games for PC. Build mazes, upgrade towers, and survive waves. Pre-installed!",
    ogImage: "/og/tower-defense-games.jpg",
  },
  {
    name: "Roguelike",
    slug: "roguelike",
    description: "Turn-based dungeon crawlers with permadeath and procedural generation. Free PC downloads.",
    icon: "/icons/genres/roguelike.svg",
    metaTitle: "Roguelike Games - Free Permadeath PC Downloads | Gameslib",
    metaDescription: "Explore 60+ free roguelike games for PC. Classic turn-based dungeon crawling with high stakes. Pre-installed!",
    ogImage: "/og/roguelike-games.jpg",
  },
  {
    name: "Roguelite",
    slug: "roguelite",
    description: "Action games with permadeath but persistent progression between runs. Free PC downloads.",
    icon: "/icons/genres/roguelite.svg",
    metaTitle: "Roguelite Games - Free Action RPG PC Downloads | Gameslib",
    metaDescription: "Download 80+ free roguelite games for PC. Fast-paced action, permadeath, and lasting upgrades. Pre-installed!",
    ogImage: "/og/roguelite-games.jpg",
  },
  {
    name: "Metroidvania",
    slug: "metroidvania",
    description: "Exploration-driven games with interconnected worlds and ability gating. Free PC downloads.",
    icon: "/icons/genres/metroidvania.svg",
    metaTitle: "Metroidvania Games - Free Exploration PC Downloads | Gameslib",
    metaDescription: "Play 50+ free Metroidvania games for PC. Unlock abilities, explore vast maps, and uncover secrets. Pre-installed!",
    ogImage: "/og/metroidvania-games.jpg",
  },
  {
    name: "Hack and Slash",
    slug: "hack-and-slash",
    description: "Combat-focused games emphasizing melee weapon action and fast-paced battles. Free PC downloads.",
    icon: "/icons/genres/hack-and-slash.svg",
    metaTitle: "Hack and Slash Games - Free Action PC Downloads | Gameslib",
    metaDescription: "Download 70+ free hack and slash games for PC. Slash through hordes, epic combos, and intense melee combat. Pre-installed!",
    ogImage: "/og/hack-and-slash-games.jpg",
  }
];

async function seedGenres() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    await Genre.deleteMany({});

    const insertedGenres = await Genre.insertMany(genresData);
    console.log(`Inserted ${insertedGenres.length} genres with SEO metadata`);

    // Update gameCount
    for (const genre of insertedGenres) {
      const count = await Game.countDocuments({ 
        genre: { $regex: genre.name, $options: 'i' }
      });
      await Genre.findByIdAndUpdate(genre._id, { gameCount: count });
      console.log(`Updated ${genre.name}: ${count} games`);
    }

    console.log('Seeding complete with SEO optimizations!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedGenres();
