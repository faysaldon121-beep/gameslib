import Script from 'next/script';

export default function BlogStructuredData({ post }: { post: any }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt,
    image: [post.featuredImage],
    datePublished: new Date(post.publishedAt).toISOString(),
    dateModified: new Date(post.updatedAt).toISOString(),
    author: [{
      '@type': 'Person',
      name: post.author.name,
      url: post.author.social?.twitter || post.author.social?.linkedin || ''
    }],
    publisher: {
      '@type': 'Organization',
      name: 'GameHub',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`
    },
    keywords: post.tags.join(', ')
  };

  return (
    <Script
      id={`structured-data-${post.slug}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
