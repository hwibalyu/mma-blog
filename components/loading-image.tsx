"use client";

import type { ComponentPropsWithoutRef } from "react";
import { useEffect, useRef, useState } from "react";

type LoadingImageProps = ComponentPropsWithoutRef<"img"> & {
  wrapperClassName?: string;
};

export default function LoadingImage({
  wrapperClassName = "",
  className = "",
  onLoad,
  onError,
  alt,
  ...props
}: LoadingImageProps) {
  const imageSrc = typeof props.src === "string" ? props.src : "";
  const imageSrcSet = typeof props.srcSet === "string" ? props.srcSet : undefined;
  const shouldDefer = props.loading === "lazy" && Boolean(imageSrc);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const [shouldLoad, setShouldLoad] = useState(!shouldDefer);
  const [loadedSrc, setLoadedSrc] = useState("");
  const [errorSrc, setErrorSrc] = useState("");
  const isLoaded = loadedSrc === imageSrc;
  const hasError = errorSrc === imageSrc;
  const activeSrc = shouldLoad ? imageSrc : undefined;
  const activeSrcSet = shouldLoad ? imageSrcSet : undefined;

  useEffect(() => {
    if (!shouldDefer || shouldLoad) {
      return;
    }

    const target = wrapperRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "180px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(target);

    return () => observer.disconnect();
  }, [shouldDefer, shouldLoad]);

  return (
    <span ref={wrapperRef} className={`relative block ${wrapperClassName}`}>
      {!isLoaded && !hasError ? (
        <span
          className="pointer-events-none absolute inset-0 animate-pulse bg-black/6 dark:bg-white/8"
          aria-hidden="true"
        />
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={(node) => {
          if (shouldLoad && node?.complete && node.naturalWidth > 0 && loadedSrc !== imageSrc) {
            setLoadedSrc(imageSrc);
          }
        }}
        alt={alt}
        className={`${className} transition-opacity duration-150 ${isLoaded || hasError ? "opacity-100" : "opacity-0"}`}
        onLoad={(event) => {
          setLoadedSrc(imageSrc);
          onLoad?.(event);
        }}
        onError={(event) => {
          setErrorSrc(imageSrc);
          onError?.(event);
        }}
        {...props}
        src={activeSrc}
        srcSet={activeSrcSet}
      />
    </span>
  );
}
