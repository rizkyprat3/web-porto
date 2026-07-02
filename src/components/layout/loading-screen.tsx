"use client";

/**
 * One-shot intro loading screen: brand mark scales in, then the overlay
 * fades away. Shown once per page load, ~1s total, transform/opacity only.
 */
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          aria-hidden
          exit={{ opacity: 0, transition: { duration: 0.45, ease: "easeInOut" } }}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-background"
        >
          <motion.p
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="font-mono text-2xl font-bold"
          >
            <span className="text-gradient">{"<"}RP{" />"}</span>
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
