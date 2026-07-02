"use client";

/**
 * Full-screen hero: word-by-word headline reveal, typing subtitle,
 * CTA buttons, animated gradient blobs with mouse parallax.
 */
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Gamepad2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import { Magnetic } from "@/components/ui/magnetic";
import { Counter } from "@/components/ui/counter";
import { cn } from "@/lib/utils";
import { TypingText } from "@/components/ui/typing-text";
import { headlineWord, staggerContainer } from "@/lib/animations";
import { siteConfig } from "@/data/site";
import { projects } from "@/data/projects";
import { games } from "@/data/games";
import { achievements } from "@/data/achievements";

const STATS = [
  { label: "Projects Shipped", value: projects.length },
  { label: "Playable Games", value: games.length },
  { label: "Milestones", value: achievements.length },
];

const HEADLINE = ["Crafting", "intelligent,", "playable,"];
const HEADLINE_ACCENT = ["beautiful", "software."];

const TYPING_PHRASES = [
  "Game Developer",
  "AI & Forecasting Enthusiast",
  "Data Analyst",
  "Web Developer",
  "Researcher",
];

export function Hero() {
  return (
    <section className="relative flex min-h-svh items-center overflow-hidden">
      <AnimatedGradient parallax />

      <div className="relative mx-auto w-full max-w-6xl px-4 pt-24 pb-16 sm:px-6">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible">
          <motion.p
            variants={headlineWord}
            className="mb-5 font-mono text-sm tracking-widest text-neon-cyan uppercase"
          >
            {siteConfig.name} — {siteConfig.role}
          </motion.p>

          <h1 className="max-w-4xl text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl">
            {HEADLINE.map((word) => (
              <motion.span
                key={word}
                variants={headlineWord}
                className="mr-[0.28em] inline-block"
              >
                {word}
              </motion.span>
            ))}
            {HEADLINE_ACCENT.map((word) => (
              <motion.span
                key={word}
                variants={headlineWord}
                className="text-gradient mr-[0.28em] inline-block"
              >
                {word}
              </motion.span>
            ))}
          </h1>

          <motion.p
            variants={headlineWord}
            className="mt-6 min-h-8 text-lg text-muted-foreground sm:text-xl"
          >
            <TypingText phrases={TYPING_PHRASES} />
          </motion.p>

          <motion.div variants={headlineWord} className="mt-10 flex flex-wrap gap-3">
            <Magnetic>
              <Link
                href="/projects"
                className={cn(buttonVariants({ size: "lg" }), "group h-11 rounded-xl px-5")}
              >
                Explore Projects
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                href="/arcade"
                className={cn(
                  buttonVariants({ size: "lg", variant: "outline" }),
                  "h-11 rounded-xl px-5",
                )}
              >
                <Gamepad2 className="size-4" />
                Play My Games
              </Link>
            </Magnetic>
          </motion.div>

          <motion.div
            variants={headlineWord}
            className="mt-14 flex flex-wrap gap-x-10 gap-y-4 border-t border-border/60 pt-8"
          >
            {STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-gradient font-heading text-3xl font-semibold">
                  <Counter value={stat.value} />+
                </p>
                <p className="mt-1 text-xs tracking-wide text-muted-foreground uppercase">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <motion.div
        aria-hidden
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          className="h-9 w-5 rounded-full border border-border p-1"
        >
          <div className="mx-auto h-2 w-1 rounded-full bg-neon-cyan" />
        </motion.div>
      </motion.div>
    </section>
  );
}
