/**
 * Shared Framer Motion animation library.
 *
 * Performance contract (enforced by convention across the whole site):
 * only `transform` (x/y/scale/rotate) and `opacity` are ever animated —
 * both are GPU-composited and never trigger layout or paint.
 */
import type { Transition, Variants } from "framer-motion";

/** Signature easing — fast start, long elegant settle (cinematic feel). */
export const easeOutExpo = [0.22, 1, 0.36, 1] as const;

export const springSnappy: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 24,
};

/* ── Scroll reveals ───────────────────────────────────────── */

/** Fade up on scroll reveal — the workhorse variant. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easeOutExpo },
  },
};

/** Simple fade, for elements that should not move. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.7, ease: "easeOut" } },
};

/** Scale-in for cards and media. */
export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.94 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, ease: easeOutExpo },
  },
};

/** Parent container that staggers its children. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

/* ── Hero ─────────────────────────────────────────────────── */

/** Word-by-word headline reveal (used with staggerContainer parent). */
export const headlineWord: Variants = {
  hidden: { opacity: 0, y: "0.6em" },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: easeOutExpo },
  },
};

/* ── Page transitions ─────────────────────────────────────── */

export const pageTransition: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: easeOutExpo },
  },
};

/* ── Hover (imperative props, not variants) ───────────────── */

/** Card hover lift — pass to `whileHover`. */
export const hoverLift = { y: -6, scale: 1.015 };

/** Subtle press feedback — pass to `whileTap`. */
export const tapPress = { scale: 0.98 };

/** Default viewport config for scroll reveals: trigger once, slightly early. */
export const viewportOnce = { once: true, margin: "-80px" } as const;
