import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";
import sharp from "sharp";
import { NextResponse } from "next/server";

const DEFAULT_CACHE_CONTROL = "public, max-age=604800, stale-while-revalidate=86400";
const TRANSFORM_CACHE_DIR = path.join(os.tmpdir(), "mma-blog-post-assets");
const IMAGE_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);

type TransformOptions = {
  width: number | null;
  height: number | null;
  quality: number;
  fit: "cover" | "inside";
};

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
  const transformOptions = getTransformOptions(request, ext);

  if (transformOptions) {
    const transformedImage = await getTransformedImage(assetPath, transformOptions);

    return new NextResponse(new Uint8Array(transformedImage), {
      headers: {
        "Cache-Control": DEFAULT_CACHE_CONTROL,
        "Content-Type": "image/webp",
      },
    });
  }

  const file = await fs.promises.readFile(assetPath);

  return new NextResponse(new Uint8Array(file), {
    headers: {
      "Cache-Control": DEFAULT_CACHE_CONTROL,
      "Content-Type": getContentType(ext),
    },
  });
}

function getTransformOptions(request: Request, ext: string): TransformOptions | null {
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

  return { width, height, quality, fit };
}

async function getTransformedImage(assetPath: string, options: TransformOptions) {
  const cachePath = await getTransformCachePath(assetPath, {
    width: options.width,
    height: options.height,
    quality: options.quality,
    fit: options.fit,
  });
  const cachedImage = readCachedTransform(cachePath);

  if (cachedImage) {
    return cachedImage;
  }

  const file = await fs.promises.readFile(assetPath);
  let transformer = sharp(file, { animated: true }).rotate();

  if (options.width || options.height) {
    transformer = transformer.resize({
      width: options.width ?? undefined,
      height: options.height ?? undefined,
      fit: options.fit,
      withoutEnlargement: true,
    });
  }

  const transformedImage = await transformer.webp({ quality: options.quality }).toBuffer();
  await fs.promises.mkdir(TRANSFORM_CACHE_DIR, { recursive: true });
  await fs.promises.writeFile(cachePath, transformedImage);

  return transformedImage;
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

async function getTransformCachePath(
  assetPath: string,
  params: TransformOptions,
) {
  const fileStat = await fs.promises.stat(assetPath);
  const cacheKey = crypto
    .createHash("sha1")
    .update(
      JSON.stringify({
        assetPath,
        updatedAt: fileStat.mtimeMs,
        ...params,
      }),
    )
    .digest("hex");

  return path.join(TRANSFORM_CACHE_DIR, `${cacheKey}.webp`);
}

function readCachedTransform(cachePath: string) {
  if (!fs.existsSync(cachePath)) {
    return null;
  }

  return fs.readFileSync(cachePath);
}

function resolveAssetPath(pathSegments: string[]) {
  const baseDir = path.join(process.cwd(), "content/posts");
  const resolvedSegments = resolvePathSegments(baseDir, pathSegments);
  const candidatePath = path.join(baseDir, ...resolvedSegments);

  return candidatePath;
}

function resolvePathSegments(baseDir: string, pathSegments: string[]) {
  const resolvedSegments: string[] = [];
  let currentDir = baseDir;

  for (const segment of pathSegments) {
    const decodedSegment = decodePathSegment(segment);

    if (!fs.existsSync(currentDir) || !fs.statSync(currentDir).isDirectory()) {
      resolvedSegments.push(decodedSegment);
      currentDir = path.join(currentDir, decodedSegment);
      continue;
    }

    const matchedName = fs
      .readdirSync(currentDir)
      .find((entry) => entry.normalize("NFC") === decodedSegment.normalize("NFC"));
    const resolvedSegment = matchedName ?? decodedSegment;

    resolvedSegments.push(resolvedSegment);
    currentDir = path.join(currentDir, resolvedSegment);
  }

  return resolvedSegments;
}

function decodePathSegment(segment: string) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}
