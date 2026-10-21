"use client";

import Image, { type ImageProps } from "next/image";
import { useCallback, useState } from "react";
import { placeholderFor, type PlaceholderKind } from "@/lib/placeholders";

type SafeImageProps = Omit<ImageProps, "src" | "alt" | "onError"> & {
  /** Photo to show. Missing, empty or broken values fall back to an illustration. */
  src?: string | null;
  alt: string;
  /** Which family of illustration to fall back to. */
  kind: PlaceholderKind;
  /** Chooses the same illustration every time for the same record (an id or a name). */
  seed?: string | number;
  /** Extra hint for the fallback, e.g. a tip's icon name. */
  hint?: string | null;
};

/**
 * next/image with a graceful fallback. If the file is missing, empty, or fails
 * to load, a small illustration is shown in its place. Pass either `fill`
 * (inside a sized, relatively positioned parent) or `width` and `height`.
 */
export default function SafeImage({ src, alt, kind, seed = 0, hint, ...rest }: SafeImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const fallback = placeholderFor(kind, seed, hint);
  const useFallback = !src || failedSrc === src;
  const shown = useFallback ? fallback : src;

  // An image can fail before React hydrates, in which case onError never fires.
  // The ref check catches that case.
  const ref = useCallback(
    (img: HTMLImageElement | null) => {
      if (img && src && img.complete && img.naturalWidth === 0) setFailedSrc(src);
    },
    [src],
  );

  return (
    <Image
      {...rest}
      ref={ref}
      src={shown}
      alt={alt}
      unoptimized={useFallback || shown.endsWith(".svg") ? true : rest.unoptimized}
      onError={() => {
        if (src) setFailedSrc(src);
      }}
    />
  );
}
