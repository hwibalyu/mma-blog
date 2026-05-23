import fs from "fs";
import path from "path";
import sharp from "sharp";
import { NextResponse } from "next/server";

const DEFAULT_CACHE_CONTROL = "public, max-age=604800, stale-while-revalidate=86400";
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const resolvedParams = await params;
  const assetPath = resolveAssetPath(resolvedParams.path);

  if (!fs.existsSync(assetPath)) {
    return new NextResponse(null, { status: 404 });
  }

  const ext = path.extname(assetPath).toLowerCase();
  const contentType = getContentType(ext);
  const file = fs.readFileSync(assetPath);
  const transformedImage = await maybeTransformImage(request, file, ext);

  const responseBody = new Uint8Array(transformedImage ?? file);

  return new NextResponse(responseBody, {
    headers: {
      "Cache-Control": DEFAULT_CACHE_CONTROL,
      "Content-Type": contentType,
    },
  });
}

async function maybeTransformImage(request: Request, file: Buffer, ext: string) {
  if (!IMAGE_EXTENSIONS.has(ext)) {
    return null;
  }

  const { searchParams } = new URL(request.url);
  const width = parsePositiveInt(searchParams.get("w"), 32, 2400);
  const height = parsePositiveInt(searchParams.get("h"), 32, 2400);
  const quality = parsePositiveInt(searchParams.get("q"), 40, 90) ?? 75;
  const fit =
    width && height && searchParams.get("fit") === "cover" ? "cover" : "inside";

  if (!width && !height && !searchParams.has("q")) {
    return null;
  }

  let transformer = sharp(file, { animated: true }).rotate();

  if (width || height) {
    transformer = transformer.resize({
      width: width ?? undefined,
      height: height ?? undefined,
      fit,
      withoutEnlargement: true,
    });
  }

  switch (ext) {
    case ".png":
      return transformer.png({ quality }).toBuffer();
    case ".webp":
      return transformer.webp({ quality }).toBuffer();
    case ".avif":
      return transformer.avif({ quality }).toBuffer();
    default:
      return transformer.jpeg({ quality, mozjpeg: true }).toBuffer();
  }
}

function parsePositiveInt(value: string | null, min: number, max: number) {
  if (!value) return null;

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed)) return null;

  return Math.min(Math.max(parsed, min), max);
}

function getContentType(ext: string) {
  switch (ext) {
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".gif":
      return "image/gif";
    case ".svg":
      return "image/svg+xml";
    case ".webp":
      return "image/webp";
    case ".avif":
      return "image/avif";
    default:
      return "application/octet-stream";
  }
}

function resolveAssetPath(pathSegments: string[]) {
  const baseDir = path.join(process.cwd(), "content/posts");
  const candidatePath = path.join(baseDir, ...pathSegments);

  if (fs.existsSync(candidatePath)) {
    return candidatePath;
  }

  if (pathSegments.length === 0) {
    return candidatePath;
  }

  const directoryPath = path.join(baseDir, ...pathSegments.slice(0, -1));
  const fileName = pathSegments[pathSegments.length - 1];

  if (!fs.existsSync(directoryPath) || !fs.statSync(directoryPath).isDirectory()) {
    return candidatePath;
  }

  const matchedName = fs
    .readdirSync(directoryPath)
    .find((entry) => entry.normalize("NFC") === fileName.normalize("NFC"));

  return matchedName ? path.join(directoryPath, matchedName) : candidatePath;
}
