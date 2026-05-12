import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const postsDirectory = path.join(process.cwd(), "content/posts");
    const postDir = path.join(postsDirectory, id);

    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const filePath = path.join(postDir, file.name);
    fs.writeFileSync(filePath, buffer);

    return NextResponse.json({ success: true, fileName: file.name });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
