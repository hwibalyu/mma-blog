"use client";

import { useEffect, useState } from "react";
import PostCard from "@/components/post-card";
import type { PostSummary } from "@/lib/data";

const INITIAL_VISIBLE_COUNT = 6;
const LOAD_MORE_COUNT = 6;

type HomePostFeedProps = {
  posts: PostSummary[];
  query?: string;
};

export default function HomePostFeed({ posts, query = "" }: HomePostFeedProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE_COUNT);
  }, [normalizedQuery]);

  const filteredPosts = posts.filter((post) => {
    if (!normalizedQuery) {
      return true;
    }

    const searchableText = [
      post.title,
      post.excerpt,
      post.category,
      post.author,
      ...post.tags,
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedQuery);
  });

  const isSearching = normalizedQuery.length > 0;
  const renderedPosts = isSearching
    ? filteredPosts
    : filteredPosts.slice(0, visibleCount);
  const hasMore = !isSearching && visibleCount < filteredPosts.length;

  return (
    <section className="mt-[3px] flex flex-col gap-8 md:mt-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-accent">
            Latest Dispatch
          </p>
          <h3 className="text-2xl font-black tracking-tight md:text-3xl">
            {isSearching ? "검색된 아티클" : "최신 아티클"}
          </h3>
        </div>
        <p className="text-sm font-medium text-black/45 dark:text-white/45">
          {filteredPosts.length}개의 아티클
          {isSearching ? ` · "${query}" 검색 결과` : ""}
        </p>
      </div>

      {filteredPosts.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-black/10 px-6 py-12 text-center dark:border-white/10">
          <p className="text-xl font-black tracking-tight">검색 결과가 없습니다.</p>
          <p className="mt-3 font-serif text-base leading-relaxed text-black/55 dark:text-white/55">
            다른 선수 이름, 단체명, 태그로 다시 찾아보세요.
          </p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-12">
            {renderedPosts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                imageLoading={index < 2 ? "eager" : "lazy"}
                imageFetchPriority={index < 2 ? "high" : "auto"}
              />
            ))}
          </div>

          {hasMore ? (
            <div className="flex justify-center">
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + LOAD_MORE_COUNT)}
                className="rounded-full border border-black/15 px-6 py-3 text-sm font-black uppercase tracking-[0.18em] text-black transition hover:border-black hover:bg-black hover:text-white dark:border-white/15 dark:text-white dark:hover:border-white dark:hover:bg-white dark:hover:text-black"
              >
                더보기
              </button>
            </div>
          ) : null}
        </>
      )}
    </section>
  );
}
