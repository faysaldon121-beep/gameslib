// Defines the structure for a single game object

export interface SystemRequirements {
  OS: string;
  Processor: string;
  RAM: string;
  'Video Card'?: string; // Optional property
  Storage: string;
}

export interface ImageLinks {
  poster: string;
  video_trailer?: string; // Optional property
  screenshots: string[];
}

export interface GameDetails {
  'Game Size': string;
  Version?: string;
  Language: string;
  'Last Update'?: string;
  Downloads?: string | number;
}

export interface SEOInfo {
  title: string;
  description: string;
  keywords: string;
}

export interface Game {
  game_title: string;
  title_as_slug: string;
  game_description: {
    short: string;
    long: {
      story: string;
      gameplay: string;
      features: string[];
    };
  };
  system_requirements: {
    minimum: SystemRequirements;
    recommended: SystemRequirements;
  };
  game_category: string;
  details: GameDetails;
  image_links: ImageLinks;
  download_link: string;
  seo: SEOInfo;
}

export interface Software {
  title: string;
  title_as_slug: string;
  description: {
    short: string;
    long: {
      story: string;
      gameplay: string;
      features: string[];
    };
  };
  system_requirements: {
    minimum: SystemRequirements;
    recommended: SystemRequirements;
  };
  category: string;
  details: GameDetails;
  image_links: ImageLinks;
  download_link: string;
  seo: SEOInfo;
}