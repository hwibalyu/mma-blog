import { NextResponse } from "next/server";
import { getPosts } from "@/lib/data";
import fs from "fs";
import path from "path";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

function extractFrontmatterField(markdown: string, field: string) {
  const pattern = new RegExp(`^---[\\s\\S]*?\\n${field}:\\s*["']?([^"'\n]*?)["']?\\s*(?:\\n|$)`, "m");
  return markdown.match(pattern)?.[1]?.trim() ?? "";
}

function stripFrontmatter(markdown: string) {
  return markdown.replace(/^---[\s\S]*?---\s*/u, "");
}

function escapeYamlString(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function createFallbackNaverContent(content: string) {
  const title = extractFrontmatterField(content, "title") || "Untitled";
  const category = extractFrontmatterField(content, "category") || "컬럼";
  const date = extractFrontmatterField(content, "date");
  const excerpt = extractFrontmatterField(content, "excerpt") || title;
  const body = stripFrontmatter(content)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const paragraphs = body
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 8);
  const summary = [`**핵심만 먼저 보면,** ${excerpt}`, ...paragraphs]
    .filter(Boolean)
    .join("\n\n")
    .slice(0, 2200);

  return `---\ntitle: "${escapeYamlString(title)}"\ncategory: "${escapeYamlString(
    category,
  )}"\ndate: "${escapeYamlString(date)}"\nexcerpt: "${escapeYamlString(
    excerpt,
  )}"\ntags: []\nauthor: "THE MMA JOURNAL"\n---\n\n${summary}`;
}

export async function GET() {
  const posts = getPosts({ includeHidden: true, includeContent: true });
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  try {
    const { id, content, naverContent } = await request.json();

    if (!id || !content) {
      return NextResponse.json({ error: "id and content are required" }, { status: 400 });
    }

    if (naverContent !== undefined && typeof naverContent !== "string") {
      return NextResponse.json({ error: "naverContent must be a string" }, { status: 400 });
    }

    const postsDirectory = path.join(process.cwd(), "content/posts");
    const newPostDir = path.join(postsDirectory, id);

    const indexPath = path.join(newPostDir, "index.md");
    if (fs.existsSync(indexPath)) {
      return NextResponse.json({ error: "이미 존재하는 Post ID입니다. (index.md 파일이 존재함)" }, { status: 400 });
    }

    fs.mkdirSync(newPostDir, { recursive: true });
    fs.writeFileSync(path.join(newPostDir, "index.md"), content, "utf8");
    const nextNaverContent =
      typeof naverContent === "string" && naverContent.trim()
        ? naverContent
        : createFallbackNaverContent(content);
    fs.writeFileSync(path.join(newPostDir, "naver.md"), nextNaverContent, "utf8");

    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
