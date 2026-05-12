import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(request: Request) {
  try {
    const { prompt, postId } = await request.json();
    console.log(`[ImageGen] Prompt: ${prompt}`);
    console.log(`[ImageGen] PostID: ${postId}`);

    if (!prompt || !postId) {
      return NextResponse.json({ error: "Prompt and postId are required" }, { status: 400 });
    }

    const postsDirectory = path.join(process.cwd(), "content/posts");
    const postDir = path.join(postsDirectory, postId);

    if (!fs.existsSync(postDir)) {
      console.log(`[ImageGen] Creating directory: ${postDir}`);
      fs.mkdirSync(postDir, { recursive: true });
    }

    const seed = Math.floor(Math.random() * 1000000);
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;
    
    console.log(`[ImageGen] Fetching from: ${imageUrl}`);

    const imageRes = await fetch(imageUrl, {
      next: { revalidate: 0 }
    });

    if (!imageRes.ok) {
      const errorText = await imageRes.text();
      console.error(`[ImageGen] Pollinations Error: ${errorText}`);
      throw new Error(`Failed to fetch AI image: ${imageRes.status}`);
    }

    const arrayBuffer = await imageRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileName = `ai-generated-${Date.now()}.jpg`;
    const filePath = path.join(postDir, fileName);
    fs.writeFileSync(filePath, buffer);

    console.log(`[ImageGen] Saved to: ${filePath}`);

    return NextResponse.json({ success: true, fileName });
  } catch (error: any) {
    console.error("Image Generation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
