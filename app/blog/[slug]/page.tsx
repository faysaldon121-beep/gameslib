// app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import connectDB from '@/lib/mongodb';
import BlogPost from '@/models/BlogPost';
import ShareButtons from '@/components/blog/ShareButtons';
import RelatedPosts from '@/components/blog/RelatedPosts';
import BlogStructuredData from '@/components/blog/BlogStructuredData';
import { ViewTracker } from '@/lib/services/view-tracker';
import { CalendarDaysIcon, ClockIcon, EyeIcon, UserIcon } from '@heroicons/react/24/outline';
import { marked } from 'marked';

interface Props {
  params: { slug: string };
}

type BlogPostDoc = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  author: {
    name: string;
    avatar?: string;
    bio?: string;
    social?: {
      twitter?: string;
      linkedin?: string;
      github?: string;
    };
  };
  category: string;
  tags: string[];
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
    canonicalUrl?: string;
  };
  readingTime: number;
  views: number;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: Date | string;
  updatedAt?: Date | string;
};

async function getBlogPost(
  slug: string,
  shouldIncrementView: boolean = false
): Promise<{
  post: BlogPostDoc;
  relatedPosts: BlogPostDoc[];
} | null> {
  try {
    await connectDB();
    
    const post = await BlogPost.findOne({ 
      slug, 
      isPublished: true 
    }).lean<BlogPostDoc | null>();
    
    if (!post) return null;

    // Only increment view count if shouldIncrementView is true
    if (shouldIncrementView && post._id) {
      await BlogPost.findByIdAndUpdate(
        post._id, 
        { $inc: { views: 1 } },
        { timestamps: false } // Don't update updatedAt
      );
      post.views += 1; // Update the returned object
    }

    // Get related posts
    const relatedPosts = await BlogPost.find({
      _id: { $ne: post._id },
      $or: [
        { category: post.category },
        { tags: { $in: post.tags } }
      ],
      isPublished: true
    })
    .sort({ publishedAt: -1 })
    .limit(3)
    .lean<BlogPostDoc[]>();

    return {
      post,
      relatedPosts
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getBlogPost(params.slug, false); // Don't increment on metadata generation
  
  if (!data) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.'
    };
  }

  const { post } = data;
  const seoTitle = post.seo?.metaTitle || post.title;
  const seoDescription = post.seo?.metaDescription || post.excerpt;

  return {
    title: `${seoTitle} | GameHub Blog`,
    description: seoDescription,
    keywords: post.tags.join(', '),
    authors: [{ name: post.author.name }],
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      type: 'article',
      publishedTime: post.publishedAt
        ? new Date(post.publishedAt).toISOString()
        : undefined,
      modifiedTime: post.updatedAt
        ? new Date(post.updatedAt).toISOString()
        : undefined,
      authors: [post.author.name],
      tags: post.tags,
      images: [
        {
          url: post.featuredImage,
          width: 1200,
          height: 630,
          alt: post.title
        }
      ],
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://gameslib.vercel.app"}/${post.slug}`
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDescription,
      images: [post.featuredImage],
      creator: post.author.social?.twitter
    },
    alternates: {
      canonical: post.seo?.canonicalUrl || `https://yourdomain.com/blog/${post.slug}`
    }
  };
}

