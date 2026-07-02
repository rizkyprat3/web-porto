"use client";

/**
 * Interactive achievements timeline — alternating sides on desktop,
 * single rail on mobile, staggered reveal per entry.
 */
import { motion } from "framer-motion";
import { Award, GraduationCap, Medal, Trophy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { fadeUp, viewportOnce } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { Achievement, AchievementType } from "@/types";

const TYPE_META: Record<
  AchievementType,
  { label: string; icon: typeof Trophy; badge: string }
> = {
  competition: {
    label: "Competition",
    icon: Trophy,
    badge: "border-neon-cyan/40 text-neon-cyan",
  },
  award: { label: "Award", icon: Medal, badge: "border-neon-pink/40 text-neon-pink" },
  certification: {
    label: "Certification",
    icon: Award,
    badge: "border-neon-violet/40 text-neon-violet",
  },
  academic: {
    label: "Academic",
    icon: GraduationCap,
    badge: "border-emerald-500/40 text-emerald-600 dark:border-emerald-400/40 dark:text-emerald-300",
  },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long" });
}

export function AchievementsTimeline({ items }: { items: Achievement[] }) {
  return (
    <div className="relative">
      {/* Center rail (left rail on mobile) */}
      <div
        aria-hidden
        className="absolute top-0 bottom-0 left-4 w-px bg-gradient-to-b from-neon-cyan/60 via-neon-violet/40 to-transparent md:left-1/2"
      />

      <ol className="space-y-10">
        {items.map((item, i) => {
          const meta = TYPE_META[item.type];
          const Icon = meta.icon;
          const left = i % 2 === 0; // desktop alternation

          return (
            <motion.li
              key={item.id}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={viewportOnce}
              className={cn(
                "relative pl-12 md:w-1/2 md:pl-0",
                left ? "md:pr-12" : "md:ml-auto md:pl-12",
              )}
            >
              {/* Node */}
              <span
                aria-hidden
                className={cn(
                  "absolute top-1 left-4 flex size-8 -translate-x-1/2 items-center justify-center rounded-full border bg-background",
                  item.highlight
                    ? "border-neon-cyan text-neon-cyan shadow-[0_0_14px] shadow-neon-cyan/40"
                    : "border-border text-muted-foreground",
                  left ? "md:left-full" : "md:left-0",
                )}
              >
                <Icon className="size-4" />
              </span>

              <div
                className={cn(
                  "glass rounded-2xl p-5",
                  item.highlight && "neon-border",
                  left && "md:text-right",
                )}
              >
                <div
                  className={cn(
                    "flex flex-wrap items-center gap-2",
                    left && "md:justify-end",
                  )}
                >
                  <Badge variant="outline" className={cn("rounded-lg", meta.badge)}>
                    {meta.label}
                  </Badge>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formatDate(item.date)}
                  </span>
                </div>
                <h3 className="mt-3 font-semibold tracking-tight">{item.title}</h3>
                <p className="mt-0.5 text-sm text-neon-cyan/90">{item.organization}</p>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
