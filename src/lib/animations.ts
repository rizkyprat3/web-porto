/**
 * Shared Framer Motion variants.
 * Constraint: only GPU-friendly properties (transform + opacity) are animated.
 * Full animation library is implemented in Step 5.
 */
import type { Variants } from "framer-motion";

/** Fade up on scroll reveal — the workhorse variant. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

/** Parent container that staggers its children. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
