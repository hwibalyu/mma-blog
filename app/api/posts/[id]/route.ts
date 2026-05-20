import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";

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

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { hidden, displayOrder } = (await request.json()) as {
      hidden?: boolean;
      displayOrder?: number | null;
    };

    const postsDirectory = path.join(process.cwd(), "content/posts");
    const filePath = path.join(postsDirectory, id, "index.md");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const fileContents = fs.readFileSync(filePath, "utf8");
    const matterResult = matter(fileContents);
    const nextData = { ...matterResult.data };

    if (typeof hidden === "boolean") {
      nextData.hidden = hidden;
    }

    if (displayOrder === null) {
      delete nextData.displayOrder;
    } else if (typeof displayOrder === "number" && Number.isFinite(displayOrder)) {
      nextData.displayOrder = displayOrder;
    } else if (displayOrder !== undefined) {
      return NextResponse.json({ error: "displayOrder must be a number or null" }, { status: 400 });
    }

    if (hidden === undefined && displayOrder === undefined) {
      return NextResponse.json({ error: "hidden or displayOrder is required" }, { status: 400 });
    }

    const nextRaw = matter.stringify(matterResult.content, {
      ...nextData,
    });

    fs.writeFileSync(filePath, nextRaw, "utf8");

    return NextResponse.json({
      success: true,
      id,
      hidden: typeof nextData.hidden === "boolean" ? nextData.hidden : false,
      displayOrder: typeof nextData.displayOrder === "number" ? nextData.displayOrder : null,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
