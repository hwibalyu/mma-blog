import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { extractFirstImageAlt, extractFirstImagePath } from "@/lib/seo";

const postsDirectory = path.join(process.cwd(), "content/posts");

type GetPostsOptions = {
  includeHidden?: boolean;
  includeContent?: boolean;
};

type GetPostsSummaryOptions = {
  includeHidden?: boolean;
  includeContent?: false;
};

type GetPostsContentOptions = {
  includeHidden?: boolean;
  includeContent: true;
};

export type PostValidationIssue =
  | "missing-title"
  | "missing-excerpt"
  | "missing-date"
  | "missing-author"
  | "missing-cover-image"
  | "missing-cover-image-alt";

export type PostSummary = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  author: string;
  tags: string[];
  hidden: boolean;
  displayOrder: number | null;
  updatedAt: string | null;
  coverImage: string | null;
  coverImageAlt: string | null;
  validationIssues: PostValidationIssue[];
};

export type Post = PostSummary & {
  content: string;
  raw: string;
  naverRaw: string | null;
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

function validatePostFrontmatter(post: {
  title: string;
  excerpt: string;
  date: string;
  author: string;
  coverImage: string | null;
  coverImageAlt: string | null;
}) {
  const issues: PostValidationIssue[] = [];

  if (!post.title.trim()) issues.push("missing-title");
  if (!post.excerpt.trim()) issues.push("missing-excerpt");
  if (!post.date.trim()) issues.push("missing-date");
  if (!post.author.trim()) issues.push("missing-author");
  if (!post.coverImage?.trim()) issues.push("missing-cover-image");
  if (!post.coverImageAlt?.trim()) issues.push("missing-cover-image-alt");

  return issues;
}

export function getPosts(options: GetPostsContentOptions): Post[];
export function getPosts(options?: GetPostsSummaryOptions): PostSummary[];
export function getPosts(options: GetPostsOptions = {}): Array<Post | PostSummary> {
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
      const naverPath = path.join(postsDirectory, id, "naver.md");
      const naverRaw = fs.existsSync(naverPath) ? fs.readFileSync(naverPath, "utf8") : null;
      const matterResult = matter(fileContents);
      const date = matterResult.data.date || "";
      const content = matterResult.content;
      const rawCoverImage =
        typeof matterResult.data.coverImage === "string" ? matterResult.data.coverImage : null;
      const rawCoverImageAlt =
        typeof matterResult.data.coverImageAlt === "string"
          ? matterResult.data.coverImageAlt
          : null;
      const coverImage = rawCoverImage || extractFirstImagePath(content);
      const coverImageAlt = rawCoverImageAlt || extractFirstImageAlt(content);

      const post = {
        id,
        category: matterResult.data.category || "Uncategorized",
        title: matterResult.data.title || "Untitled",
        excerpt: matterResult.data.excerpt || "",
        date,
        author: matterResult.data.author || "THE MMA JOURNAL",
        tags: matterResult.data.tags || [],
        hidden: matterResult.data.hidden === true,
        updatedAt: stat.mtime.toISOString(),
        coverImage,
        coverImageAlt,
        displayOrder:
          typeof matterResult.data.displayOrder === "number" && Number.isFinite(matterResult.data.displayOrder)
            ? matterResult.data.displayOrder
            : null,
        content,
        raw: fileContents,
        naverRaw,
        createdAtMs,
        sortDateMs: resolveSortDateMs(date, createdAtMs),
        sortOrderValue:
          typeof matterResult.data.displayOrder === "number" && Number.isFinite(matterResult.data.displayOrder)
            ? matterResult.data.displayOrder
            : Number.MAX_SAFE_INTEGER,
      };
      const validationIssues = validatePostFrontmatter(post);

      if (!options.includeHidden && post.hidden) {
        return null;
      }

      return {
        ...post,
        validationIssues,
      };
    } catch (e) {
      console.error(`Error parsing post ${id}:`, e);
      return {
        id,
        category: "Error",
        title: "형식이 잘못된 포스트",
        excerpt: "Frontmatter 형식이 올바르지 않습니다.",
        date: "",
        author: "THE MMA JOURNAL",
        tags: [] as string[],
        content: "내용을 파싱할 수 없습니다.",
        raw: "",
        naverRaw: null,
        hidden: false,
        displayOrder: null,
        updatedAt: null,
        coverImage: null,
        coverImageAlt: null,
        validationIssues: [
          "missing-title",
          "missing-excerpt",
          "missing-date",
          "missing-cover-image",
          "missing-cover-image-alt",
        ] as PostValidationIssue[],
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
      category: post.category,
      title: post.title,
      excerpt: post.excerpt,
      date: post.date,
      author: post.author,
      tags: post.tags,
      hidden: post.hidden,
      displayOrder: post.displayOrder,
      updatedAt: post.updatedAt,
      coverImage: post.coverImage,
      coverImageAlt: post.coverImageAlt,
      validationIssues: post.validationIssues,
      ...(options.includeContent
        ? {
            content: post.content,
            raw: post.raw,
            naverRaw: post.naverRaw,
          }
        : {}),
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
    const naverPath = path.join(postsDirectory, id, "naver.md");
    const naverRaw = fs.existsSync(naverPath) ? fs.readFileSync(naverPath, "utf8") : null;
    const matterResult = matter(fileContents);
    const content = matterResult.content;
    const rawCoverImage =
      typeof matterResult.data.coverImage === "string" ? matterResult.data.coverImage : null;
    const rawCoverImageAlt =
      typeof matterResult.data.coverImageAlt === "string"
        ? matterResult.data.coverImageAlt
        : null;

    const post = {
      id,
      content,
      category: matterResult.data.category || "Uncategorized",
      title: matterResult.data.title || "Untitled",
      excerpt: matterResult.data.excerpt || "",
      date: matterResult.data.date || "",
      author: matterResult.data.author || "THE MMA JOURNAL",
      tags: matterResult.data.tags || [],
      raw: fileContents,
      naverRaw,
      hidden: matterResult.data.hidden === true,
      updatedAt: stat.mtime.toISOString(),
      coverImage: rawCoverImage || extractFirstImagePath(content),
      coverImageAlt: rawCoverImageAlt || extractFirstImageAlt(content),
      displayOrder:
        typeof matterResult.data.displayOrder === "number" && Number.isFinite(matterResult.data.displayOrder)
          ? matterResult.data.displayOrder
          : null,
    };
    const validationIssues = validatePostFrontmatter(post);

    if (!options.includeHidden && post.hidden) {
      return undefined;
    }

    return {
      ...post,
      validationIssues,
    };
  } catch {
    return undefined;
  }
}
