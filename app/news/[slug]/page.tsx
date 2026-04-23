import { notFound } from 'next/navigation'; import Image from 'next/image'; import { NewsService } from '@/lib/services/news-service'; import PortableTextContent from '@/components/news/PortableTextContent'; import NewsViewTracker from '@/components/news/NewsViewTracker';
export const dynamic = 'force-dynamic';
export default async function NewsDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params; const news = await NewsService.getNewsBySlug(slug); if(!news) notFound();
  return ( <article className="min-h-screen bg-black text-white"><NewsViewTracker newsId={news._id} /><div className="relative h-[400px]"><Image src={news.featuredImage} alt={news.title} fill className="object-cover" /></div><div className="container mx-auto max-w-4xl py-12"><h1 className="text-5xl font-black mb-8">{news.title}</h1><PortableTextContent content={news.content} /></div></article> );
}
