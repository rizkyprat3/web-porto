import type { Game } from "@/types";

/**
 * Arcade registry — drop a self-contained HTML game into
 * /public/games/<id>/index.html, add an entry here, and it becomes
 * playable at /arcade/<id> inside a sandboxed iframe.
 */
export const games: Game[] = [
  {
    id: "game-fable-5",
    title: "Fable 5",
    genre: "Arcade",
    description:
      "A fast-paced browser arcade game built with vanilla JavaScript — zero dependencies, instant load, 60 FPS.",
    coverImage: "/images/games/fable5-cover.svg",
    entryPath: "/games/game-fable-5/index.html",
    tags: ["Singleplayer", "Keyboard", "High Score"],
    controls: [
      { key: "← / →", action: "Move" },
      { key: "Space", action: "Action / Jump" },
      { key: "R", action: "Restart" },
    ],
    aspectRatio: 16 / 9,
  },
];

/** Look up a game by its route id. */
export function getGameById(id: string): Game | undefined {
  return games.find((g) => g.id === id);
}
