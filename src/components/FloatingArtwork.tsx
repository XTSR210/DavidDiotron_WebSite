import Image from "next/image";
import type { CSSProperties } from "react";
import type { Artwork } from "@/lib/types";

interface FloatingArtworkProps {
  artwork: Artwork;
  /** Animation flavor: gentle bob (float) or slower sway (drift). */
  variant?: "float" | "drift";
  /** Positioning/size classes for the hero collage. */
  className?: string;
  /** Animation duration in seconds. */
  duration?: number;
  /** Static tilt in degrees — applied permanently via the CSS `rotate` property. */
  tilt?: number;
  /** Stagger before the pop-in, in seconds. */
  delay?: number;
  priority?: boolean;
}

/**
 * A floating, tilted artwork card used in the animated hero collage.
 * The whole card (frame, image and caption) bobs up and down together, so the
 * artwork always fills the frame edge to edge — no gap inside the border.
 * The tilt is a static `rotate` property, independent from the animation.
 */
export function FloatingArtwork({
  artwork,
  variant = "float",
  className = "",
  duration = 6,
  tilt = 0,
  delay = 0,
  priority = false,
}: FloatingArtworkProps) {
  const style: CSSProperties & Record<string, string> = {
    "--dur": `${duration}s`,
    rotate: `${tilt}deg`,
    animationDelay: `${delay}s`,
  };

  return (
    <figure
      className={`float-shadow relative aspect-[3/4] overflow-hidden rounded-xl border border-white/15 bg-white/5 ${
        variant === "float" ? "float-art" : "drift-art"
      } ${className}`}
      style={style}
    >
      <Image
        src={artwork.image}
        alt={artwork.title}
        width={400}
        height={600}
        priority={priority}
        className="h-full w-full object-cover"
      />
      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-xs text-white/90">
        {artwork.title}
      </figcaption>
    </figure>
  );
}
