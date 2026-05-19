import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

function getApiKey() {
  const keys = (process.env.POLLINATIONS_API_KEY || process.env.ZAI_API_KEY || process.env.GEMINI_API_KEY || "")
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);

  return keys[0] ?? "";
}

function normalizeImagePrompt(prompt: string) {
  const trimmed = prompt.trim().replace(/\s+/g, " ");

  const baseStyle = [
    "premium editorial MMA visual",
    "sports magazine quality",
    "coherent anatomy",
    "realistic gloves and hands",
    "clear facial structure",
    "cinematic arena lighting",
  ].join(", ");

  const negativeRules = [
    "no text",
    "no watermark",
    "no logo",
    "no deformed hands",
    "no extra fingers",
    "no extra limbs",
    "no duplicated subject",
    "no blurry face",
    "no surreal floating objects",
    "no distorted anatomy",
  ].join(", ");

  const hasVisualType = /(photograph|photography|photo|portrait|illustration|poster|editorial|cinematic)/i.test(trimmed);
  const visualLead = hasVisualType
    ? ""
    : "photorealistic editorial MMA event photography, ";

  return `${visualLead}${trimmed}. ${baseStyle}. ${negativeRules}`;
}

async function uploadReferenceImageToPollinations(filePath: string, apiKey: string) {
  const fileBuffer = fs.readFileSync(filePath);
  const formData = new FormData();
  const fileName = path.basename(filePath);
  const blob = new Blob([fileBuffer]);
  formData.append("file", blob, fileName);

  const response = await fetch("https://gen.pollinations.ai/upload", {
    method: "POST",
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
    body: formData,
  });

  const data = (await response.json()) as { url?: string; error?: { message?: string } };
  if (!response.ok || !data.url) {
    throw new Error(data.error?.message || "Failed to upload reference image");
  }

  return data.url;
}

async function generateWithPollinationsApi(prompt: string, apiKey: string, referenceImageUrls: string[]) {
  const payload: Record<string, unknown> = {
    prompt,
    size: "1024x1024",
    quality: "medium",
    response_format: "b64_json",
    model: referenceImageUrls.length > 0 ? "p-image-edit" : "flux",
  };

  if (referenceImageUrls.length > 0) {
    payload.image = referenceImageUrls;
  }

  const endpoint =
    referenceImageUrls.length > 0
      ? "https://gen.pollinations.ai/v1/images/edits"
      : "https://gen.pollinations.ai/v1/images/generations";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as {
    data?: Array<{ b64_json?: string; url?: string }>;
    error?: { message?: string };
  };

  if (!response.ok) {
    throw new Error(data.error?.message || `Pollinations API request failed with ${response.status}`);
  }

  const firstImage = data.data?.[0];
  if (firstImage?.b64_json) {
    return Buffer.from(firstImage.b64_json, "base64");
  }

  if (firstImage?.url) {
    const imageResponse = await fetch(firstImage.url);
    if (!imageResponse.ok) {
      throw new Error("Failed to fetch generated image URL");
    }

    const imageArrayBuffer = await imageResponse.arrayBuffer();
    return Buffer.from(imageArrayBuffer);
  }

  throw new Error("Pollinations API returned no image data");
}

export async function POST(request: Request) {
  try {
    const { prompt, postId, caption, imageStyle, referenceImageNames = [] } = await request.json();
    const styleHint = imageStyle ? `Style direction: ${imageStyle}.` : "";
    const captionHint = caption ? `Scene focus: ${caption}.` : "";
    const normalizedPrompt = normalizeImagePrompt([prompt, styleHint, captionHint].filter(Boolean).join(" "));
    console.log(`[ImageGen] Prompt: ${normalizedPrompt}`);
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

    const referencePaths = Array.isArray(referenceImageNames)
      ? referenceImageNames
          .map((fileName) => (typeof fileName === "string" ? path.join(postDir, fileName) : ""))
          .filter((filePath) => filePath && fs.existsSync(filePath))
      : [];

    let buffer: Buffer;
    const apiKey = getApiKey();

    if (referencePaths.length > 0) {
      const referenceImageUrls = await Promise.all(
        referencePaths.map((referencePath) => uploadReferenceImageToPollinations(referencePath, apiKey)),
      );
      buffer = await generateWithPollinationsApi(normalizedPrompt, apiKey, referenceImageUrls);
    } else if (apiKey) {
      buffer = await generateWithPollinationsApi(normalizedPrompt, apiKey, []);
    } else {
      const seed = Math.floor(Math.random() * 1000000);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(normalizedPrompt)}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;
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
      buffer = Buffer.from(arrayBuffer);
    }

    const fileName = `ai-generated-${Date.now()}.jpg`;
    const filePath = path.join(postDir, fileName);
    fs.writeFileSync(filePath, buffer);

    console.log(`[ImageGen] Saved to: ${filePath}`);

    return NextResponse.json({ success: true, fileName });
  } catch (error: unknown) {
    console.error("Image Generation Error:", error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
