import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function rebuildIndex() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log("Connected to MongoDB");

  const db = mongoose.connection.db;
  const collection = db.collection("games");

  // Drop existing text indexes
  const indexes = await collection.indexes();
  for (const idx of indexes) {
    if (idx.textIndexVersion) {
      console.log("Dropping old text index:", idx.name);
      await collection.dropIndex(idx.name!);
    }
  }

  // Create new weighted index
  await collection.createIndex(
    {
      title: "text",
      tags: "text",
      developer: "text",
      shortDescription: "text",
    },
    {
      weights: { title: 10, tags: 5, developer: 3, shortDescription: 1 },
      name: "game_search_index",
    }
  );

  console.log("✅ Text index rebuilt successfully");

  // Verify
  const newIndexes = await collection.indexes();
  console.log("Current indexes:", newIndexes.map((i) => i.name));

  await mongoose.disconnect();
}

rebuildIndex().catch(console.error);
