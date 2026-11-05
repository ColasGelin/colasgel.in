"use client";

import type { SampleSpec } from "@/content/types";
import type { SampleProps } from ".";

export default function Gallery({
  spec,
  onError,
}: SampleProps<Extract<SampleSpec, { kind: "gallery" }>>) {
  return (
    <div className="grid gap-3">
      {spec.images.map((image) => (
        <figure key={image.src}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.src}
            alt={image.alt}
            onError={() => onError(new Error(`Failed to load ${image.src}`))}
            className="w-full rounded border border-line"
          />
          <figcaption className="mt-1 text-xs text-muted">
            {image.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
