// This is the function that transforms one raw game object from Strapi
// into the clean format you need for your client-side.
function Getthegames() {
  const transformGameData = (rawGame) => {
    // Helper function to safely extract image URLs
    // Strapi wraps media in { data: { attributes: { url: '...' } } }
    const getImageUrl = (mediaObject) => {
      return mediaObject?.data?.attributes?.url || null;
    };

    // Helper function for multiple images
    const getScreenshots = (mediaArray) => {
      if (!mediaArray?.data || !Array.isArray(mediaArray.data)) {
        return []; // Return an empty array if no screenshots
      }
      return mediaArray.data.map(img => img.attributes.url);
    };

    // Return the new, clean object with the desired key names and structure
    return {
      game_title: rawGame.title,
      title_as_slug: rawGame.slug,
      game_description: {
        short: rawGame.description?.short || '',
        // Assuming 'long' would be a component within 'description'
        long: rawGame.description?.long || {},
      },
      system_requirements: {
        minimum: rawGame.minimum_requirements,
        recommended: rawGame.recommended_requirements,
      },
      // We get the category name directly, not the whole object
      game_category: rawGame.category?.name || 'Uncategorized',
      details: rawGame.details,
      image_links: {
        // Use the helpers to safely get URLs
        poster: getImageUrl(rawGame.image_links?.poster),
        screenshots: getScreenshots(rawGame.image_links?.screenshots),
      },
      download_link: rawGame.download_link,
      seo: rawGame.seo,
    };
  };


  // Main function to fetch and then transform the data
  async function fetchAndCleanGames() {
    // IMPORTANT: You need a more complex populate query to get all the nested data
    // Your sample response shows many fields, so 'populate=*' is not enough.
    // We need to populate components AND relations inside components.
    const apiUrl = `https://joyful-rainbow-aba4295625.strapiapp.com/api/games?populate=*`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const strapiResponse = await response.json();

      // Check if the data array exists
      if (!strapiResponse.data || !Array.isArray(strapiResponse.data)) {
        console.log("No game data found in the response.");
        return [];
      }

      // Use the .map() method with our transformation function
      const cleanGamesArray = strapiResponse.data.map(transformGameData);

      console.log("✅ Successfully transformed Strapi data into a clean array:");
      // console.log(cleanGamesArray);

      return cleanGamesArray;
    } catch (error) {
      console.error("❌ Failed to fetch or transform game data:", error);
      return []; // Return an empty array on error
    }
  }

  // --- How to use it in your application ---
  return fetchAndCleanGames().then(games => {
    if (games.length > 0) {
      return games;
    }
    return [];
  }).catch(error => error);
};

// Getthegames().then(data => console.log(data));

module.exports = Getthegames;