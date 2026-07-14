import type { SiteConfig } from "@/types";

/**
 * Single source of truth for identity, SEO metadata, and social links.
 * Edit this file to rebrand the whole site.
 */
export const siteConfig: SiteConfig = {
  name: "Rizki Pratama",
  role: "Informatics Student",
  tagline: "Building intelligent systems, playable worlds, and data-driven insight.",
  description:
    "Portfolio of Rizki Pratama — Informatics student specializing in Game Development, AI, Data Analysis, Forecasting, Research, and Web Development.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  email: "rizkyprat03@gmail.com",
  links: {
    github: "https://github.com/rizkyprat3",
    discord: "https://discord.com/users/1056746829926109206",
  },
  // Replace with a real photo of yourself at work (e.g. "/images/profile.jpg").
  profileImage: "/images/profile-placeholder.svg",
  profileCaption: "Informatics Student, Indonesia",
};
