import path from "path";

export const SITE_NAME = "THE MMA JOURNAL";
export const SITE_AUTHOR_NAME = SITE_NAME;
export const DEFAULT_SITE_DESCRIPTION =
  "UFC와 한국 MMA를 깊이 있게 다루는 분석 중심의 종합격투기 저널.";

export const CATEGORY_MAP: Record<string, string> = {
  column: "컬럼",
  "global-news": "해외컬럼/뉴스",
  "match-analysis": "매치분석",
};

const LOCALHOST_FALLBACK = "http://localhost:3000";

export function getSiteUrl() {
  const rawUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    LOCALHOST_FALLBACK;

  const normalized = rawUrl.startsWith("http") ? rawUrl : `https://${rawUrl}`;
  return normalized.replace(/\/$/, "");
}

export function absoluteUrl(pathname = "/") {
  return new URL(pathname, `${getSiteUrl()}/`).toString();
}

export function buildPageTitle(title: string) {
  return `${title} | ${SITE_NAME}`;
}

export function getCategorySlug(categoryName: string) {
  return Object.entries(CATEGORY_MAP).find(([, value]) => value === categoryName)?.[0];
}

export function extractFirstImagePath(markdown: string) {
  const imageMatch = markdown.match(/!\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
  if (!imageMatch) return null;

  const [, rawPath] = imageMatch;
  if (rawPath.startsWith("http://") || rawPath.startsWith("https://")) {
    return rawPath;
  }

  return rawPath.replace(/^\.\//, "");
}

export function extractFirstImageAlt(markdown: string) {
  const imageMatch = markdown.match(/!\[([^\]]*)]\(([^)\s]+)(?:\s+"[^"]*")?\)/);
  if (!imageMatch) return null;

  const [, alt] = imageMatch;
  return alt || null;
}

export function normalizeAssetPath(assetPath: string) {
  return assetPath
    .replace(/^\.\//, "")
    .split(path.sep)
    .join("/")
    .replace(/^\/+/, "");
}

export function getPostAssetPath(postId: string, assetPath: string) {
  if (assetPath.startsWith("http://") || assetPath.startsWith("https://")) {
    return assetPath;
  }

  const normalizedPath = normalizeAssetPath(assetPath)
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");

  return `/api/assets/${encodeURIComponent(postId)}/${normalizedPath}`;
}

export function resolvePostAssetUrl(postId: string, assetPath: string) {
  if (assetPath.startsWith("http://") || assetPath.startsWith("https://")) {
    return assetPath;
  }

  return absoluteUrl(getPostAssetPath(postId, assetPath));
}

export function getPostAssetUrl(postId: string, assetPath?: string | null) {
  if (!assetPath) return null;
  return resolvePostAssetUrl(postId, assetPath);
}

type PostImageUrlOptions = {
  width?: number;
  height?: number;
  quality?: number;
  fit?: "cover" | "inside";
};

export function getPostCardImageUrl(
  postId: string,
  assetPath?: string | null,
  options: PostImageUrlOptions = {},
) {
  if (!assetPath) return null;

  const url = getPostAssetPath(postId, assetPath);
  if (!url || assetPath?.startsWith("http://") || assetPath?.startsWith("https://")) {
    return url;
  }

  const { width = 440, height = 330, quality = 72, fit = "cover" } = options;
  const searchParams = new URLSearchParams({
    w: String(width),
    h: String(height),
    fit,
    q: String(quality),
  });

  return `${url}?${searchParams}`;
}

export function normalizeIsoDate(value?: string) {
  if (!value) return undefined;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;

  return parsed.toISOString();
}
