"use client";

import SafeImage from "@/components/SafeImage";
import { isValidImageUrl } from "@/lib/imageUrl";

/** Small preview of a photo link typed in a form. Shows nothing until the link is valid. */
export default function ImagePreview({ value, alt }: { value: string; alt: string }) {
  const url = value.trim();
  if (!isValidImageUrl(url)) return null;
  return (
    <div className="relative mt-2 aspect-[16/9] w-full max-w-xs overflow-hidden rounded-lg border border-line bg-paper-deep">
      <SafeImage key={url} src={url} kind="kitchen" alt={alt} fill sizes="320px" className="object-cover" />
    </div>
  );
}
