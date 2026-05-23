import { NextResponse } from "next/server";
import { getPosts } from "@/lib/data";
import fs from "fs";
import path from "path";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function GET() {
  const posts = getPosts({ includeHidden: true, includeContent: true });
  return NextResponse.json(posts);
}

export async function POST(request: Request) {
  try {
    const { id, content } = await request.json();

    if (!id || !content) {
      return NextResponse.json({ error: "id and content are required" }, { status: 400 });
    }

    const postsDirectory = path.join(process.cwd(), "content/posts");
    const newPostDir = path.join(postsDirectory, id);

    const indexPath = path.join(newPostDir, "index.md");
    if (fs.existsSync(indexPath)) {
      return NextResponse.json({ error: "이미 존재하는 Post ID입니다. (index.md 파일이 존재함)" }, { status: 400 });
    }

    fs.mkdirSync(newPostDir, { recursive: true });
    fs.writeFileSync(path.join(newPostDir, "index.md"), content, "utf8");

    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
