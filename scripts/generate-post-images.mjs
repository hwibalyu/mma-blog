import fs from "fs";
import path from "path";

function parseArgs(argv) {
  const args = { post: "", style: "event-photo", context: "" };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--post") args.post = argv[index + 1] ?? "";
    if (arg === "--style") args.style = argv[index + 1] ?? "event-photo";
    if (arg === "--context") args.context = argv[index + 1] ?? "";
  }

  return args;
}

function buildStyleInstruction(style) {
  if (style === "fight-action") {
    return "cinematic in-cage MMA action still, visible technique, impact, sweat, gloves, octagon fence";
  }

  if (style === "fighter-portrait") {
    return "premium editorial fighter portrait photography, intense expression, arena or training camp atmosphere";
  }

  if (style === "poster-illustration") {
    return "premium sports poster illustration inspired by a real MMA event, bold composition, dramatic but coherent anatomy";
  }

  return "photorealistic editorial MMA event photography, arena lighting, crowd atmosphere, sports magazine quality";
}

function normalizePrompt({ alt, style, context }) {
  const styleInstruction = buildStyleInstruction(style);
  const contextInstruction = context ? `Article context: ${context}.` : "";

  return [
    styleInstruction,
    `Scene: ${alt}.`,
    contextInstruction,
    "premium editorial MMA visual, sports magazine quality, coherent anatomy, realistic gloves and hands, clear facial structure, no text, no watermark, no logo, no deformed hands, no extra fingers, no extra limbs, no duplicated subject, no blurry face, no surreal floating objects, no distorted anatomy",
  ]
    .filter(Boolean)
    .join(" ");
}

function extractImages(markdown) {
  const matches = [...markdown.matchAll(/!\[([^\]]*)\]\((\.\/[^)]+)\)/g)];
  return matches.map((match) => ({
    alt: match[1]?.trim() || "MMA article image",
    path: match[2],
  }));
}

async function generateImageBuffer(prompt) {
  const seed = Math.floor(Math.random() * 1000000);
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1024&height=1024&nologo=true&seed=${seed}&model=flux`;
  const response = await fetch(imageUrl);

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Image generation failed: ${response.status} ${text}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function main() {
  const { post, style, context } = parseArgs(process.argv.slice(2));

  if (!post) {
    throw new Error("Missing required --post <slug> argument");
  }

  const postDir = path.join(process.cwd(), "content/posts", post);
  const markdownPath = path.join(postDir, "index.md");

  if (!fs.existsSync(markdownPath)) {
    throw new Error(`Post markdown not found: ${markdownPath}`);
  }

  let markdown = fs.readFileSync(markdownPath, "utf8");
  const images = extractImages(markdown);

  if (images.length === 0) {
    console.log("No markdown image tags found. Nothing to generate.");
    return;
  }

  for (let index = 0; index < images.length; index += 1) {
    const image = images[index];
    const prompt = normalizePrompt({
      alt: image.alt,
      style,
      context,
    });

    const buffer = await generateImageBuffer(prompt);
    const fileName = `ai-generated-${Date.now()}-${index + 1}.jpg`;
    const filePath = path.join(postDir, fileName);
    fs.writeFileSync(filePath, buffer);

    markdown = markdown.replace(image.path, `./${fileName}`);
    console.log(`Generated ${fileName} for: ${image.alt}`);
  }

  fs.writeFileSync(markdownPath, markdown, "utf8");
  console.log(`Updated markdown image paths in ${markdownPath}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
