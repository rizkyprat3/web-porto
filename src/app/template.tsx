"use client";

/**
 * Page transition wrapper. `template.tsx` re-mounts on every route change,
 * so a mount animation here = a transition on every navigation.
 */
import { motion } from "framer-motion";
import { pageTransition } from "@/lib/animations";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={pageTransition} initial="hidden" animate="visible">
      {children}
    </motion.div>
  );
}
