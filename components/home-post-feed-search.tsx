"use client";

import { useSearchParams } from "next/navigation";
import HomePostFeed from "@/components/home-post-feed";
import type { PostSummary } from "@/lib/data";

type HomePostFeedSearchProps = {
  posts: PostSummary[];
};

export default function HomePostFeedSearch({ posts }: HomePostFeedSearchProps) {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") ?? "";

  return <HomePostFeed posts={posts} query={query} />;
}
