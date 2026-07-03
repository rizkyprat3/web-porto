/**
 * Pixel-art backdrop for the 8-bit light theme: drifting pixel clouds,
 * a coin-style sun, and a platformer grass/dirt ground strip.
 * Pure SVG + CSS keyframes (transform only) — no JS per frame.
 * Rendered in place of the neon gradient blobs when the light theme is active.
 */
import { cn } from "@/lib/utils";

/** Classic chunky cloud drawn as pixel rows (crisp edges, no anti-aliasing). */
function PixelCloud({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 13 6"
      shapeRendering="crispEdges"
      className={cn("absolute", className)}
      aria-hidden
    >
      {/* soft blue body */}
      <g fill="#cfe4f7">
        <rect x="4" y="0" width="3" height="1" />
        <rect x="2" y="1" width="7" height="1" />
        <rect x="1" y="2" width="10" height="1" />
        <rect x="0" y="3" width="13" height="2" />
      </g>
      {/* bottom shading row */}
      <rect x="0" y="5" width="13" height="1" fill="#a9c9e8" />
    </svg>
  );
}

/** Coin-style pixel sun with darker shading pixels. */
function PixelSun({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 8 8"
      shapeRendering="crispEdges"
      className={cn("absolute", className)}
      aria-hidden
    >
      <g fill="#f2c341">
        <rect x="2" y="0" width="4" height="1" />
        <rect x="1" y="1" width="6" height="1" />
        <rect x="0" y="2" width="8" height="4" />
        <rect x="1" y="6" width="6" height="1" />
        <rect x="2" y="7" width="4" height="1" />
      </g>
      {/* shading (bottom-right) + shine (top-left) */}
      <rect x="5" y="5" width="2" height="1" fill="#d99e2b" />
      <rect x="4" y="6" width="3" height="1" fill="#d99e2b" />
      <rect x="2" y="1" width="2" height="1" fill="#f9e08a" />
      <rect x="1" y="2" width="1" height="2" fill="#f9e08a" />
    </svg>
  );
}

export function PixelScene({
  ground = true,
  className,
}: {
  /** Render the grass/dirt strip at the bottom (hero yes, subtler sections no) */
  ground?: boolean;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      {/* Sky tint, banded rather than smooth for a retro feel */}
      <div
        className="absolute inset-x-0 top-0 h-2/3"
        style={{
          background:
            "linear-gradient(#bcdcf5 0 25%, #cde6f8 25% 55%, #e2f0fb 55% 80%, transparent 80%)",
          opacity: 0.5,
        }}
      />

      <PixelSun className="top-[14%] right-[10%] w-14 sm:w-20" />

      {/* Three clouds drifting across the sky at different speeds */}
      <PixelCloud className="animate-cloud-a top-[18%] w-24 sm:w-32" />
      <PixelCloud className="animate-cloud-b top-[34%] w-16 sm:w-24" />
      <PixelCloud className="animate-cloud-c top-[8%] w-20 sm:w-28" />

      {ground && (
        <div className="absolute inset-x-0 bottom-0">
          {/* grass tiles */}
          <div
            className="h-3"
            style={{
              background:
                "repeating-linear-gradient(90deg, #58b849 0 14px, #4aa03e 14px 28px)",
            }}
          />
          {/* dirt with brick joints */}
          <div
            className="h-6"
            style={{
              backgroundColor: "#a9713f",
              backgroundImage:
                "repeating-linear-gradient(0deg, transparent 0 10px, #8a5a30 10px 12px), repeating-linear-gradient(90deg, transparent 0 26px, #8a5a30 26px 28px)",
            }}
          />
        </div>
      )}
    </div>
  );
}
