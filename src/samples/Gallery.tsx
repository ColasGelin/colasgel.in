"use client";

import { useState } from "react";
import type { SampleSpec } from "@/content/types";
import type { SampleProps } from ".";

type Spec = Extract<SampleSpec, { kind: "gallery" }>;

function FadeImage({
  image,
  onError,
}: {
  image: Spec["images"][number];
  onError: SampleProps["onError"];
}) {
  const [loaded, setLoaded] = useState(false);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      ref={(element) => {
        if (element?.complete && element.naturalWidth > 0) setLoaded(true);
      }}
      onLoad={() => setLoaded(true)}
      onError={() => onError(new Error(`Failed to load ${image.src}`))}
      className={`h-auto w-full rounded border border-line bg-surface transition-opacity duration-300 motion-reduce:transition-none ${
        loaded ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}

export default function Gallery({ spec, onError }: SampleProps<Spec>) {
  return (
    <div className="grid gap-3">
      {spec.images.map((image) => (
        <figure key={image.src}>
          <FadeImage image={image} onError={onError} />
          <figcaption className="mt-1 text-xs text-muted">
            {image.caption}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
