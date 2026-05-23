"use client";

import type { ComponentPropsWithoutRef } from "react";
import { useState } from "react";

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
  const [loadedSrc, setLoadedSrc] = useState("");
  const [errorSrc, setErrorSrc] = useState("");
  const isLoaded = loadedSrc === imageSrc;
  const hasError = errorSrc === imageSrc;

  return (
    <span className={`relative block ${wrapperClassName}`}>
      {!isLoaded && !hasError ? (
        <span
          className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/5"
          aria-hidden="true"
        >
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-black/15 border-t-accent dark:border-white/15" />
        </span>
      ) : null}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={(node) => {
          if (node?.complete && node.naturalWidth > 0 && loadedSrc !== imageSrc) {
            setLoadedSrc(imageSrc);
          }
        }}
        alt={alt}
        className={`${className} transition-opacity duration-300 ${isLoaded || hasError ? "opacity-100" : "opacity-0"}`}
        onLoad={(event) => {
          setLoadedSrc(imageSrc);
          onLoad?.(event);
        }}
        onError={(event) => {
          setErrorSrc(imageSrc);
          onError?.(event);
        }}
        {...props}
      />
    </span>
  );
}
