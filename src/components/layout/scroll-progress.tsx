"use client";

/**
 * Top-of-page scroll progress bar.
 * useScroll + scaleX runs entirely on the compositor thread.
 */
import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 140,
    damping: 28,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[60] h-0.5 origin-left bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink"
    />
  );
}
