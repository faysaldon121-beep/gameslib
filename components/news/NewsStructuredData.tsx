import Script from 'next/script'; import { NewsDetail } from '@/types/news';
export default function NewsStructuredData({ news }: { news: NewsDetail }) { const d = { '@context': 'https://schema.org', '@type': 'NewsArticle', headline: news.title }; return <Script id={`sd-${news._id}`} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />; }
