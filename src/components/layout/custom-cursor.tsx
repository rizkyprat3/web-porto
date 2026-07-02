"use client";

/**
 * Custom cursor: a small dot + trailing ring, desktop-pointer devices only.
 * Motion values bypass React re-renders — position updates never touch the
 * virtual DOM, keeping the cursor at native frame rate.
 */
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

export function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 300, damping: 30, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 300, damping: 30, mass: 0.6 });
  const [hoveringLink, setHoveringLink] = useState(false);

  useEffect(() => {
    // Only on devices with a fine pointer and no reduced-motion preference
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    setEnabled(true);

    const onMove = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      const target = e.target as HTMLElement;
      setHoveringLink(!!target.closest("a, button, [role='button']"));
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [x, y]);

  if (!enabled) return null;

  return (
    <>
      {/* Dot — follows instantly */}
      <motion.div
        aria-hidden
        style={{ x, y }}
        className="pointer-events-none fixed top-0 left-0 z-[70] size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neon-cyan"
      />
      {/* Ring — trails with a spring; grows over interactive elements */}
      <motion.div
        aria-hidden
        style={{ x: ringX, y: ringY }}
        animate={{ scale: hoveringLink ? 1.8 : 1, opacity: hoveringLink ? 0.9 : 0.5 }}
        transition={{ duration: 0.2 }}
        className="pointer-events-none fixed top-0 left-0 z-[70] size-8 -translate-x-1/2 -translate-y-1/2 rounded-full border border-neon-cyan/60"
      />
    </>
  );
}
