"use client";

/**
 * Subtle 3D tilt-on-hover, driven by pointer position within the element.
 * rotateX/rotateY are GPU-composited transforms — no layout or paint cost.
 * Desktop-pointer only (mouse events simply don't fire meaningfully on touch).
 */
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const TILT_DEGREES = 6;

export function TiltCard({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(py, [0, 1], [TILT_DEGREES, -TILT_DEGREES]), {
    stiffness: 300,
    damping: 30,
  });
  const rotateY = useSpring(useTransform(px, [0, 1], [-TILT_DEGREES, TILT_DEGREES]), {
    stiffness: 300,
    damping: 30,
  });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  }

  function onMouseLeave() {
    px.set(0.5);
    py.set(0.5);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className={cn("h-full", className)}
    >
      {children}
    </motion.div>
  );
}
