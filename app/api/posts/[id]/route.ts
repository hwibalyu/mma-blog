import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const postsDirectory = path.join(process.cwd(), "content/posts");
    
    // index.md를 지원하는 방식이므로 먼저 디렉토리 내 index.md를 확인
    let filePath = path.join(postsDirectory, id, "index.md");
    if (!fs.existsSync(filePath)) {
      filePath = path.join(postsDirectory, `${id}.md`);
      if (!fs.existsSync(filePath)) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
    }

    fs.writeFileSync(filePath, content, "utf8");

    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const postsDirectory = path.join(process.cwd(), "content/posts");
    
    const dirPath = path.join(postsDirectory, id);
    const filePath = path.join(postsDirectory, `${id}.md`);

    if (fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory()) {
      fs.rmSync(dirPath, { recursive: true, force: true });
    } else if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    } else {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
