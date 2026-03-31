import Link from 'next/link';
import Image from 'next/image';

interface RelatedPostsProps {
  posts: any[];
}

export default function RelatedPosts({ posts }: RelatedPostsProps) {
  return (
    <div className="bg-g-secondary p-6 rounded-lg border border-g-border">
      <h3 className="text-lg font-bold text-g-text mb-6">Related Articles</h3>
      <div className="space-y-6">
        {posts.map((post) => (
          <article key={post._id} className="group">
            <Link href={`/blog/${post.slug}`} className="flex gap-4 items-start">
              <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded">
                <Image
                  src={post.featuredImage}
                  alt={post.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-g-text group-hover:text-purple-400 transition-colors line-clamp-2 mb-1">
                  {post.title}
                </h4>
                <span className="text-xs text-g-muted">
                  {new Date(post.publishedAt).toLocaleDateString()}
                </span>
              </div>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
