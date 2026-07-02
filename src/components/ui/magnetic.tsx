"use client";

/**
 * Wraps interactive content (typically a CTA button) so it drifts a few
 * pixels toward the cursor on hover — a small, restrained "magnetic"
 * micro-interaction. Transform-only, spring-damped.
 */
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useRef } from "react";

const RANGE = 14;

export function Magnetic({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 15, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 15, mass: 0.4 });

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(((e.clientX - rect.left) / rect.width - 0.5) * RANGE * 2);
    y.set(((e.clientY - rect.top) / rect.height - 0.5) * RANGE * 2);
  }

  function onMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ x: sx, y: sy }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}
