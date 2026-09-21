// scripts/generateGameData.js
import fs from 'fs';

/**
 * Convert a "Before X Months" string to a Date object.
 * Returns null if conversion fails (the field will be omitted to use the default Date.now).
 */
function parseLastUpdate(lastUpdate) {
  if (!lastUpdate) return null;
  const match = lastUpdate.match(/Before (\d+) (Months?|Years?|Days?)/i);
  if (!match) return null;
  const value = parseInt(match[1], 10);
  const unit = match[2].toLowerCase();
  const now = new Date();
  if (unit.startsWith('month')) {
    now.setMonth(now.getMonth() - value);
  } else if (unit.startsWith('year')) {
    now.setFullYear(now.getFullYear() - value);
  } else if (unit.startsWith('day')) {
    now.setDate(now.getDate() - value);
  } else {
    return null;
  }
  return now;
}

/**
 * Transform a raw JSON game object into the format required by the Game model.
 */
function transformGame(raw) {
  const long = raw.game_description?.long || {};
  const descriptionParts = [];
  if (long.story) descriptionParts.push(`# Story\n${long.story}`);
  if (long.gameplay) descriptionParts.push(`# Gameplay\n${long.gameplay}`);
  if (long.features?.length) {
    descriptionParts.push(`# Features\n${long.features.map(f => `- ${f}`).join('\n')}`);
  }
  const description = descriptionParts.join('\n\n').trim();

  // Tags: from seo.keywords (array or comma‑separated string)
  let tags = [];
  const keywords = raw.seo?.keywords;
  if (Array.isArray(keywords)) {
    tags = keywords;
  } else if (typeof keywords === 'string') {
    tags = keywords.split(',').map(k => k.trim());
  }

  // System requirements – map the JSON fields to the schema fields
  const min = raw.system_requirements?.minimum || {};
  const rec = raw.system_requirements?.recommended || {};
  const requirements = {
    minimum: {
      os: min.os || '',
      cpu: min.processor || '',
      ram: min.ram || '',
      gpu: min.video_card || '',
      storage: min.storage || '',
      directx: min.directx || '',
    },
    recommended: {
      os: rec.os || '',
      cpu: rec.processor || '',
      ram: rec.ram || '',
      gpu: rec.video_card || '',
      storage: rec.storage || '',
      directx: rec.directx || '',
    },
  };

  // Download links – only one in the provided JSON, but we still wrap it in an array
  const downloadLinks = [{
    label: 'Direct Download',
    url: raw.download_link,
    size: raw.details?.game_size || '',
    host: 'PeskGames', // you can change this if needed
  }];

  // Release date from last_update (optional)
  let releaseDate = null;
  if (raw.details?.last_update) {
    releaseDate = parseLastUpdate(raw.details.last_update);
  }

  const version = raw.details?.version_number || '1.0';
  const downloadCount = raw.details?.download_count || 0;

  // Return a clean object that matches the Game model
  const transformed = {
    title: raw.game_title,
    slug: raw.title_as_slug,
    shortDescription: raw.game_description?.short || '',
    description,
    coverImage: raw.image_links?.poster || 'https://placehold.co/800x450/0f0f1a/7c3aed?text=No+Image',
    images: raw.image_links?.screenshots || [],
    genre: raw.game_category || 'PC Games',
    platforms: ['PC'],
    version,
    developer: 'Unknown',   // not provided in JSON
    publisher: 'Unknown',   // not provided in JSON
    releaseDate,            // will be omitted if null (defaults to Date.now in schema)
    requirements,
    installationGuide: [],  // not provided
    downloadLinks,
    fileSize: raw.details?.game_size || '',
    isFeatured: false,
    averageRating: 0,
    reviewCount: 0,
    downloadCount,
    tags,
    changelog: '',          // not provided
  };

  // Remove fields that are undefined so Mongoose uses the schema defaults
  Object.keys(transformed).forEach(key => {
    if (transformed[key] === undefined) delete transformed[key];
  });

  return transformed;
}

// Main execution
try {
  // Read the original JSON file
  const rawData = fs.readFileSync('./games.json', 'utf8');
  const rawGames = JSON.parse(rawData);

  // Transform each game
  const transformedGames = rawGames.map(transformGame);

  // Write the transformed data to a file
  const outputPath = './transformed_games.json';
  fs.writeFileSync(outputPath, JSON.stringify(transformedGames, null, 2));
  console.log(`✅ Transformed data written to ${outputPath}`);
  console.log(`Total games: ${transformedGames.length}`);
} catch (error) {
  console.error('❌ Error processing games:', error);
}