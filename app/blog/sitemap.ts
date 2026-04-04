import { connectDB } from "@/lib/mongodb";
import Blog from "@/models/BlogPost";

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://gameslib.vercel.app";

  try {
    await connectDB();

    // Fetch all published blogs
    const blogs = await Blog.find({ 
      published: { $ne: false },
      status: { $ne: "draft" } 
    })
      .select("slug updatedAt createdAt")
      .sort({ updatedAt: -1 })
      .lean();

    // Generate blog post URLs
    const blogUrls = blogs.map((blog) => ({
      url: `${baseUrl}/blogs/${blog.slug || blog._id}`,
      lastModified: blog.updatedAt || blog.createdAt || new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    }));

    // Return main blogs page + all individual blog URLs
    return [
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      ...blogUrls,
    ];
  } catch (error) {
    console.error("Error generating blog sitemap:", error);
    
    // Fallback if database fails
    return [
      {
        url: `${baseUrl}/blog`,
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
    ];
  }
}
