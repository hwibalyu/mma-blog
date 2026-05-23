"use client";

import { useLinkStatus } from "next/link";

type LinkPendingIndicatorProps = {
  label?: string;
};

export default function LinkPendingIndicator({
  label = "아티클 불러오는 중",
}: LinkPendingIndicatorProps) {
  const { pending } = useLinkStatus();

  return (
    <>
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-10 rounded-[inherit] bg-black/6 transition-opacity duration-150 dark:bg-white/8 ${
          pending ? "opacity-100" : "opacity-0"
        }`}
      />
      <span
        className={`pointer-events-none absolute right-3 top-3 z-20 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/92 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-black shadow-sm transition-all duration-150 dark:border-white/10 dark:bg-black/80 dark:text-white ${
          pending ? "translate-y-0 opacity-100" : "-translate-y-1 opacity-0"
        }`}
        aria-live="polite"
      >
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
        {pending ? label : ""}
      </span>
    </>
  );
}
