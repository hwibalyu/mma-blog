import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/data";
import { absoluteUrl, getCategorySlug } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts();
  const categories = Array.from(
    new Set(posts.map((post) => getCategorySlug(post.category)).filter((slug): slug is string => Boolean(slug)))
  );

  return [
    {
      url: absoluteUrl("/"),
      lastModified: posts[0]?.updatedAt || new Date().toISOString(),
      changeFrequency: "daily",
      priority: 1,
    },
    ...categories.map((slug) => ({
      url: absoluteUrl(`/category/${slug}`),
      lastModified: new Date().toISOString(),
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
    ...posts.map((post) => ({
      url: absoluteUrl(`/posts/${post.id}`),
      lastModified: post.updatedAt || undefined,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];
}
