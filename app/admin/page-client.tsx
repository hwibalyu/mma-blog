"use client";

import { useState } from "react";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import { toString } from "mdast-util-to-string";

type Post = {
  id: string;
  title: string;
  category: string;
  date: string;
  excerpt?: string;
  raw: string;
};

type MarkdownNode = {
  type: string;
  depth?: number;
  lang?: string | null;
  value?: string;
  ordered?: boolean;
  children?: MarkdownNode[];
  align?: Array<"left" | "right" | "center" | null>;
};

const MARK_OPEN = "\uE000";
const MARK_CLOSE = "\uE001";
const UNDERLINE_OPEN = "\uE002";
const UNDERLINE_CLOSE = "\uE003";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function preprocessNaverMarkdown(markdown: string) {
  return markdown
    .replace(/<mark>([\s\S]*?)<\/mark>/gi, `${MARK_OPEN}$1${MARK_CLOSE}`)
    .replace(/<(u|ins)>([\s\S]*?)<\/\1>/gi, `${UNDERLINE_OPEN}$2${UNDERLINE_CLOSE}`)
    .replace(/<br\s*\/?>/gi, "\n");
}

function renderDecoratedText(value: string) {
  return escapeHtml(value)
    .replaceAll(MARK_OPEN, `<span style="display:inline; background:#ffe27a; box-shadow:inset 0 -0.52em 0 rgba(255,226,122,0.92); font-style:italic; color:#111;">`)
    .replaceAll(MARK_CLOSE, "</span>")
    .replaceAll(
      UNDERLINE_OPEN,
      `<span style="display:inline; border-bottom:2px solid #111; padding-bottom:1px; font-weight:700; color:#111;">`,
    )
    .replaceAll(UNDERLINE_CLOSE, "</span>");
}

