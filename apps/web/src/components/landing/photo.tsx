"use client";

import { useEffect, useRef, useState } from "react";
import { Art } from "@/components/dashboard/art";
import type { ArtKey } from "@qschool/shared";

/**
 * A photo that falls back to a branded illustration if the image fails to load
 * (offline, blocked host, or a removed file), so the layout never breaks.
 */
export function Photo({
  src,
  alt,
  className = "",
  imgClassName = "",
  fallbackArt = "bulb",
  eager = false,
  children,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  fallbackArt?: ArtKey;
  eager?: boolean;
  children?: React.ReactNode;
}) {
  const [state, setState] = useState<"loading" | "loaded" | "failed">("loading");
  const img = useRef<HTMLImageElement>(null);

  // The image may have finished (or failed) before React hydrated and attached handlers.
  useEffect(() => {
    const el = img.current;
    if (el && el.complete) setState(el.naturalWidth > 0 ? "loaded" : "failed");
  }, []);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* illustration sits underneath until the photo has loaded */}
      {state !== "loaded" && (
        <div className="absolute inset-0">
          <Art art={fallbackArt} className="h-full w-full" iconSize={40} />
        </div>
      )}
      {state !== "failed" && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={img}
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setState("loaded")}
          onError={() => setState("failed")}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            state === "loaded" ? "opacity-100" : "opacity-0"
          } ${imgClassName}`}
        />
      )}
      {children}
    </div>
  );
}