export default async function BlogPostPage({ params }: Props) {
  const slug = params.slug;
  
  // Check if user has already viewed this post
  const hasViewed = await ViewTracker.hasViewed(slug);
  
  // Only increment view if user hasn't viewed before
  const data = await getBlogPost(slug, !hasViewed);
  
  if (!data) {
    notFound();
  }

  const { post, relatedPosts } = data;

  // Mark as viewed for this session
  if (!hasViewed) {
    await ViewTracker.markAsViewed(slug);
  }

  // Parse markdown to HTML
  const htmlContent = await marked.parse(post.content);

  return (
    <>
      <BlogStructuredData post={post} />
      
      <article className="min-h-screen bg-g-bg">
        {/* Hero Section */}
        <header className="relative">
          <div className="relative h-96 md:h-[500px] overflow-hidden">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div className="container mx-auto">
                <div className="max-w-4xl">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {post.category}
                    </span>
                    {post.tags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-purple-200 text-sm">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  
                  <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                    {post.title}
                  </h1>
                  
                  <p className="text-lg text-gray-200 mb-6 max-w-3xl">
                    {post.excerpt}
                  </p>
                  
                  <div className="flex flex-wrap items-center gap-6 text-gray-300">
                    <div className="flex items-center gap-2">
                      <UserIcon className="w-5 h-5" />
                      <span>{post.author.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDaysIcon className="w-5 h-5" />
                      <span>
                        {post.publishedAt
                          ? new Date(post.publishedAt).toLocaleDateString()
                          : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="w-5 h-5" />
                      <span>{post.readingTime} min read</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <EyeIcon className="w-5 h-5" />
                      <span>{post.views.toLocaleString()} views</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-12">
              {/* Main Content */}
              <main className="lg:w-3/4">
                <div 
                  className="prose prose-lg prose-invert max-w-none
                    prose-headings:text-g-text 
                    prose-p:text-g-text prose-p:leading-relaxed
                    prose-a:text-purple-400 prose-a:no-underline hover:prose-a:text-purple-300
                    prose-strong:text-g-text
                    prose-code:text-purple-400 prose-code:bg-g-secondary prose-code:px-1 prose-code:rounded
                    prose-pre:bg-g-secondary prose-pre:border prose-pre:border-g-border
                    prose-blockquote:border-l-purple-500 prose-blockquote:text-g-muted
                    prose-img:rounded-lg prose-img:shadow-lg
                    prose-hr:border-g-border"
                  dangerouslySetInnerHTML={{ __html: htmlContent }}
                />

                {/* Author Info */}
                <div className="mt-12 p-6 bg-g-secondary rounded-lg border border-g-border">
                  <div className="flex items-start gap-4">
                    {post.author.avatar && (
                      <Image
                        src={post.author.avatar}
                        alt={post.author.name}
                        width={60}
                        height={60}
                        className="rounded-full"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-g-text mb-2">
                        About {post.author.name}
                      </h3>
                      {post.author.bio && (
                        <p className="text-g-muted mb-4">{post.author.bio}</p>
                      )}
                      {post.author.social && (
                        <div className="flex gap-4">
                          {post.author.social.twitter && (
                            <a 
                              href={post.author.social.twitter}
                              className="text-purple-400 hover:text-purple-300"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Twitter
                            </a>
                          )}
                          {post.author.social.linkedin && (
                            <a 
                              href={post.author.social.linkedin}
                              className="text-purple-400 hover:text-purple-300"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              LinkedIn
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Share Buttons */}
                <ShareButtons 
                  title={post.title}
                  url={`https://yourdomain.com/blog/${post.slug}`}
                />
              </main>

              {/* Sidebar */}
              <aside className="lg:w-1/4 mt-12 lg:mt-0">
                <div className="sticky top-24 space-y-8">
                  {relatedPosts && relatedPosts.length > 0 && (
                    <RelatedPosts posts={relatedPosts} />
                  )}
                  
                  {/* Sidebar Newsletter */}
                  <div className="bg-g-secondary p-6 rounded-lg border border-g-border">
                    <h3 className="text-lg font-bold text-g-text mb-2">Subscribe</h3>
                    <p className="text-sm text-g-muted mb-4">
                      Get the latest gaming guides and news in your inbox.
                    </p>
                    <form className="space-y-3">
                      <input 
                        type="email" 
                        placeholder="Email address" 
                        className="w-full bg-g-bg border border-g-border rounded px-3 py-2 text-g-text focus:outline-none focus:border-purple-500 transition-colors"
                        required
                      />
                      <button 
                        type="submit"
                        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 rounded transition-colors"
                      >
                        Subscribe
                      </button>
                    </form>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}

export const revalidate = 300; // Revalidate every 5 minutes
