import connectDB from './mongodb';
import Genre from '../models/Genre';
import Game from '../models/Game';

const genresData = [
  // Full list from previous response (35 genres)
  {
    name: "Action",
    slug: "action",
    description: "Fast-paced games with combat, platforming, and high-energy gameplay. Free PC downloads available.",
    icon: "/icons/genres/action.svg",
    metaTitle: "Action Games - Free PC Downloads & System Requirements | Gameslib",
    metaDescription: "Explore 200+ free action games for PC. Pre-installed, portable titles with combat and adventure. Download hits like Doom now!",
    ogImage: "/og/action-games.jpg",
  },
  // ... Repeat for all genres, customizing metaDescription with estimated counts/keywords
  // Example for Horror:
  {
    name: "Horror",
    slug: "horror",
    description: "Terrifying games with suspense, jumpscares, and dark atmospheres. Free survival horror PC downloads.",
    icon: "/icons/genres/horror.svg",
    metaTitle: "Horror Games - Free Scary PC Downloads | Gameslib",
    metaDescription: "Download 100+ free horror games for PC. Experience jumpscares and survival in titles like Resident Evil. Pre-installed and ready to play!",
    ogImage: "/og/horror-games.jpg",
  },
  // Add the rest...
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
