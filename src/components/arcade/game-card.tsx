"use client";

/**
 * Neon arcade game card with tilt, hover glow, and play CTA.
 */
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { TiltCard } from "@/components/ui/tilt-card";
import { hoverLift, tapPress } from "@/lib/animations";
import type { Game } from "@/types";

export function GameCard({ game }: { game: Game }) {
  return (
    <TiltCard>
      <motion.article whileHover={hoverLift} whileTap={tapPress} className="h-full">
        <Link
          href={`/arcade/${game.id}`}
          className="neon-border group flex h-full flex-col overflow-hidden rounded-2xl bg-card/60"
        >
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={game.coverImage}
              alt={game.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            />
            {/* Play overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-background/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
              <span className="flex size-14 items-center justify-center rounded-full border border-neon-cyan bg-background/70 text-neon-cyan">
                <Play className="ml-0.5 size-6" fill="currentColor" />
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold tracking-tight">{game.title}</h3>
              <Badge variant="outline" className="rounded-lg border-neon-pink/40 text-neon-pink">
                {game.genre}
              </Badge>
            </div>
            <p className="mt-2 flex-1 text-sm text-muted-foreground">{game.description}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {game.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="rounded-md text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </Link>
      </motion.article>
    </TiltCard>
  );
}
