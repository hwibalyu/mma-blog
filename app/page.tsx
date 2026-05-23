import type { Metadata } from "next";
import { Suspense } from "react";
import HomePostFeedSkeleton from "@/components/home-post-feed-skeleton";
import HomePostFeedSearch from "@/components/home-post-feed-search";
import { getPosts } from "@/lib/data";
import { DEFAULT_SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    absolute: SITE_NAME,
  },
  description: DEFAULT_SITE_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_NAME,
    description: DEFAULT_SITE_DESCRIPTION,
    url: "/",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_SITE_DESCRIPTION,
  },
};

export default function Home() {
  const posts = getPosts();
  return (
    <div className="flex flex-col gap-3 py-8 md:gap-8">
      <section className="flex flex-col gap-4">
        <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-tight break-keep">
          순수하고, <br />
          정제되지 않은 <br />
          <span className="text-accent">종합격투기.</span>
        </h2>
        <p className="mt-4 max-w-2xl break-keep font-serif text-lg leading-relaxed text-black/70 dark:text-white/70 md:text-2xl">
          미니멀하고 타이포그래피가 중심이 되는, 종합격투기(MMA) 세계에 대한 깊이 있는 통찰과 분석을 제공합니다.
        </p>
      </section>
      <Suspense fallback={<HomePostFeedSkeleton />}>
        <HomePostFeedSearch posts={posts} />
      </Suspense>
    </div>
  );
}
