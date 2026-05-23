"use client";

import {
  type CompositionEvent,
  type FormEvent,
  type KeyboardEvent,
  useRef,
  useState,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function HeaderSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const currentQuery = searchParams.get("q") ?? "";
  const [isOpen, setIsOpen] = useState(Boolean(currentQuery));
  const [draft, setDraft] = useState(currentQuery);
  const [isComposing, setIsComposing] = useState(false);

  function commitSearch(value: string) {
    const nextQuery = value.trim();
    const params = new URLSearchParams(searchParams.toString());

    if (nextQuery) {
      params.set("q", nextQuery);
    } else {
      params.delete("q");
    }

    const nextPath = "/";
    const nextUrl = params.toString() ? `${nextPath}?${params.toString()}` : nextPath;
    router.replace(nextUrl, { scroll: false });
  }

  function handleSubmit(event?: FormEvent<HTMLFormElement>) {
    event?.preventDefault();
    commitSearch(draft);
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {isOpen ? (
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2"
          role="search"
          aria-label="기사 검색"
        >
          <input
            ref={inputRef}
            type="search"
            value={draft}
            onChange={(event) => {
              const nextValue = event.target.value;
              setDraft(nextValue);

              if (!isComposing && pathname === "/") {
                commitSearch(nextValue);
              }
            }}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={(event: CompositionEvent<HTMLInputElement>) => {
              const nextValue = event.currentTarget.value;
              setIsComposing(false);
              setDraft(nextValue);

              if (pathname === "/") {
                commitSearch(nextValue);
              }
            }}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
              if (event.key === "Escape") {
                setDraft("");
                setIsOpen(false);
                commitSearch("");
              }
              if (event.key === "Enter" && pathname !== "/") {
                handleSubmit();
              }
            }}
            placeholder="기사 검색"
            className="h-10 w-[min(52vw,16rem)] rounded-full border border-black/10 bg-white px-4 text-sm font-medium text-black outline-none transition focus:border-black/30 dark:border-white/10 dark:bg-black dark:text-white dark:focus:border-white/30"
          />
          {draft ? (
            <button
              type="button"
              onClick={() => {
                setDraft("");
                commitSearch("");
              }}
              className="text-sm font-bold text-black/40 transition hover:text-black dark:text-white/40 dark:hover:text-white"
              aria-label="검색어 지우기"
            >
              닫기
            </button>
          ) : null}
        </form>
      ) : null}

      <button
        type="button"
        onClick={() => {
          if (isOpen && !draft) {
            setIsOpen(false);
            if (currentQuery) {
              commitSearch("");
            }
            return;
          }

          setIsOpen(true);
          queueMicrotask(() => {
            inputRef.current?.focus();
          });
        }}
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 text-black/55 transition hover:border-black hover:text-black dark:border-white/10 dark:text-white/55 dark:hover:border-white dark:hover:text-white"
        aria-label="검색 열기"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
      </button>
    </div>
  );
}
