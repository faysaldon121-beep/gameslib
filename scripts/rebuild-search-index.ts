// scripts/rebuild-search-index.ts
import mongoose from 'mongoose';
import { connectDB } from '../lib/mongodb';
import BlogPost from '../models/BlogPost';

async function rebuildSearchIndex() {
  try {
    console.log('🔄 Connecting to database...');
    await connectDB();

    if (!mongoose.connection.db) {
      throw new Error('Database connection not established');
    }

    const db = mongoose.connection.db;
    const collectionName = 'blogposts'; // MongoDB collection name (pluralized lowercase)

    console.log('📚 Working with collection:', collectionName);

    // Get the collection
    const collection = db.collection(collectionName);

    // Drop existing text indexes
    console.log('🗑️  Dropping existing text indexes...');
    const indexes = await collection.indexes();
    
    for (const index of indexes) {
      // Check if it's a text index
      const indexValues = Object.values(index.key || {});
      if (indexValues.includes('text')) {
        console.log(`   Dropping text index: ${index.name}`);
        await collection.dropIndex(index.name);
      }
    }

    // Create new optimized text index with weights
    console.log('🔨 Creating new weighted text index...');
    await collection.createIndex(
      {
        title: 'text',
        content: 'text',
        excerpt: 'text',
        tags: 'text',
        'author.name': 'text',
      },
      {
        name: 'blog_text_search',
        weights: {
          title: 10,
          excerpt: 5,
          tags: 5,
          'author.name': 3,
          content: 1,
        },
        default_language: 'english',
      }
    );

    console.log('✅ Text index rebuilt successfully!');

    // Optional: Test the search
    const testQuery = 'gaming';
    console.log(`\n🔍 Testing search with query: "${testQuery}"`);
    
    const results = await BlogPost.find(
      { $text: { $search: testQuery } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .limit(5)
      .select('title slug')
      .lean();

    console.log(`   Found ${results.length} results:`);
    results.forEach((post, i) => {
      console.log(`   ${i + 1}. ${post.title} (${post.slug})`);
    });

    // Get index info
    const newIndexes = await collection.indexes();
    console.log('\n📋 Current indexes:');
    newIndexes.forEach((idx) => {
      console.log(`   - ${idx.name}: ${JSON.stringify(idx.key)}`);
    });

    // Count documents
    const count = await BlogPost.countDocuments({ isPublished: true });
    console.log(`\n📊 Total published posts: ${count}`);

  } catch (error) {
    console.error('❌ Error rebuilding search index:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
rebuildSearchIndex()
  .then(() => {
    console.log('\n✨ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
