/**
 * Central type definitions for all portfolio content.
 * Every data file in `src/data/` must conform to these shapes,
 * so adding new content is type-checked and UI-agnostic.
 */

/* ── Projects ─────────────────────────────────────────────── */

export const PROJECT_CATEGORIES = [
  "AI",
  "Game Development",
  "Research",
  "Web Development",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export type ProjectStatus = "completed" | "in-progress" | "planned";

export interface ProjectLink {
  /** Live demo URL (optional) */
  demo?: string;
  /** GitHub repository URL (optional) */
  github?: string;
}

export interface Project {
  /** URL segment, e.g. "food-security-forecasting" */
  slug: string;
  title: string;
  /** Short description shown on cards (1–2 sentences) */
  description: string;
  category: ProjectCategory;
  techStack: string[];
  status: ProjectStatus;
  /** Path under /public, e.g. "/images/projects/foo.jpg" */
  thumbnail: string;
  /** ISO date used for sorting, e.g. "2026-05-01" */
  date: string;
  /** Highlighted on the home page when true */
  featured?: boolean;

  /* Detail page content */
  longDescription: string;
  problemStatement: string;
  developmentProcess: string[];
  challenges: string[];
  solutions: string[];
  screenshots: string[];
  links: ProjectLink;
}

/* ── Arcade / Games ───────────────────────────────────────── */

export type GameGenre =
  | "Action"
  | "Puzzle"
  | "Arcade"
  | "Platformer"
  | "Strategy"
  | "Casual";

export interface Game {
  /** URL segment and folder name under /public/games */
  id: string;
  title: string;
  genre: GameGenre;
  description: string;
  /** Path under /public, e.g. "/images/games/cover.jpg" */
  coverImage: string;
  /** Entry point served from /public, e.g. "/games/game-fable-5/index.html" */
  entryPath: string;
  /** Category tags shown on the card, e.g. ["Singleplayer", "Keyboard"] */
  tags: string[];
  /** Keyboard/mouse/touch instructions rendered on the detail page */
  controls: { key: string; action: string }[];
  /** Preferred aspect ratio of the playfield (width / height) */
  aspectRatio: number;
}

/* ── Achievements ─────────────────────────────────────────── */

export type AchievementType =
  | "competition"
  | "award"
  | "certification"
  | "academic";

export interface Achievement {
  id: string;
  title: string;
  type: AchievementType;
  /** Issuing organization / event host */
  organization: string;
  /** ISO date, e.g. "2026-06-01" — timeline is sorted by this */
  date: string;
  description: string;
  /** Visually emphasized on the timeline when true */
  highlight?: boolean;
}

/* ── About / Skills ───────────────────────────────────────── */

export interface Skill {
  name: string;
  /** Grouping shown in the skills grid */
  group: "Languages" | "AI & Data" | "Game Dev" | "Web" | "Tools";
}

export interface JourneyMilestone {
  /** e.g. "2023" */
  period: string;
  title: string;
  description: string;
}

/* ── Site-wide config ─────────────────────────────────────── */

export interface SiteConfig {
  name: string;
  role: string;
  tagline: string;
  description: string;
  url: string;
  email: string;
  links: {
    github: string;
    linkedin: string;
  };
  /** Path under /public for the About section portrait, e.g. "/images/profile.jpg" */
  profileImage: string;
  /** Short caption badge overlaid on the About photo, e.g. "Building in Medan, Indonesia" */
  profileCaption: string;
}
