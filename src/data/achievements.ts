import type { Achievement } from "@/types";

/**
 * Achievement timeline — rendered newest-first on /achievements.
 * Set `highlight: true` for milestones that deserve visual emphasis.
 */
export const achievements: Achievement[] = [
  {
    id: "satria-data-2026",
    title: "SEC SATRIA DATA 2026 — National Finalist",
    type: "competition",
    organization: "Kemdikbudristek / SATRIA DATA",
    date: "2026-06-23",
    description:
      "Built a food-security forecasting pipeline and policy essay for North Sumatra in the national Statistics Essay Competition.",
    highlight: true,
  },
  {
    id: "informatics-enrollment",
    title: "Informatics Undergraduate Program",
    type: "academic",
    organization: "University — Faculty of Computer Science",
    date: "2023-09-01",
    description:
      "Started the Informatics degree with a focus on AI, data science, and interactive media.",
  },
  {
    id: "python-data-cert",
    title: "Python for Data Analysis Certification",
    type: "certification",
    organization: "Online Learning Platform",
    date: "2025-03-15",
    description:
      "Completed an intensive certification covering Pandas, NumPy, visualization, and applied statistics.",
  },
  {
    id: "campus-gamejam",
    title: "Campus Game Jam — Best Gameplay",
    type: "award",
    organization: "Informatics Student Association",
    date: "2025-11-08",
    description:
      "Won Best Gameplay for a 48-hour browser game built with vanilla JavaScript.",
    highlight: true,
  },
];

/** Achievements sorted newest-first for the timeline. */
export const sortedAchievements = [...achievements].sort((a, b) =>
  b.date.localeCompare(a.date),
);
