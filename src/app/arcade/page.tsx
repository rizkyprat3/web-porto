import type { Metadata } from "next";
import { Gamepad2 } from "lucide-react";
import { Section } from "@/components/ui/section";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { GameCard } from "@/components/arcade/game-card";
import { games } from "@/data/games";

export const metadata: Metadata = {
  title: "Arcade",
  description: "Playable HTML games built by me — play them right in your browser.",
};

export default function ArcadePage() {
  return (
    <div className="pt-16">
      <Section
        eyebrow="Arcade"
        title="Play my games."
        description="Every game here is built by me and runs directly in your browser — no installs, no downloads. Pick one and press play."
      >
        {games.length > 0 ? (
          <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {games.map((game) => (
              <RevealItem key={game.id} className="h-full">
                <GameCard game={game} />
              </RevealItem>
            ))}
          </RevealGroup>
        ) : (
          <div className="glass flex flex-col items-center gap-3 rounded-2xl py-20 text-center">
            <Gamepad2 className="size-10 text-muted-foreground" />
            <p className="text-muted-foreground">New games are loading… check back soon!</p>
          </div>
        )}
      </Section>
    </div>
  );
}
