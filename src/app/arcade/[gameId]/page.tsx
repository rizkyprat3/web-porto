import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Keyboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Reveal } from "@/components/ui/reveal";
import { GamePlayer } from "@/components/arcade/game-player";
import { games, getGameById } from "@/data/games";

interface GamePageProps {
  params: Promise<{ gameId: string }>;
}

/** Pre-render every game page at build time. */
export function generateStaticParams() {
  return games.map((g) => ({ gameId: g.id }));
}

export async function generateMetadata({ params }: GamePageProps): Promise<Metadata> {
  const { gameId } = await params;
  const game = getGameById(gameId);
  if (!game) return {};
  return {
    title: `${game.title} — Arcade`,
    description: game.description,
  };
}

export default async function GameDetailPage({ params }: GamePageProps) {
  const { gameId } = await params;
  const game = getGameById(gameId);
  if (!game) notFound();

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pt-28 pb-20 sm:px-6">
      <Reveal>
        <Link
          href="/arcade"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> Back to arcade
        </Link>

        <div className="mb-8 flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{game.title}</h1>
          <Badge variant="outline" className="rounded-lg border-neon-pink/40 text-neon-pink">
            {game.genre}
          </Badge>
        </div>
      </Reveal>

      <Reveal>
        <GamePlayer game={game} />
      </Reveal>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        <Reveal className="md:col-span-2">
          <h2 className="text-xl font-semibold tracking-tight">About this game</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground">{game.description}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {game.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-md text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </Reveal>

        <Reveal>
          <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight">
            <Keyboard className="size-5 text-neon-cyan" /> Controls
          </h2>
          <ul className="mt-4 space-y-2.5">
            {game.controls.map(({ key, action }) => (
              <li key={key} className="flex items-center justify-between gap-3 text-sm">
                <kbd className="glass rounded-lg px-2.5 py-1 font-mono text-xs text-neon-cyan">
                  {key}
                </kbd>
                <span className="text-muted-foreground">{action}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </div>
  );
}
