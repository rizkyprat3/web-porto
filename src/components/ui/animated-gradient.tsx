"use client";

/**
 * Ambient animated gradient background.
 * Two blurred radial blobs drifting via CSS transform keyframes —
 * fully GPU-composited, zero JS per frame. Optional mouse parallax
 * moves the blob *containers* with a spring (transform only).
 */
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useCallback } from "react";
import { PixelScene } from "@/components/ui/pixel-scene";
import { cn } from "@/lib/utils";

interface AnimatedGradientProps {
  /** Enable mouse-follow parallax (hero only) */
  parallax?: boolean;
  className?: string;
}

export function AnimatedGradient({ parallax = false, className }: AnimatedGradientProps) {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!parallax) return;
      const rect = e.currentTarget.getBoundingClientRect();
      // Normalized -0.5..0.5, scaled to a gentle ±24px drift
      mx.set(((e.clientX - rect.left) / rect.width - 0.5) * 48);
      my.set(((e.clientY - rect.top) / rect.height - 0.5) * 48);
    },
    [parallax, mx, my],
  );

  return (
    <div
      aria-hidden
      onMouseMove={onMouseMove}
      className={cn("pointer-events-auto absolute inset-0 overflow-hidden", className)}
    >
      {/* Neon world (dark theme): soft drifting gradient blobs + fine grid */}
      <div className="hidden dark:block">
        <motion.div style={{ x: sx, y: sy }} className="absolute inset-0">
          <div className="animate-blob-a absolute -top-32 left-1/4 size-[34rem] rounded-full bg-neon-violet/25 blur-[100px]" />
          <div className="animate-blob-b absolute top-1/3 -right-24 size-[30rem] rounded-full bg-neon-cyan/20 blur-[100px]" />
        </motion.div>
        <div
          className="absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent)",
          }}
        />
      </div>

      {/* 8-bit world (light theme): pixel-art sky, clouds, sun, and ground */}
      <PixelScene className="dark:hidden" />
    </div>
  );
}
