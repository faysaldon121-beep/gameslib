import Script from 'next/script';

// Helper function to safely convert date to ISO string
function safeISOString(date: Date | string | null | undefined): string {
  if (!date) {
    return new Date().toISOString();
  }
  
  try {
    const d = new Date(date);
    // Check if date is valid
    if (isNaN(d.getTime())) {
      console.warn('Invalid date encountered:', date);
      return new Date().toISOString();
    }
    return d.toISOString();
  } catch (error) {
    console.error('Error converting date:', error);
    return new Date().toISOString();
  }
}

interface BlogStructuredDataProps {
  post: {
    slug: string;
    title: string;
    excerpt: string;
    featuredImage: string;
    publishedAt?: Date | string | null;
    updatedAt?: Date | string | null;
    author: {
      name: string;
      social?: {
        twitter?: string;
        linkedin?: string;
        github?: string;
      };
    };
    tags: string[];
    seo?: {
      metaTitle?: string;
      metaDescription?: string;
    };
  };
}

export default function BlogStructuredData({ post }: BlogStructuredDataProps) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    image: [post.featuredImage],
    datePublished: safeISOString(post.publishedAt),
    dateModified: safeISOString(post.updatedAt || post.publishedAt),
    author: [{
      '@type': 'Person',
      name: post.author.name,
      ...(post.author.social?.twitter || post.author.social?.linkedin
        ? { url: post.author.social?.twitter || post.author.social?.linkedin }
        : {})
    }],
    publisher: {
      '@type': 'Organization',
      name: 'GameHub',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gameslib.vercel.app'}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://gameslib.vercel.app'}/blog/${post.slug}`
    },
    keywords: post.tags.join(', ')
  };

  return (
    <Script
      id={`structured-data-${post.slug}`}
      type="application/ld+json"
      strategy="beforeInteractive"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