function extractFrontmatterTitle(markdown: string) {
  const match = markdown.match(/^---[\s\S]*?\ntitle:\s*["']?(.*?)["']?\s*(?:\n|$)/m);
  return match?.[1]?.trim() ?? "";
}

function stripFrontmatter(markdown: string) {
  return markdown.replace(/^---[\s\S]*?---\s*/u, "");
}

function markdownToNaverText(markdown: string) {
  const body = preprocessNaverMarkdown(stripFrontmatter(markdown));

  return body
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, (_, alt: string) => (alt ? `[이미지] ${alt}` : ""))
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "• ")
    .replace(/^\s*\d+\.\s+/gm, "• ")
    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/~~([^~]+)~~/g, "$1")
    .replace(new RegExp(`${MARK_OPEN}|${MARK_CLOSE}|${UNDERLINE_OPEN}|${UNDERLINE_CLOSE}`, "g"), "")
    .replace(/<[^>]+>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function paragraphHtml(content: string, extraStyle = "") {
  return `<p style="margin:0; font-size:17px; color:#222; word-break:keep-all;${extraStyle}">${content || "&nbsp;"}</p>`;
}

function spacerHtml() {
  return `<p>&nbsp;</p>`;
}

function withBlockGap(content: string, gapCount = 1) {
  return [content, ...Array.from({ length: gapCount }, () => spacerHtml())];
}

function renderImagePlaceholder(node: MarkdownNode) {
  const alt = toString(node).trim() || "이미지";
  return `<div style="display:flex;align-items:center;justify-content:center;min-height:180px;border:2px dashed #ccc;background:#f5f5f5;box-sizing:border-box;color:#999;font-size:12px;">[이미지 삽입 위치] ${escapeHtml(alt)}</div>`;
}

function renderCodeBlock(node: MarkdownNode) {
  const language = node.lang
    ? `<div style="margin:0 0 10px; color:#8a8a8a; font-size:12px; font-weight:700; text-transform:uppercase; letter-spacing:0.08em;">${escapeHtml(node.lang)}</div>`
    : "";
  const lines = (node.value ?? "").split("\n");
  const codeLines = lines
    .map((line) => `<div style="white-space:pre-wrap;">${escapeHtml(line) || "&nbsp;"}</div>`)
    .join("");

  return `<div style="border:1px solid rgb(221, 221, 221);background-color:rgb(246, 248, 250);border-radius:6px;padding:16px;font-family:'Courier New', monospace;font-size:0.9em;color:rgb(36, 41, 46);">${language}${codeLines}</div>`;
}

function renderTable(node: MarkdownNode) {
  const rows = node.children ?? [];
  const headerRow = rows[0];
  const bodyRows = rows.slice(1);

  const renderRow = (row: MarkdownNode, isHeader: boolean) => {
    const cells = row.children ?? [];
    return `<tr>${cells
      .map((cell, index) => {
        const tag = isHeader ? "th" : "td";
        const align = node.align?.[index] ?? "left";
        const background = isHeader ? "background:#f7f7f7;" : "background:#fff;";
        return `<${tag} style="border:1px solid rgb(200, 200, 200); padding:0.5em 0.75em; text-align:${align}; vertical-align:top; ${background} font-size:13px; color:#222;">${renderInlineNodes(
          cell.children ?? [],
        )}</${tag}>`;
      })
      .join("")}</tr>`;
  };

  return `<table style="width:100%; border-collapse:collapse; table-layout:fixed;">${headerRow ? `<thead>${renderRow(headerRow, true)}</thead>` : ""}<tbody>${bodyRows
    .map((row) => renderRow(row, false))
    .join("")}</tbody></table>`;
}

function renderInlineNodes(nodes: MarkdownNode[]): string {
  return nodes
    .map((node) => {
      switch (node.type) {
        case "text":
          return renderDecoratedText(node.value ?? "");
        case "strong":
          return `<strong style="font-weight:800; color:#111;">${renderInlineNodes(node.children ?? [])}</strong>`;
        case "emphasis":
          return `<em style="font-style:italic;">${renderInlineNodes(node.children ?? [])}</em>`;
        case "delete":
          return `<span style="text-decoration:line-through; color:#666;">${renderInlineNodes(node.children ?? [])}</span>`;
        case "inlineCode":
          return `<span style="font-family:'SFMono-Regular',Consolas,monospace; background:#f4f4f4; border:1px solid #e5e5e5; border-radius:4px; padding:1px 6px; font-size:0.95em;">${escapeHtml(node.value ?? "")}</span>`;
        case "break":
          return "<br />";
        case "link":
          return `<span style="color:#1f5bd8; text-decoration:underline;">${renderInlineNodes(
            node.children ?? [],
          )}</span>`;
        case "image":
          return `[이미지] ${escapeHtml(toString(node).trim() || "이미지")}`;
        case "html":
          return renderDecoratedText(node.value ?? "");
        default:
          return node.children ? renderInlineNodes(node.children) : renderDecoratedText(toString(node));
      }
    })
    .join("");
}

function renderBlockNode(node: MarkdownNode, listDepth = 0): string[] {
  switch (node.type) {
    case "heading": {
      const level = node.depth ?? 1;
      const sizes = ["3em", "2em", "1.17em", "1em", "0.9em", "0.8em"];
      const headingSize = sizes[level - 1] ?? "1em";
      return withBlockGap(
        `<p style="font-size:${headingSize}; font-weight:bold; color:#111; word-break:keep-all;">${renderInlineNodes(
          node.children ?? [],
        )}</p>`,
        1,
      );
    }
    case "paragraph":
      if (node.children?.length === 1 && node.children[0]?.type === "image") {
        return withBlockGap(renderImagePlaceholder(node.children[0]), 1);
      }
      return withBlockGap(paragraphHtml(renderInlineNodes(node.children ?? [])), 1);
    case "blockquote":
      return withBlockGap(
        `<div style="padding-left:16px; border-left:4px solid #ea384c;">${(node.children ?? [])
          .flatMap((child) => renderBlockNode(child, listDepth))
          .join("")}</div>`,
        1,
      );
    case "list":
      return [
        ...(node.children ?? []).flatMap((child, index) =>
          renderBlockNode(
            {
              ...child,
              value: `${node.ordered ? `${index + 1}.` : "•"}`,
            },
            listDepth + 1,
          ),
        ),
        spacerHtml(),
      ];
    case "listItem": {
      const marker = node.value ?? "•";
      const content = (node.children ?? [])
        .flatMap((child) => {
          if (child.type === "paragraph") {
            return renderInlineNodes(child.children ?? []);
          }

          return renderBlockNode(child, listDepth).join("");
        })
        .join("");

      return [
        `<p style="margin:0; padding-left:${18 + listDepth * 16}px; text-indent:-${14}px; font-size:17px; color:#222; word-break:keep-all;">${escapeHtml(
          marker,
        )} ${content || "&nbsp;"}</p>`,
        spacerHtml(),
      ];
    }
    case "code":
      return withBlockGap(renderCodeBlock(node), 1);
    case "thematicBreak":
      return [`<div style="border-top:1px solid #e5e5e5;"></div>`, spacerHtml()];
    case "table":
      return withBlockGap(renderTable(node), 1);
    case "image":
      return withBlockGap(renderImagePlaceholder(node), 1);
    case "html":
      return withBlockGap(paragraphHtml(renderDecoratedText(node.value ?? "")), 1);
    default:
      if (node.children?.length) {
        return node.children.flatMap((child) => renderBlockNode(child, listDepth));
      }
      return [];
  }
}

function createNaverClipboardPayload(markdown: string) {
  const title = extractFrontmatterTitle(markdown);
  const normalizedBody = preprocessNaverMarkdown(stripFrontmatter(markdown));
  const plainBody = markdownToNaverText(markdown);
  const plainText = title ? `${title}\n\n${plainBody}`.trim() : plainBody;
  const tree = unified().use(remarkParse).use(remarkGfm).parse(normalizedBody) as MarkdownNode;
  const blocks = (tree.children ?? []).flatMap((node) => renderBlockNode(node));
  const titleBlock = title
    ? `<p style="font-size:3em; font-weight:bold; color:#111; word-break:keep-all;">${escapeHtml(title)}</p>${spacerHtml()}`
    : "";
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8" /></head><body>${titleBlock}${blocks.length ? blocks.join("") : spacerHtml()}</body></html>`;

  return { html, plainText };
}

type AdminDashboardClientProps = {
  initialPosts: Post[];
};

type ImageStyle = "event-photo" | "fight-action" | "fighter-portrait" | "poster-illustration";

type GeneratedPostResponse = {
  content: string;
  slug: string;
  imagePrompt: string;
};

const IMAGE_STYLE_OPTIONS: Array<{
  value: ImageStyle;
  label: string;
  description: string;
}> = [
  {
    value: "event-photo",
    label: "이벤트 사진",
    description: "대회 현장, 케이지, 조명, 군중 분위기 중심",
  },
  {
    value: "fight-action",
    label: "매치 액션",
    description: "타격 교환, 테이크다운 방어 같은 경기 장면 중심",
  },
  {
    value: "fighter-portrait",
    label: "선수 포트레이트",
    description: "선수 중심의 기사형 인물 사진 분위기",
  },
  {
    value: "poster-illustration",
    label: "포스터 일러스트",
    description: "매거진용 스포츠 포스터 스타일 일러스트",
  },
];

function extractMarkdownImages(markdown: string) {
  const matches = [...markdown.matchAll(/!\[([^\]]*)\]\((\.\/[^)]+)\)/g)];
  return matches.map((match) => ({
    alt: match[1]?.trim() || "MMA article image",
    path: match[2],
  }));
}

