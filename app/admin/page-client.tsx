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
  hidden: boolean;
  displayOrder: number | null;
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

function reorderIds(ids: string[], fromId: string, toId: string) {
  if (fromId === toId) return ids;

  const next = [...ids];
  const fromIndex = next.indexOf(fromId);
  const toIndex = next.indexOf(toId);

  if (fromIndex === -1 || toIndex === -1) {
    return ids;
  }

  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next;
}

export default function AdminDashboardClient({ initialPosts }: AdminDashboardClientProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  const [orderedIds, setOrderedIds] = useState<string[]>(() => initialPosts.map((post) => post.id));
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [editingDateId, setEditingDateId] = useState<string | null>(null);
  const [dateDrafts, setDateDrafts] = useState<Record<string, string>>(
    () => Object.fromEntries(initialPosts.map((post) => [post.id, post.date])) as Record<string, string>,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isSyncingId, setIsSyncingId] = useState<string | null>(null);
  const [isTogglingHiddenId, setIsTogglingHiddenId] = useState<string | null>(null);
  const [isSyncingMainOrder, setIsSyncingMainOrder] = useState(false);
  const [isSavingDateId, setIsSavingDateId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [status, setStatus] = useState(
    initialPosts.length ? "글 목록이 준비되었습니다." : "아직 작성된 글이 없습니다.",
  );

  async function fetchPosts() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/posts", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("글 목록을 불러오지 못했습니다.");
      }

      const data = (await response.json()) as Post[];
      setPosts(data);
      setOrderedIds(data.map((post) => post.id));
      setDateDrafts(Object.fromEntries(data.map((post) => [post.id, post.date])) as Record<string, string>);
      setStatus(data.length ? "글 목록이 갱신되었습니다." : "아직 작성된 글이 없습니다.");
    } catch (error) {
      console.error(error);
      setStatus("글 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveDate(post: Post) {
    const nextDate = (dateDrafts[post.id] ?? "").trim();

    if (!nextDate) {
      alert("날짜는 비워둘 수 없습니다.");
      return;
    }

    if (nextDate === post.date) {
      setEditingDateId(null);
      return;
    }

    setIsSavingDateId(post.id);

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: nextDate,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "날짜 저장에 실패했습니다.");
      }

      setStatus(`"${post.title}" 글의 날짜를 ${nextDate}(으)로 저장했습니다.`);
      setEditingDateId(null);
      await fetchPosts();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : "날짜 저장 중 오류가 발생했습니다.";
      alert(message);
      setStatus(message);
    } finally {
      setIsSavingDateId(null);
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
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || "삭제에 실패했습니다.");
      }

      setStatus(`"${post.title}" 글을 로컬과 운영 서버에서 삭제했습니다.`);
      await fetchPosts();
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
    if (post.hidden) {
      alert("숨김 글은 운영 서버에 동기화할 수 없습니다. 먼저 퍼블리시 상태로 바꿔주세요.");
      return;
    }

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

  async function handleToggleHidden(post: Post) {
    const nextHidden = !post.hidden;
    const actionLabel = nextHidden ? "숨김" : "퍼블리시";
    const shouldProceed = window.confirm(
      nextHidden
        ? `"${post.title}" 글을 숨김 처리할까요?\n로컬과 운영 서버 모두 숨김 상태로 맞춥니다.`
        : `"${post.title}" 글을 퍼블리시 가능 상태로 바꿀까요?\n로컬과 운영 서버 모두 공개 가능 상태로 맞춥니다.`,
    );

    if (!shouldProceed) return;

    setIsTogglingHiddenId(post.id);

    try {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          hidden: nextHidden,
        }),
      });

      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error || `${actionLabel} 처리에 실패했습니다.`);
      }

      const syncResponse = await fetch("/api/admin/inject-post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: post.id }),
      });

      const syncData = (await syncResponse.json()) as { error?: string };
      if (!syncResponse.ok) {
        throw new Error(
          syncData.error ||
            `${actionLabel} 상태는 로컬에 저장됐지만 운영 서버 동기화에는 실패했습니다.`,
        );
      }

      setStatus(
        nextHidden
          ? `"${post.title}" 글을 로컬과 운영 서버 모두 숨김 처리했습니다.`
          : `"${post.title}" 글을 로컬과 운영 서버 모두 퍼블리시 가능 상태로 바꿨습니다.`,
      );
      await fetchPosts();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : `${actionLabel} 처리 중 오류가 발생했습니다.`;
      alert(message);
      setStatus(message);
    } finally {
      setIsTogglingHiddenId(null);
    }
  }

  async function handleSyncMainOrder() {
    if (orderedIds.length === 0) {
      return;
    }

    const shouldSync = window.confirm(
      "현재 드래그 순서를 메인 표시 순서로 저장하고, 퍼블리시된 글을 운영 서버에 순서 동기화할까요?",
    );
    if (!shouldSync) return;

    setIsSyncingMainOrder(true);
    setStatus("메인 표시 순서를 저장하고 운영 서버에 동기화하고 있습니다.");

    try {
      for (const [index, postId] of orderedIds.entries()) {
        const orderResponse = await fetch(`/api/posts/${postId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            displayOrder: index + 1,
          }),
        });

        const orderData = (await orderResponse.json()) as { error?: string };
        if (!orderResponse.ok) {
          throw new Error(orderData.error || "표시 순서 저장에 실패했습니다.");
        }
      }

      for (const postId of orderedIds) {
        const post = posts.find((entry) => entry.id === postId);
        if (!post || post.hidden) {
          continue;
        }

        const syncResponse = await fetch("/api/admin/inject-post", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id: post.id }),
        });

        const syncData = (await syncResponse.json()) as { error?: string };
        if (!syncResponse.ok) {
          throw new Error(syncData.error || `"${post.title}" 글 동기화에 실패했습니다.`);
        }
      }

      setStatus("메인 표시 순서 저장과 운영 서버 동기화가 완료되었습니다.");
      await fetchPosts();
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : "메인 순서 동기화 중 오류가 발생했습니다.";
      alert(message);
      setStatus(message);
    } finally {
      setIsSyncingMainOrder(false);
    }
  }

  const orderedPosts = orderedIds
    .map((id) => posts.find((post) => post.id === id) ?? null)
    .filter((post): post is Post => post !== null);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#fff7f1_0%,#ffffff_45%,#fffaf7_100%)] text-black">
      <div className="mx-auto flex w-full max-w-[1180px] flex-col gap-6 px-4 py-6 md:px-6 md:py-8">
        <section className="rounded-[2rem] border border-black/10 bg-white/95 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.05)] md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-[0.32em] text-accent">
                MMA Blog Admin
              </p>
              <h1 className="mt-3 text-3xl font-black tracking-tight md:text-4xl">
                메인 노출 순서와 퍼블리시 상태를 정리하는 관리 화면입니다.
              </h1>
              <p className="mt-4 max-w-3xl text-sm leading-7 text-black/65 md:text-base">
                생성 패널은 제거했고, 이제는 제목 중심 목록에서 드래그로 순서를 바꾸고 필요한 버튼만 빠르게 처리할 수 있도록 정리했습니다.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
              <div className="rounded-[1.5rem] border border-black/10 bg-black px-5 py-5 text-white">
                <div className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  Posts
                </div>
                <div className="mt-2 text-3xl font-black">{orderedPosts.length}</div>
              </div>
              <div className="rounded-[1.5rem] border border-accent/15 bg-[#fff6f3] px-5 py-5 sm:col-span-2">
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
          <div className="flex flex-col gap-4 border-b border-black/10 pb-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/40">
                Article List
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-tight">목록형 관리</h2>
              <p className="mt-2 text-sm text-black/55">
                드래그로 메인 순서를 바꾸고, 숨김, 복사, 개별 동기화, 삭제를 한 줄에서 바로 처리합니다.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleSyncMainOrder()}
                disabled={isSyncingMainOrder}
                className="rounded-full bg-black px-5 py-3 text-sm font-black text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSyncingMainOrder ? "메인 순서 동기화 중..." : "메인 순서 동기화"}
              </button>
              <button
                type="button"
                onClick={() => void fetchPosts()}
                className="rounded-full border border-black/10 px-5 py-3 text-sm font-bold transition hover:bg-black hover:text-white"
              >
                {isLoading ? "새로고침 중..." : "목록 새로고침"}
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-[1.25rem] border border-dashed border-black/10 bg-[#fffaf7] px-4 py-3 text-xs font-semibold leading-6 text-black/50">
            왼쪽 핸들을 잡고 드래그하면 메인 노출 순서를 바꿀 수 있습니다. 정렬 변경 후 `메인 순서 동기화`를 눌러야 로컬 저장과 운영 서버 반영이 함께 끝납니다.
          </div>

          <div className="mt-6">
            {isLoading ? (
              <div className="rounded-[1.75rem] border border-dashed border-black/15 px-5 py-12 text-center text-sm text-black/50">
                글 목록을 불러오는 중입니다.
              </div>
            ) : orderedPosts.length === 0 ? (
              <div className="rounded-[1.75rem] border border-dashed border-black/15 px-5 py-12 text-center text-sm text-black/50">
                등록된 글이 없습니다.
              </div>
            ) : (
              <ul className="flex flex-col gap-3">
                {orderedPosts.map((post, index) => (
                  <li
                    key={post.id}
                    draggable
                    onDragStart={() => setDraggingId(post.id)}
                    onDragOver={(event) => {
                      event.preventDefault();
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      if (!draggingId) return;
                      setOrderedIds((current) => reorderIds(current, draggingId, post.id));
                      setDraggingId(null);
                    }}
                    onDragEnd={() => setDraggingId(null)}
                    className={`flex flex-col gap-3 rounded-[1.5rem] border px-4 py-4 transition md:flex-row md:items-center md:justify-between ${
                      draggingId === post.id
                        ? "border-accent bg-[#fff1ec] shadow-[0_12px_30px_rgba(211,47,47,0.12)]"
                        : "border-black/10 bg-[#fffaf7] hover:border-black/20 hover:bg-white"
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div
                        className="cursor-grab select-none rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-black text-black/45 active:cursor-grabbing"
                        aria-label={`${post.title} 드래그 핸들`}
                      >
                        ≡
                      </div>
                      <div className="w-8 text-sm font-black text-black/35">{index + 1}</div>
                      <div className="min-w-0">
                        <div className="truncate text-lg font-black text-black">{post.title}</div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-semibold text-black/45">
                          <span>{post.category}</span>
                          {editingDateId === post.id ? (
                            <input
                              type="text"
                              value={dateDrafts[post.id] ?? ""}
                              autoFocus
                              onChange={(event) =>
                                setDateDrafts((current) => ({
                                  ...current,
                                  [post.id]: event.target.value,
                                }))
                              }
                              onBlur={() => void handleSaveDate(post)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  event.preventDefault();
                                  void handleSaveDate(post);
                                }
                                if (event.key === "Escape") {
                                  setDateDrafts((current) => ({
                                    ...current,
                                    [post.id]: post.date,
                                  }));
                                  setEditingDateId(null);
                                }
                              }}
                              className="w-32 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-bold text-black outline-none focus:border-accent"
                            />
                          ) : (
                            <button
                              type="button"
                              onClick={() => setEditingDateId(post.id)}
                              className="rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-bold text-black/55 transition hover:border-accent hover:text-black"
                            >
                              {isSavingDateId === post.id ? "저장 중..." : post.date}
                            </button>
                          )}
                          <span className="truncate">/{post.id}</span>
                        </div>
                      </div>
                      {post.hidden ? (
                        <div className="inline-flex rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">
                          로컬 숨김
                        </div>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <button
                        type="button"
                        onClick={() => void handleCopy(post)}
                        className="rounded-full border border-accent/20 bg-accent/8 px-4 py-2 text-xs font-bold text-accent transition hover:bg-accent hover:text-white"
                      >
                        {copiedId === post.id ? "복사됨" : "네이버 복사"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleToggleHidden(post)}
                        disabled={isTogglingHiddenId === post.id}
                        className={`rounded-full px-4 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                          post.hidden
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white"
                            : "border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-500 hover:text-white"
                        }`}
                      >
                        {isTogglingHiddenId === post.id
                          ? "처리 중..."
                          : post.hidden
                            ? "퍼블리시로 전환"
                            : "숨김"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSync(post)}
                        disabled={isSyncingId === post.id || post.hidden}
                        className="rounded-full border border-black/10 bg-black px-4 py-2 text-xs font-bold text-white transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {post.hidden
                          ? "숨김 글 비공개"
                          : isSyncingId === post.id
                            ? "동기화 중..."
                            : "개별 동기화"}
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(post)}
                        disabled={isDeletingId === post.id}
                        className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-700 transition hover:bg-red-600 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isDeletingId === post.id ? "삭제 중..." : "삭제"}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
