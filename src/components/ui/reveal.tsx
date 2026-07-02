"use client";

/**
 * Scroll-reveal primitives. Wrap any server-rendered content:
 *
 *   <Reveal>...</Reveal>                    — fade-up when scrolled into view
 *   <RevealGroup>{items.map(...)}
 *     <RevealItem>...</RevealItem>
 *   </RevealGroup>                          — staggered children
 */
import { motion } from "framer-motion";
import type { ComponentProps } from "react";
import { fadeUp, staggerContainer, viewportOnce } from "@/lib/animations";

type MotionDivProps = ComponentProps<typeof motion.div>;

export function Reveal({ children, ...props }: MotionDivProps) {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function RevealGroup({ children, ...props }: MotionDivProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={viewportOnce}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Child of RevealGroup — inherits the parent's stagger timing. */
export function RevealItem({ children, ...props }: MotionDivProps) {
  return (
    <motion.div variants={fadeUp} {...props}>
      {children}
    </motion.div>
  );
}
