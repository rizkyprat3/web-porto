import type { Project } from "@/types";

/**
 * Project registry — add a new object here and it automatically appears
 * on /projects (with filtering + search) and gets its own /projects/[slug] page.
 * Screenshots/thumbnails live under /public/images/projects/.
 */
export const projects: Project[] = [
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
  {
    slug: "iot-environment-monitor",
    title: "IoT Environment Monitor (Arduino Uno)",
    description:
      "A simple Arduino Uno prototype that reads temperature, humidity, and light data and displays it in real time — a first step into IoT.",
    category: "Research",
    techStack: ["Arduino Uno", "C++", "DHT11 Sensor", "LDR", "I2C LCD"],
    status: "in-progress",
    thumbnail: "/images/projects/arduino-thumb.svg",
    date: "2026-07-03",
    featured: false,
    longDescription:
      "A hobby electronics project exploring the basics of IoT: an Arduino Uno reads temperature, humidity, and ambient light, then shows live readings on a small I2C LCD. It's an early prototype — no cloud connectivity yet — built to learn sensor wiring, serial debugging, and embedded C++ before scaling up to a networked version.",
    problemStatement:
      "As a mostly software-focused student, I wanted hands-on experience with the hardware side of the systems I build — sensing real-world data instead of only processing datasets.",
    developmentProcess: [
      "Wired a DHT11 temperature/humidity sensor and an LDR light sensor to the Arduino Uno",
      "Wrote embedded C++ to poll sensors and debounce noisy readings",
      "Added an I2C LCD for a live on-device readout",
      "Currently refining the wiring and code before publishing the source and a demo video",
    ],
    challenges: [
      "Noisy analog readings from the LDR without proper calibration",
      "Limited SRAM on the Uno when adding more sensors and display logic at once",
    ],
    solutions: [
      "Simple moving-average smoothing on sensor readings",
      "Trimmed string literals and reused buffers to fit within the Uno's memory budget",
    ],
    screenshots: [],
    links: {},
  },
];

/** Projects flagged for the home page, newest first. */
export const featuredProjects = projects
  .filter((p) => p.featured)
  .sort((a, b) => b.date.localeCompare(a.date));
