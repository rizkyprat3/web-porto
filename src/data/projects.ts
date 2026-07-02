import type { Project } from "@/types";

/**
 * Project registry — add a new object here and it automatically appears
 * on /projects (with filtering + search) and gets its own /projects/[slug] page.
 * Screenshots/thumbnails live under /public/images/projects/.
 */
export const projects: Project[] = [
  {
    slug: "food-security-forecasting",
    title: "Food Security Forecasting — North Sumatra",
    description:
      "Time-series forecasting pipeline predicting regional food security indicators using statistical and machine-learning models.",
    category: "AI",
    techStack: ["Python", "Pandas", "Scikit-learn", "Statsmodels", "Matplotlib"],
    status: "completed",
    thumbnail: "/images/projects/forecasting-thumb.svg",
    date: "2026-06-20",
    featured: true,
    longDescription:
      "An end-to-end data pipeline built for a national statistics competition. It ingests multi-year agricultural and economic indicators for North Sumatra, cleans and aligns heterogeneous sources, then benchmarks classical time-series models against gradient-boosted ensembles to forecast food security indices per regency.",
    problemStatement:
      "Food security planning in North Sumatra relies on lagging annual reports. Policymakers need earlier, regency-level signals of declining food resilience to act before shortages materialize.",
    developmentProcess: [
      "Collected and merged open BPS datasets across 33 regencies",
      "Built a reproducible cleaning pipeline (missing-value imputation, outlier handling)",
      "Benchmarked SARIMA, Holt-Winters, and XGBoost with rolling-origin cross-validation",
      "Visualized regency-level forecasts in an interactive report",
    ],
    challenges: [
      "Sparse and inconsistent regional data with structural breaks",
      "Very short annual series limiting deep-learning approaches",
    ],
    solutions: [
      "Hierarchical pooling of regency data to stabilize model estimates",
      "Feature engineering from correlated economic indicators instead of relying on series depth",
    ],
    screenshots: ["/images/projects/forecasting-1.svg", "/images/projects/forecasting-2.svg"],
    links: { github: "https://github.com/rizkyprat3" },
  },
  {
    slug: "game-fable-5",
    title: "Fable 5 — Browser Arcade Game",
    description:
      "A fast, dependency-free HTML5 arcade game built with vanilla JavaScript and canvas-free DOM rendering for 60 FPS on any device.",
    category: "Game Development",
    techStack: ["JavaScript", "HTML5", "CSS3"],
    status: "completed",
    thumbnail: "/images/projects/fable5-thumb.svg",
    date: "2026-05-10",
    featured: true,
    longDescription:
      "A lightweight browser game designed to be embedded anywhere. The entire game ships as three static files with zero dependencies, making it instantly playable inside the portfolio's arcade through a sandboxed iframe.",
    problemStatement:
      "Most web games require heavy engines or bundlers, making them slow to load and hard to embed safely inside another site.",
    developmentProcess: [
      "Prototyped core loop with requestAnimationFrame and delta timing",
      "Implemented input handling for both keyboard and touch",
      "Optimized rendering to transform/opacity-only updates",
      "Packaged as a self-contained static folder for iframe embedding",
    ],
    challenges: [
      "Keeping a stable frame rate without a game engine",
      "Running safely inside a sandboxed iframe with no external requests",
    ],
    solutions: [
      "Fixed-timestep update loop decoupled from rendering",
      "Zero-dependency architecture — all assets inlined or local",
    ],
    screenshots: ["/images/projects/fable5-1.svg"],
    links: { demo: "/arcade/game-fable-5", github: "https://github.com/rizkyprat3" },
  },
  {
    slug: "makharijul-huruf-research",
    title: "Makharijul Huruf Learning Research",
    description:
      "Academic research on instructional methods for Arabic letter articulation, from literature review to field instrumentation and analysis.",
    category: "Research",
    techStack: ["SPSS", "Google Forms", "Zotero", "LaTeX"],
    status: "completed",
    thumbnail: "/images/projects/research-thumb.svg",
    date: "2026-07-01",
    longDescription:
      "A full academic research cycle: problem formulation, theoretical framework, instrument design, field data collection at an Islamic elementary school, and statistical analysis of learning outcomes across teaching methods.",
    problemStatement:
      "Students struggle with correct articulation points (makharijul huruf) when conventional lecture methods are used; the study measures whether drill-based methods significantly improve outcomes.",
    developmentProcess: [
      "Systematic literature review and theoretical framework",
      "Designed validated observation and test instruments",
      "Collected pre/post data across treatment groups",
      "Analyzed results with paired statistical tests",
    ],
    challenges: [
      "Small sample sizes typical of single-school studies",
      "Controlling for teacher-effect confounds",
    ],
    solutions: [
      "Non-parametric tests appropriate for small samples",
      "Standardized lesson scripts across groups",
    ],
    screenshots: [],
    links: {},
  },
  {
    slug: "portfolio-website",
    title: "This Portfolio Website",
    description:
      "The site you are looking at — Next.js 15, Framer Motion, and a sandboxed HTML game arcade, tuned for 60 FPS.",
    category: "Web Development",
    techStack: ["Next.js 15", "TypeScript", "Tailwind CSS", "Framer Motion", "shadcn/ui"],
    status: "in-progress",
    thumbnail: "/images/projects/portfolio-thumb.svg",
    date: "2026-07-02",
    featured: true,
    longDescription:
      "A production-grade personal portfolio with a dynamic project system, an arcade that runs real HTML games in sandboxed iframes, an animated achievements timeline, and enterprise-style security headers — all statically generated.",
    problemStatement:
      "Portfolio templates look generic and rarely support embedding playable games safely; this project builds a custom, secure, animation-rich alternative.",
    developmentProcess: [
      "Designed a data-driven architecture (all content in typed data files)",
      "Built a reusable animation library on GPU-friendly properties only",
      "Implemented sandboxed iframe game hosting with CSP",
      "Optimized to static output with lazy-loaded heavy assets",
    ],
    challenges: [
      "Embedding untrusted HTML games without XSS risk",
      "Keeping heavy animations at 60 FPS on mid-range laptops",
    ],
    solutions: [
      "iframe sandbox + same-origin CSP frame-src policy",
      "transform/opacity-only animations with viewport-based reveal",
    ],
    screenshots: [],
    links: { github: "https://github.com/rizkyprat3/web-porto" },
  },
];

/** Projects flagged for the home page, newest first. */
export const featuredProjects = projects
  .filter((p) => p.featured)
  .sort((a, b) => b.date.localeCompare(a.date));
