import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { games } from "@/data/games";
import { siteConfig } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.url.replace(/\/$/, "");

  const staticPages = ["", "/projects", "/arcade", "/achievements", "/contact"].map(
    (path) => ({
      url: `${base}${path}`,
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.8,
    }),
  );

  const projectPages = projects.map((p) => ({
    url: `${base}/projects/${p.slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const gamePages = games.map((g) => ({
    url: `${base}/arcade/${g.id}`,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...projectPages, ...gamePages];
}
