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
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

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
        alt={alt}
        className={`${className} transition-opacity duration-300 ${isLoaded || hasError ? "opacity-100" : "opacity-0"}`}
        onLoad={(event) => {
          setIsLoaded(true);
          onLoad?.(event);
        }}
        onError={(event) => {
          setHasError(true);
          onError?.(event);
        }}
        {...props}
      />
    </span>
  );
}