function replaceImagePath(markdown: string, oldPath: string, newPath: string) {
  return markdown.replace(oldPath, newPath);
}

function buildImageGenerationPrompt(basePrompt: string, imageAlt: string, imageStyle: ImageStyle) {
  const styleInstruction =
    imageStyle === "event-photo"
      ? "Create a photorealistic editorial MMA event photo with arena atmosphere."
      : imageStyle === "fight-action"
        ? "Create a cinematic in-cage MMA action still with visible technique and impact."
        : imageStyle === "fighter-portrait"
          ? "Create a premium sports portrait of an MMA fighter, editorial magazine style."
          : "Create a premium sports poster illustration inspired by a real MMA event and matchup.";

  return `${basePrompt} ${styleInstruction} Focus specifically on this scene: ${imageAlt}`;
}

export default function AdminDashboardClient({
  initialPosts,
}: AdminDashboardClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [selectedId, setSelectedId] = useState<string | null>(initialPosts[0]?.id ?? null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isSyncingId, setIsSyncingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [includeImages, setIncludeImages] = useState(true);
  const [autoGenerateImages, setAutoGenerateImages] = useState(true);
  const [imageStyle, setImageStyle] = useState<ImageStyle>("event-photo");
  const [referenceImages, setReferenceImages] = useState<File[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState(
    initialPosts.length ? "글 목록이 준비되었습니다." : "아직 작성된 글이 없습니다.",
  );

  async function fetchPosts(nextSelectedId?: string | null) {
    setIsLoading(true);

    try {
      const response = await fetch("/api/posts", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("글 목록을 불러오지 못했습니다.");
      }

      const data = (await response.json()) as Post[];
      setPosts(data);

      const fallbackId = nextSelectedId ?? selectedId;
      const nextSelected = data.find((post) => post.id === fallbackId) ?? data[0] ?? null;
      setSelectedId(nextSelected?.id ?? null);
      setStatus(data.length ? "글 목록이 갱신되었습니다." : "아직 작성된 글이 없습니다.");
    } catch (error) {
      console.error(error);
      setStatus("글 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(post: Post) {
    const shouldDelete = window.confirm(
      `"${post.title}" 글을 정말 삭제할까요?\n운영 서버 폴더도 먼저 삭제한 뒤 로컬 글을 지웁니다.`,
    );
    if (!shouldDelete) return;

    setIsDeletingId(post.id);

    try {
      const syncDeleteResponse = await fetch("/api/admin/inject-post", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: post.id }),
      });

      const syncDeleteData = (await syncDeleteResponse.json()) as { error?: string };
      if (!syncDeleteResponse.ok) {
        throw new Error(syncDeleteData.error || "운영 서버 삭제에 실패했습니다.");
      }

      const response = await fetch(`/api/posts/${post.id}`, { method: "DELETE" });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "삭제에 실패했습니다.");
      }

      setStatus(`"${post.title}" 글을 로컬과 운영 서버에서 삭제했습니다.`);
      await fetchPosts(selectedId === post.id ? null : selectedId);
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "삭제 중 오류가 발생했습니다.";
      alert(message);
      setStatus(message);
    } finally {
      setIsDeletingId(null);
    }
  }

  async function handleCopy(post: Post) {
    try {
      const { html, plainText } = createNaverClipboardPayload(post.raw);
      const htmlBlob = new Blob([html], { type: "text/html" });
      const textBlob = new Blob([plainText], { type: "text/plain" });

      if (typeof ClipboardItem !== "undefined" && navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": htmlBlob,
            "text/plain": textBlob,
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }

      setCopiedId(post.id);
      setSelectedId(post.id);
      setStatus(`"${post.title}" 글을 네이버 블로그용 서식 HTML로 복사했습니다.`);
      window.setTimeout(() => {
        setCopiedId((current) => (current === post.id ? null : current));
      }, 2000);
    } catch (error) {
      console.error(error);
      alert("클립보드 복사에 실패했습니다.");
    }
  }

  async function handleSync(post: Post) {
    const shouldSync = window.confirm(
      `"${post.title}" 폴더를 운영 서버와 동기화할까요?\n로컬에서만 실행되며, 운영 서버에는 같은 슬러그 폴더가 덮어써질 수 있습니다.`,
    );
    if (!shouldSync) return;

    setIsSyncingId(post.id);
    setStatus(`"${post.title}" 폴더를 운영 서버와 동기화하고 있습니다.`);

    try {
      const response = await fetch("/api/admin/inject-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: post.id }),
      });

      const data = (await response.json()) as { error?: string; fileCount?: number };
      if (!response.ok) {
        throw new Error(data.error || "운영 서버 동기화에 실패했습니다.");
      }

      setStatus(
        `"${post.title}" 폴더를 운영 서버와 동기화했습니다. (${data.fileCount ?? 0}개 파일 전송)`,
      );
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "운영 서버 동기화 중 오류가 발생했습니다.";
      alert(message);
      setStatus(message);
    } finally {
      setIsSyncingId(null);
    }
  }

  async function handleGeneratePost() {
    const trimmedPrompt = generatePrompt.trim();
    if (!trimmedPrompt) {
      alert("작성할 컬럼 주제를 입력해주세요.");
      return;
    }

    setIsGenerating(true);
    setStatus("AI가 글 초안을 작성하고 있습니다.");

    try {
      const generateResponse = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: trimmedPrompt,
          includeImages,
          imageStyle,
        }),
      });

      const generatedData = (await generateResponse.json()) as GeneratedPostResponse | { error?: string };
      if (!generateResponse.ok || !("content" in generatedData)) {
        throw new Error(("error" in generatedData && generatedData.error) || "글 생성에 실패했습니다.");
      }

      let nextContent = generatedData.content;
      const nextSlug = generatedData.slug;

      setStatus("생성된 글을 저장하고 있습니다.");

      const saveResponse = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: nextSlug,
          content: nextContent,
        }),
      });

      const saveData = (await saveResponse.json()) as { error?: string };
      if (!saveResponse.ok) {
        throw new Error(saveData.error || "글 저장에 실패했습니다.");
      }

      const uploadedReferenceNames: string[] = [];

      if (referenceImages.length > 0) {
        setStatus(`참조 이미지 ${referenceImages.length}장을 업로드하고 있습니다.`);

        for (const referenceImage of referenceImages) {
          const formData = new FormData();
          formData.append("file", referenceImage);

          const assetResponse = await fetch(`/api/posts/${nextSlug}/assets`, {
            method: "POST",
            body: formData,
          });

          const assetData = (await assetResponse.json()) as { fileName?: string; error?: string };
          if (!assetResponse.ok || !assetData.fileName) {
            throw new Error(assetData.error || "참조 이미지 업로드에 실패했습니다.");
          }

          uploadedReferenceNames.push(assetData.fileName);
        }
      }

      if (includeImages && autoGenerateImages) {
        const markdownImages = extractMarkdownImages(nextContent);

        if (markdownImages.length > 0) {
          setStatus(`이미지 ${markdownImages.length}장을 생성하고 있습니다.`);

          for (const markdownImage of markdownImages) {
            const imagePrompt = buildImageGenerationPrompt(
              generatedData.imagePrompt,
              markdownImage.alt,
              imageStyle,
            );

            const imageResponse = await fetch("/api/generate-image", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                prompt: imagePrompt,
                postId: nextSlug,
                caption: markdownImage.alt,
                imageStyle,
                referenceImageNames: uploadedReferenceNames,
              }),
            });

            const imageData = (await imageResponse.json()) as { fileName?: string; error?: string };
            if (!imageResponse.ok || !imageData.fileName) {
              throw new Error(imageData.error || "이미지 생성에 실패했습니다.");
            }

            nextContent = replaceImagePath(nextContent, markdownImage.path, `./${imageData.fileName}`);
          }

          const updateResponse = await fetch(`/api/posts/${nextSlug}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: nextContent,
            }),
          });

          const updateData = (await updateResponse.json()) as { error?: string };
          if (!updateResponse.ok) {
            throw new Error(updateData.error || "이미지 경로 반영에 실패했습니다.");
          }
        }
      }

      setGeneratePrompt("");
      setReferenceImages([]);
      setStatus(`"${nextSlug}" 글 생성이 완료되었습니다.`);
      await fetchPosts(nextSlug);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "글 생성 중 오류가 발생했습니다.");
      setStatus("글 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  }

  const selectedPost = posts.find((post) => post.id === selectedId) ?? null;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7f1_0%,#ffffff_45%,#fffaf7_100%)] text-black">
      <div className="mx-auto flex w-full max-w-[1380px] flex-col gap-6 px-4 py-6 md:px-6 md:py-8 xl:px-8">
        <section className="rounded-[2rem] border border-black/10 bg-white/95 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.05)] md:p-8">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_420px] xl:items-start">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-accent">
                MMA Blog Admin
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
                생성한 글을 정리하고 운영 서버로 넘기는 관리 화면입니다.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-black/65 md:text-base">
                글 생성 후 목록에서 바로 네이버 복사, 삭제, 운영 서버 동기화까지 이어서 처리할 수 있도록
                흐름을 정리했습니다.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-[1.5rem] border border-black/10 bg-black px-5 py-5 text-white">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  Posts
                </div>
                <div className="mt-2 text-3xl font-black">{posts.length}</div>
              </div>
              <div className="rounded-[1.5rem] border border-black/10 bg-[#fcfaf8] px-5 py-5">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
                  Selected
                </div>
                <div className="mt-2 line-clamp-2 text-base font-black leading-6">
                  {selectedPost?.title ?? "선택된 글 없음"}
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-accent/15 bg-[#fff6f3] px-5 py-5 sm:col-span-3 xl:col-span-1">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  Status
                </div>
                <div className="mt-2 text-sm font-semibold leading-6 text-black/75">
                  {status}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.05)] md:p-6">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_420px]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/40">
                Generate Article
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">글과 이미지까지 한 번에 생성</h2>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-black/55">
                주제를 입력하면 새 포스트를 만들고, 원하면 본문의 이미지 자리표시자를 실제 생성 이미지 파일로
                자동 치환합니다. 이제 이상한 추상 이미지보다 기사형 MMA 비주얼이 우선 나오도록 프롬프트가 보강돼
                있습니다.
              </p>

              <label className="mt-6 block">
                <span className="text-sm font-bold text-black/70">주제 프롬프트</span>
                <textarea
                  value={generatePrompt}
                  onChange={(event) => setGeneratePrompt(event.target.value)}
                  placeholder="예: UFC 328 메인 이벤트 분석, 주요 라운드 흐름과 체급 판도 변화까지 포함해서 컬럼 작성"
                  className="mt-3 min-h-[180px] w-full rounded-[1.5rem] border border-black/10 bg-[#fffaf7] px-5 py-4 text-sm leading-7 text-black outline-none transition placeholder:text-black/30 focus:border-accent"
                />
              </label>

              <label className="mt-5 block">
                <span className="text-sm font-bold text-black/70">참조 이미지 업로드</span>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  multiple
                  onChange={(event) => setReferenceImages(Array.from(event.target.files ?? []))}
                  className="mt-3 block w-full rounded-[1.25rem] border border-dashed border-black/15 bg-white px-4 py-4 text-sm text-black/65 file:mr-4 file:rounded-full file:border-0 file:bg-black file:px-4 file:py-2 file:text-sm file:font-bold file:text-white"
                />
                <p className="mt-2 text-xs leading-6 text-black/45">
                  실제 행사 사진, 매치 장면, 선수 사진을 올리면 저장 후 그 이미지를 기준으로 편집/변형 생성합니다.
                </p>
                {referenceImages.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {referenceImages.map((file) => (
                      <span
                        key={`${file.name}-${file.size}`}
                        className="rounded-full border border-black/10 bg-[#fff3ee] px-3 py-1 text-xs font-semibold text-black/65"
                      >
                        {file.name}
                      </span>
                    ))}
                  </div>
                ) : null}
              </label>
            </div>

            <div className="rounded-[1.75rem] border border-black/10 bg-[#fffaf7] p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-black/40">Image Setup</p>
              <div className="mt-4 grid gap-3">
                {IMAGE_STYLE_OPTIONS.map((option) => {
                  const isActive = option.value === imageStyle;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setImageStyle(option.value)}
                      className={`rounded-[1.25rem] border px-4 py-4 text-left transition ${
                        isActive
                          ? "border-accent bg-[#fff1ec] shadow-[0_10px_24px_rgba(211,47,47,0.12)]"
                          : "border-black/10 bg-white hover:border-black/20"
                      }`}
                    >
                      <div className="text-sm font-black text-black">{option.label}</div>
                      <div className="mt-1 text-xs leading-6 text-black/55">{option.description}</div>
                    </button>
                  );
                })}
              </div>

              <label className="mt-5 flex items-start gap-3 rounded-[1.25rem] border border-black/10 bg-white px-4 py-4">
                <input
                  type="checkbox"
                  checked={includeImages}
                  onChange={(event) => setIncludeImages(event.target.checked)}
                  className="mt-1 h-4 w-4 accent-[var(--color-accent,#d32f2f)]"
                />
                <span>
                  <span className="block text-sm font-bold text-black">본문 이미지 포함</span>
                  <span className="mt-1 block text-xs leading-6 text-black/55">
                    글 안에 2~3개의 이미지 자리와 캡션을 함께 생성합니다.
                  </span>
                </span>
              </label>

              <label className="mt-3 flex items-start gap-3 rounded-[1.25rem] border border-black/10 bg-white px-4 py-4">
                <input
                  type="checkbox"
                  checked={autoGenerateImages}
                  onChange={(event) => setAutoGenerateImages(event.target.checked)}
                  disabled={!includeImages}
                  className="mt-1 h-4 w-4 accent-[var(--color-accent,#d32f2f)]"
                />
                <span>
                  <span className="block text-sm font-bold text-black">이미지 자동 생성</span>
                  <span className="mt-1 block text-xs leading-6 text-black/55">
                    저장 직후 이미지 파일을 만들고, 마크다운 경로를 실제 생성 파일명으로 자동 교체합니다.
                  </span>
                </span>
              </label>

              <button
                type="button"
                onClick={() => void handleGeneratePost()}
                disabled={isGenerating}
                className="mt-6 w-full rounded-full bg-black px-5 py-3 text-sm font-black text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isGenerating ? "생성 중..." : "새 글 생성"}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/10 bg-white p-5 shadow-[0_18px_60px_rgba(0,0,0,0.05)] md:p-6">
          <div className="flex flex-col gap-4 border-b border-black/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/40">
                Article List
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">목록 중심 관리</h2>
              <p className="mt-2 text-sm text-black/55">
                글 제목, 카테고리, 날짜를 한눈에 보고 네이버 복사, 운영 서버 동기화, 삭제를 빠르게 처리합니다.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void fetchPosts()}
              className="rounded-full border border-black/10 px-5 py-3 text-sm font-bold transition hover:bg-black hover:text-white"
            >
              {isLoading ? "새로고침 중..." : "목록 새로고침"}
            </button>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2 2xl:grid-cols-3">
            {isLoading ? (
              <div className="rounded-[1.75rem] border border-dashed border-black/15 px-5 py-12 text-center text-sm text-black/50">
                글 목록을 불러오는 중입니다.
              </div>
            ) : posts.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-black/15 px-5 py-12 text-center text-sm text-black/50">
                등록된 글이 없습니다.
              </div>
            ) : (
              posts.map((post) => {
                const isActive = post.id === selectedId;

                return (
                  <article
                    key={post.id}
                    className={`rounded-[1.75rem] border p-5 transition ${
                      isActive
                        ? "border-accent bg-[#fff7f3] shadow-[0_14px_34px_rgba(211,47,47,0.12)]"
                        : "border-black/10 bg-[#fffaf7] hover:border-black/20 hover:bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedId(post.id)}
                      className="w-full text-left"
                    >
                      <div className="text-xs font-bold uppercase tracking-[0.18em] text-accent">
                        {post.category}
                      </div>
                      <h3 className="mt-3 text-2xl font-black leading-8 tracking-tight break-keep">
                        {post.title}
                      </h3>
                      <p className="mt-3 text-sm text-black/45">{post.date}</p>
                      <p className="mt-2 truncate text-sm text-black/55">/{post.id}</p>
                      {post.excerpt ? (
                        <p className="mt-4 line-clamp-3 text-sm leading-6 text-black/60">
                          {post.excerpt}
                        </p>
                      ) : null}
                    </button>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void handleCopy(post)}
                        className="rounded-full border border-accent/20 bg-accent/8 px-4 py-2 text-sm font-bold text-accent transition hover:bg-accent hover:text-white"
                      >
                        {copiedId === post.id ? "복사됨" : "네이버 붙여넣기 복사"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSync(post)}
                        disabled={isSyncingId === post.id}
                        className="rounded-full border border-black/10 bg-black px-4 py-2 text-sm font-bold text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isSyncingId === post.id ? "동기화 중..." : "운영 서버 동기화"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(post)}
                        disabled={isDeletingId === post.id}
                        className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDeletingId === post.id ? "삭제 중..." : "삭제"}
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
