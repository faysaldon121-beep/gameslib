import { groq } from 'next-sanity';

// Base news fields
const newsFields = groq`
  _id,
  _type,
  _createdAt,
  _updatedAt,
  title,
  slug,
  excerpt,
  "featuredImage": featuredImage.asset->url,
  category,
  platforms,
  tags,
  author {
    name,
    "avatar": avatar.asset->url,
    bio,
    social
  },
  readingTime,
  views,
  shares,
  isBreaking,
  isFeatured,
  isTrending,
  isPublished,
  publishedAt
`;

// Paginated news query
export const paginatedNewsQuery = groq`{
  "news": *[_type == "news" && isPublished == true] | order(publishedAt desc) [$start...$end] {
    ${newsFields}
  },
  "total": count(*[_type == "news" && isPublished == true])
}`;

// Trending news
export const trendingNewsQuery = groq`
  *[_type == "news" && isPublished == true] | order(shares.total desc, views desc, publishedAt desc) [0...$limit] {
    ${newsFields}
  }
`;

// Breaking news
export const breakingNewsQuery = groq`
  *[_type == "news" && isPublished == true && isBreaking == true] | order(publishedAt desc) [0...$limit] {
    ${newsFields}
  }
`;

// Featured news
export const featuredNewsQuery = groq`
  *[_type == "news" && isPublished == true && isFeatured == true] | order(publishedAt desc) [0] {
    ${newsFields}
  }
`;

// News by slug (full detail)
export const newsBySlugQuery = groq`
  *[_type == "news" && slug.current == $slug && isPublished == true][0] {
    ${newsFields},
    content[] {
      ...,
      _type == "image" => {
        ...,
        "url": asset->url,
        "metadata": asset->metadata
      }
    },
    seo,
    videoEmbed,
    sourceUrl
  }
`;

// News by category
export const newsByCategoryQuery = groq`{
  "news": *[_type == "news" && isPublished == true && category == $category] | order(publishedAt desc) [$start...$end] {
    ${newsFields}
  },
  "total": count(*[_type == "news" && isPublished == true && category == $category])
}`;

// News by platform
export const newsByPlatformQuery = groq`{
  "news": *[_type == "news" && isPublished == true && $platform in platforms] | order(publishedAt desc) [$start...$end] {
    ${newsFields}
  },
  "total": count(*[_type == "news" && isPublished == true && $platform in platforms])
}`;

// Search news - FIXED: Changed parameter name from $query to $searchTerm
export const searchNewsQuery = groq`{
  "news": *[
    _type == "news" && 
    isPublished == true && 
    (
      title match $searchTerm ||
      excerpt match $searchTerm ||
      $searchTerm in tags[]
    )
  ] | order(publishedAt desc) [$start...$end] {
    ${newsFields}
  },
  "total": count(*[
    _type == "news" && 
    isPublished == true && 
    (
      title match $searchTerm ||
      excerpt match $searchTerm ||
      $searchTerm in tags[]
    )
  ])
}`;

// Related news
export const relatedNewsQuery = groq`
  *[
    _type == "news" && 
    isPublished == true && 
    _id != $newsId && 
    category == $category
  ] | order(publishedAt desc) [0...$limit] {
    ${newsFields}
  }
`;

// Categories with count
export const categoriesWithCountQuery = groq`
  *[_type == "news" && isPublished == true] {
    "category": category,
    "count": count(*[_type == "news" && isPublished == true && category == ^.category])
  } | order(count desc) | unique()
`;

// Popular tags
export const popularTagsQuery = groq`
  array::unique(*[_type == "news" && isPublished == true].tags[]) | 
  order(@) | [0..9]
`;
