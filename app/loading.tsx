import HomePostFeedSkeleton from "@/components/home-post-feed-skeleton";

export default function Loading() {
  return (
    <div className="flex flex-col gap-3 py-8 md:gap-8">
      <section className="flex flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div className="h-12 w-64 animate-pulse rounded-2xl bg-black/6 dark:bg-white/8 md:h-16 md:w-96" />
          <div className="h-12 w-56 animate-pulse rounded-2xl bg-black/6 dark:bg-white/8 md:h-16 md:w-80" />
          <div className="h-12 w-48 animate-pulse rounded-2xl bg-black/6 dark:bg-white/8 md:h-16 md:w-72" />
        </div>
        <div className="mt-4 flex max-w-2xl flex-col gap-3">
          <div className="h-6 w-full animate-pulse rounded-2xl bg-black/6 dark:bg-white/8 md:h-7" />
          <div className="h-6 w-4/5 animate-pulse rounded-2xl bg-black/6 dark:bg-white/8 md:h-7" />
        </div>
      </section>
      <HomePostFeedSkeleton />
    </div>
  );
}
