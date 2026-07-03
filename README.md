# Rizki Pratama — Portfolio

Personal portfolio with a playable HTML game arcade, built to feel like two game worlds:

- 🌙 **Dark mode** — futuristic neon: glassmorphism, cyan/violet glow, cinematic reveals
- 🎮 **Light mode** — 8-bit retro world: pixel font, sprite shadows, drifting pixel clouds, platformer ground

**Stack:** Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · shadcn/ui · Zod

## Quick start

```bash
npm install
npm run dev   # http://localhost:3000
```

## Pages

| Route | Description |
|---|---|
| `/` | Hero, About (photo + skills + journey), featured projects |
| `/projects` | Filterable & searchable project grid |
| `/projects/[slug]` | Full case study per project |
| `/arcade` | Playable HTML games in sandboxed iframes |
| `/arcade/[gameId]` | Embedded game + fullscreen/restart + controls guide |
| `/achievements` | Animated timeline |
| `/contact` | Validated, rate-limited contact form |

## Editing content

All content lives in typed data files — no component changes needed:

- `src/data/site.ts` — identity, links, profile photo
- `src/data/projects.ts` — projects (auto-generates detail pages)
- `src/data/games.ts` — arcade games (drop a folder in `public/games/` + one entry)
- `src/data/achievements.ts`, `src/data/skills.ts`

**📘 Full guide (Bahasa Indonesia): [PANDUAN.md](./PANDUAN.md)**

## Security

CSP + security headers, sandboxed game iframes (`allow-scripts`, opaque origin), Zod server validation, honeypot + per-IP rate limiting, secrets in server-side env vars only.
