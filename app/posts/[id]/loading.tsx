function SkeletonBlock({ className }: { className: string }) {
  return (
    <div
      aria-hidden="true"
      className={`animate-pulse rounded-2xl bg-black/6 dark:bg-white/8 ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <article className="mx-auto flex max-w-3xl flex-col gap-8 py-8 md:py-12">
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-black/35 dark:text-white/35">
          <span>홈</span>
          <span>/</span>
          <span>아티클</span>
        </div>
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-black/5 px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-black/55 dark:border-white/10 dark:bg-white/5 dark:text-white/55">
          <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
          아티클 로딩 중
        </div>
      </div>

      <header className="mb-4 flex flex-col gap-6 border-b border-black/10 pb-8 dark:border-white/10">
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-4 w-20 rounded-full" />
          <SkeletonBlock className="h-2 w-2 rounded-full" />
          <SkeletonBlock className="h-4 w-24 rounded-full" />
        </div>
        <div className="flex flex-col gap-3">
          <SkeletonBlock className="h-12 w-full max-w-2xl" />
          <SkeletonBlock className="h-12 w-4/5 max-w-xl" />
        </div>
        <div className="flex flex-col gap-3">
          <SkeletonBlock className="h-6 w-full max-w-2xl" />
          <SkeletonBlock className="h-6 w-3/4 max-w-lg" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonBlock className="h-4 w-24 rounded-full" />
          <SkeletonBlock className="h-2 w-2 rounded-full" />
          <SkeletonBlock className="h-4 w-28 rounded-full" />
        </div>
        <SkeletonBlock className="aspect-[16/9] w-full rounded-[1.75rem]" />
      </header>

      <div className="flex flex-col gap-5">
        <SkeletonBlock className="h-6 w-full" />
        <SkeletonBlock className="h-6 w-[92%]" />
        <SkeletonBlock className="h-6 w-[96%]" />
        <SkeletonBlock className="h-6 w-[84%]" />
        <SkeletonBlock className="mt-4 h-10 w-56" />
        <SkeletonBlock className="h-6 w-full" />
        <SkeletonBlock className="h-6 w-[88%]" />
        <SkeletonBlock className="h-6 w-[94%]" />
      </div>
    </article>
  );
}
