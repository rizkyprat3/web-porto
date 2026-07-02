import type { JourneyMilestone, Skill } from "@/types";

/** Skills grid on the About section, grouped by domain. */
export const skills: Skill[] = [
  { name: "Python", group: "Languages" },
  { name: "TypeScript", group: "Languages" },
  { name: "JavaScript", group: "Languages" },
  { name: "SQL", group: "Languages" },
  { name: "Pandas", group: "AI & Data" },
  { name: "Scikit-learn", group: "AI & Data" },
  { name: "Time-series Forecasting", group: "AI & Data" },
  { name: "Statistical Analysis", group: "AI & Data" },
  { name: "HTML5 Game Dev", group: "Game Dev" },
  { name: "Game Design", group: "Game Dev" },
  { name: "Next.js", group: "Web" },
  { name: "React", group: "Web" },
  { name: "Tailwind CSS", group: "Web" },
  { name: "Git & GitHub", group: "Tools" },
  { name: "Jupyter", group: "Tools" },
  { name: "LaTeX", group: "Tools" },
];

/** Learning journey timeline on the About section, oldest-first. */
export const journey: JourneyMilestone[] = [
  {
    period: "2023",
    title: "Started Informatics",
    description:
      "Began the undergraduate program and fell in love with programming through Python.",
  },
  {
    period: "2024",
    title: "First Web & Game Projects",
    description:
      "Shipped my first browser games and learned modern web development with React.",
  },
  {
    period: "2025",
    title: "Data Science Deep-Dive",
    description:
      "Focused on statistics, machine learning, and forecasting; won a campus game jam on the side.",
  },
  {
    period: "2026",
    title: "National Competitions & Research",
    description:
      "Competed in SATRIA DATA with a food-security forecasting pipeline and contributed to academic research.",
  },
];
