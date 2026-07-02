"use client";

/**
 * Sandboxed game player.
 *
 * Security model:
 * - `sandbox="allow-scripts allow-pointer-lock"` WITHOUT `allow-same-origin`
 *   gives the game an opaque origin: its scripts run, but it cannot read
 *   cookies/localStorage of the site, access the parent DOM, or navigate us.
 * - Fullscreen is requested on the wrapper from the parent page, so the
 *   iframe itself needs no extra permissions.
 * - CSP `frame-src 'self'` guarantees only our own /games/* can be embedded.
 */
import { useCallback, useRef, useState } from "react";
import { Loader2, Maximize, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Game } from "@/types";

export function GamePlayer({ game }: { game: Game }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  // Changing the key forces a full iframe reload → clean restart
  const [session, setSession] = useState(0);

  const restart = useCallback(() => {
    setLoading(true);
    setSession((s) => s + 1);
  }, []);

  const fullscreen = useCallback(() => {
    wrapperRef.current?.requestFullscreen?.().catch(() => {
      /* fullscreen denied — non-fatal */
    });
  }, []);

  return (
    <div>
      <div
        ref={wrapperRef}
        className="neon-border relative w-full overflow-hidden rounded-2xl bg-black"
        style={{ aspectRatio: game.aspectRatio }}
      >
        {loading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-background">
            <Loader2 className="size-8 animate-spin text-neon-cyan" />
            <p className="font-mono text-sm text-muted-foreground">
              Loading {game.title}…
            </p>
          </div>
        )}
        <iframe
          key={session}
          src={game.entryPath}
          title={game.title}
          sandbox="allow-scripts allow-pointer-lock"
          loading="lazy"
          onLoad={() => setLoading(false)}
          className="absolute inset-0 size-full border-0"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={fullscreen} variant="outline" className="rounded-xl">
          <Maximize className="size-4" />
          Fullscreen
        </Button>
        <Button onClick={restart} variant="outline" className="rounded-xl">
          <RotateCcw className="size-4" />
          Restart
        </Button>
      </div>
    </div>
  );
}
