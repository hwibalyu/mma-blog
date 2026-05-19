import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/posts");

export type Post = {
  id: string;
  category: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  content: string;
  raw: string;
};

export function getPosts(): Post[] {
  if (!fs.existsSync(postsDirectory)) return [];

  const folders = fs.readdirSync(postsDirectory).filter(file => {
    return fs.statSync(path.join(postsDirectory, file)).isDirectory();
  });

  const allPosts = folders.map(id => {
    const fullPath = path.join(postsDirectory, id, "index.md");
    if (!fs.existsSync(fullPath)) return null;

    try {
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const matterResult = matter(fileContents);

      return {
        id,
        content: matterResult.content,
        category: matterResult.data.category || "Uncategorized",
        title: matterResult.data.title || "Untitled",
        excerpt: matterResult.data.excerpt || "",
        date: matterResult.data.date || "",
        tags: matterResult.data.tags || [],
        raw: fileContents,
      };
    } catch (e) {
      console.error(`Error parsing post ${id}:`, e);
      return {
        id,
        content: "내용을 파싱할 수 없습니다.",
        category: "Error",
        title: "형식이 잘못된 포스트",
        excerpt: "Frontmatter 형식이 올바르지 않습니다.",
        date: "",
        tags: [],
        raw: "",
      };
    }
  }).filter((post): post is Post => post !== null);

  return allPosts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getPost(id: string): Post | undefined {
  let fullPath = path.join(postsDirectory, id, "index.md");
  
  if (!fs.existsSync(fullPath)) {
    fullPath = path.join(postsDirectory, `${id}.md`);
    if (!fs.existsSync(fullPath)) return undefined;
  }

  try {
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const matterResult = matter(fileContents);

    return {
      id,
      content: matterResult.content,
      category: matterResult.data.category || "Uncategorized",
      title: matterResult.data.title || "Untitled",
      excerpt: matterResult.data.excerpt || "",
      date: matterResult.data.date || "",
      tags: matterResult.data.tags || [],
      raw: fileContents,
    };
  } catch {
    return undefined;
  }
}
