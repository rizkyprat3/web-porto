import type { ProjectCategory } from "@/types";

/**
 * Per-category accent so project cards and filter pills read as
 * color-coded at a glance instead of one uniform accent everywhere.
 * Each entry provides light- and dark-mode-safe Tailwind classes.
 */
export const categoryColor: Record<
  ProjectCategory,
  { text: string; border: string; hoverBorder: string; bg: string }
> = {
  AI: {
    text: "text-neon-violet",
    border: "border-neon-violet/40",
    hoverBorder: "hover:border-neon-violet/40",
    bg: "bg-neon-violet/10",
  },
  "Game Development": {
    text: "text-neon-pink",
    border: "border-neon-pink/40",
    hoverBorder: "hover:border-neon-pink/40",
    bg: "bg-neon-pink/10",
  },
  Research: {
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/40 dark:border-emerald-400/40",
    hoverBorder: "hover:border-emerald-500/40 dark:hover:border-emerald-400/40",
    bg: "bg-emerald-500/10 dark:bg-emerald-400/10",
  },
  "Web Development": {
    text: "text-neon-cyan",
    border: "border-neon-cyan/40",
    hoverBorder: "hover:border-neon-cyan/40",
    bg: "bg-neon-cyan/10",
  },
};
