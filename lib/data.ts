import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/posts");

type GetPostsOptions = {
  includeHidden?: boolean;
};

export type Post = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  content: string;
  raw: string;
  hidden: boolean;
  displayOrder: number | null;
  updatedAt: string | null;
};

type SortablePost = Post & {
  createdAtMs: number;
  sortDateMs: number;
  sortOrderValue: number;
};

function resolveSortDateMs(date: string, fallbackMs: number): number {
  if (!date) return fallbackMs;

  const parsed = Date.parse(date);
  return Number.isNaN(parsed) ? fallbackMs : parsed;
}

export function getPosts(options: GetPostsOptions = {}): Post[] {
  if (!fs.existsSync(postsDirectory)) return [];

  const folders = fs.readdirSync(postsDirectory).filter(file => {
    return fs.statSync(path.join(postsDirectory, file)).isDirectory();
  });

  const allPosts: SortablePost[] = folders.map((id): SortablePost | null => {
    const fullPath = path.join(postsDirectory, id, "index.md");
    if (!fs.existsSync(fullPath)) return null;

    try {
      const stat = fs.statSync(fullPath);
      const createdAtMs = stat.birthtimeMs || stat.ctimeMs || stat.mtimeMs;
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const matterResult = matter(fileContents);
      const date = matterResult.data.date || "";

      const post = {
        id,
        content: matterResult.content,
        category: matterResult.data.category || "Uncategorized",
        title: matterResult.data.title || "Untitled",
        excerpt: matterResult.data.excerpt || "",
        date,
        tags: matterResult.data.tags || [],
        raw: fileContents,
        hidden: matterResult.data.hidden === true,
        updatedAt: stat.mtime.toISOString(),
        displayOrder:
          typeof matterResult.data.displayOrder === "number" && Number.isFinite(matterResult.data.displayOrder)
            ? matterResult.data.displayOrder
            : null,
        createdAtMs,
        sortDateMs: resolveSortDateMs(date, createdAtMs),
        sortOrderValue:
          typeof matterResult.data.displayOrder === "number" && Number.isFinite(matterResult.data.displayOrder)
            ? matterResult.data.displayOrder
            : Number.MAX_SAFE_INTEGER,
      };

      if (!options.includeHidden && post.hidden) {
        return null;
      }

      return post;
    } catch (e) {
      console.error(`Error parsing post ${id}:`, e);
      return {
        id,
        content: "내용을 파싱할 수 없습니다.",
        category: "Error",
        title: "형식이 잘못된 포스트",
        excerpt: "Frontmatter 형식이 올바르지 않습니다.",
        date: "",
        tags: [] as string[],
        raw: "",
        hidden: false,
        displayOrder: null,
        updatedAt: null,
        createdAtMs: 0,
        sortDateMs: 0,
        sortOrderValue: Number.MAX_SAFE_INTEGER,
      };
    }
  }).filter((post): post is SortablePost => post !== null);

  return allPosts
    .sort((a, b) => {
      if (a.sortOrderValue !== b.sortOrderValue) return a.sortOrderValue - b.sortOrderValue;
      if (b.sortDateMs !== a.sortDateMs) return b.sortDateMs - a.sortDateMs;
      if (b.createdAtMs !== a.createdAtMs) return b.createdAtMs - a.createdAtMs;
      return b.id.localeCompare(a.id);
    })
    .map((post) => ({
      id: post.id,
      content: post.content,
      category: post.category,
      title: post.title,
      excerpt: post.excerpt,
      date: post.date,
      tags: post.tags,
      raw: post.raw,
      hidden: post.hidden,
      displayOrder: post.displayOrder,
      updatedAt: post.updatedAt,
    }));
}

export function getPost(id: string, options: GetPostsOptions = {}): Post | undefined {
  let fullPath = path.join(postsDirectory, id, "index.md");
  
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(postsDirectory, `${id}.md`);
    if (!fs.existsSync(fullPath)) return undefined;
  }

  try {
    const stat = fs.statSync(fullPath);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const matterResult = matter(fileContents);

    const post = {
      id,
      content: matterResult.content,
      category: matterResult.data.category || "Uncategorized",
      title: matterResult.data.title || "Untitled",
      excerpt: matterResult.data.excerpt || "",
      date: matterResult.data.date || "",
      tags: matterResult.data.tags || [],
      raw: fileContents,
      hidden: matterResult.data.hidden === true,
      updatedAt: stat.mtime.toISOString(),
      displayOrder:
        typeof matterResult.data.displayOrder === "number" && Number.isFinite(matterResult.data.displayOrder)
          ? matterResult.data.displayOrder
          : null,
    };

    if (!options.includeHidden && post.hidden) {
      return undefined;
    }

    return post;
  } catch {
    return undefined;
  }
}
