"use client";

import { useEffect, useState } from "react";
import LoadingImage from "@/components/loading-image";

type PostImageLightboxProps = {
  src: string;
  alt: string;
  loading?: "eager" | "lazy";
};

export default function PostImageLightbox({ src, alt, loading = "lazy" }: PostImageLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="group relative inline-block max-w-full cursor-zoom-in transition-transform hover:scale-[1.01]"
        aria-label={`${alt} 이미지 크게 보기`}
      >
        <LoadingImage
          src={src}
          alt={alt}
          loading={loading}
          decoding="async"
          wrapperClassName="max-w-full overflow-hidden rounded-xl"
          className="block max-h-[600px] w-auto max-w-full rounded-xl object-contain"
        />
        <span className="pointer-events-none absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-bold tracking-wide text-white opacity-0 transition-opacity group-hover:opacity-100">
          CLICK TO EXPAND
        </span>
      </button>

      {isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/90 p-4 md:p-8"
          aria-label="확대 이미지 닫기"
        >
          <span
            className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm font-bold tracking-wide text-white md:right-6 md:top-6"
          >
            ESC
          </span>
          <span
            className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-sm font-medium text-white/80"
          >
            화면 아무 곳이나 클릭해 닫기
          </span>
          <span
            className="max-h-full max-w-6xl cursor-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <LoadingImage
              src={src}
              alt={alt}
              wrapperClassName="overflow-hidden rounded-2xl"
              className="max-h-[82vh] w-auto max-w-full rounded-2xl object-contain shadow-2xl"
            />
            {alt && (
              <span className="mt-4 block text-center text-sm font-medium text-white/80">
                {alt}
              </span>
            )}
          </span>
        </button>
      )}
    </>
  );
}
