import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';
import remarkPrism from 'remark-prism';
import matter from 'gray-matter';
import readingTime from 'reading-time';

interface BlogFrontmatter {
  title: string;
  excerpt: string;
  featuredImage: string;
  category: string;
  tags: string[];
  author: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    focusKeyword?: string;
  };
  publishedAt: string;
  isPublished: boolean;
  isFeatured?: boolean;
}

export interface ProcessedBlogPost {
  frontmatter: BlogFrontmatter;
  content: string;
  htmlContent: string;
  readingTime: {
    text: string;
    minutes: number;
    words: number;
  };
  slug: string;
}

export async function processMarkdown(markdownContent: string, slug: string): Promise<ProcessedBlogPost> {
  const { data: frontmatter, content } = matter(markdownContent);
  
  // Process markdown to HTML
  const processedContent = await remark()
    .use(remarkGfm) // GitHub Flavored Markdown
    .use(remarkPrism, {
      plugins: [
        'autolinker',
        'command-line',
        'data-uri-highlight',
        'diff-highlight',
        'inline-color',
        'keep-markup',
        'line-numbers',
        'show-invisibles',
        'treeview'
      ]
    })
    .use(html, { sanitize: false })
    .process(content);

  const htmlContent = processedContent.toString();
  const readingTimeData = readingTime(content);

  return {
    frontmatter: frontmatter as BlogFrontmatter,
    content,
    htmlContent,
    readingTime: readingTimeData,
    slug
  };
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function extractExcerpt(content: string, length: number = 160): string {
  const plainText = content.replace(/[#*`]/g, '').replace(/\n/g, ' ');
  return plainText.length > length 
    ? plainText.substring(0, length).trim() + '...'
    : plainText;
}
