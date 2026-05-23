function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-2xl bg-black/6 dark:bg-white/8 ${className}`}
    />
  );
}

function PostCardSkeleton() {
  return (
    <article className="grid grid-cols-[88px_minmax(0,1fr)] gap-x-4 gap-y-3 md:grid-cols-[220px_minmax(0,1fr)] md:gap-5 md:items-start">
      <SkeletonBlock className="row-span-2 aspect-square w-full md:row-span-3 md:aspect-[4/3]" />
      <div className="flex min-w-0 flex-col gap-3">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-4 w-16 rounded-full" />
          <SkeletonBlock className="h-1 w-1 rounded-full" />
          <SkeletonBlock className="h-4 w-20 rounded-full" />
        </div>
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="h-7 w-full max-w-xl md:h-9" />
          <SkeletonBlock className="h-7 w-3/4 max-w-md md:h-9" />
        </div>
      </div>
      <div className="col-span-2 flex flex-col gap-2 md:col-auto">
        <SkeletonBlock className="h-5 w-full max-w-2xl" />
        <SkeletonBlock className="h-5 w-5/6 max-w-xl" />
      </div>
      <div className="col-span-2 flex gap-2 md:col-auto">
        <SkeletonBlock className="h-6 w-14 rounded-md" />
        <SkeletonBlock className="h-6 w-16 rounded-md" />
        <SkeletonBlock className="h-6 w-12 rounded-md" />
      </div>
    </article>
  );
}

export default function HomePostFeedSkeleton() {
  return (
    <section className="mt-[3px] flex flex-col gap-8 md:mt-2">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <SkeletonBlock className="h-4 w-36 rounded-full" />
          <SkeletonBlock className="h-8 w-40" />
        </div>
        <SkeletonBlock className="h-5 w-24 rounded-full" />
      </div>

      <div className="flex flex-col gap-12">
        <PostCardSkeleton />
        <PostCardSkeleton />
        <PostCardSkeleton />
      </div>
    </section>
  );
}
