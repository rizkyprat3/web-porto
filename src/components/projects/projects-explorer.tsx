"use client";

/**
 * Interactive projects grid: category filter + text search with
 * staggered card reveal. Client component; receives data from the
 * server page so the data layer stays server-side.
 */
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ProjectCard } from "@/components/projects/project-card";
import { categoryColor } from "@/lib/category-color";
import { cn } from "@/lib/utils";
import { PROJECT_CATEGORIES, type Project, type ProjectCategory } from "@/types";

type Filter = ProjectCategory | "All";

export function ProjectsExplorer({ projects }: { projects: Project[] }) {
  const [filter, setFilter] = useState<Filter>("All");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects
      .filter((p) => filter === "All" || p.category === filter)
      .filter(
        (p) =>
          !q ||
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.techStack.some((t) => t.toLowerCase().includes(q)),
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [projects, filter, query]);

  return (
    <div>
      {/* Controls */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {(["All", ...PROJECT_CATEGORIES] as Filter[]).map((cat) => {
            const accent = cat === "All" ? null : categoryColor[cat];
            const active = filter === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={cn(
                  "rounded-xl border px-3.5 py-1.5 text-sm transition-colors",
                  active
                    ? accent
                      ? cn(accent.border, accent.bg, accent.text)
                      : "border-neon-cyan/50 bg-neon-cyan/10 text-neon-cyan"
                    : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {cat}
              </button>
            );
          })}
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search projects…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="rounded-xl pl-9"
            aria-label="Search projects"
          />
        </div>
      </div>

      {/* Grid */}
      {visible.length > 0 ? (
        <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {visible.map((project, i) => (
              <motion.div
                key={project.slug}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{
                  opacity: 1,
                  y: 0,
                  transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
                }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.2 } }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="glass rounded-2xl py-16 text-center">
          <p className="text-muted-foreground">No projects match your search.</p>
          <div className="mt-3">
            <Badge
              variant="outline"
              className="cursor-pointer rounded-lg"
              onClick={() => {
                setFilter("All");
                setQuery("");
              }}
            >
              Reset filters
            </Badge>
          </div>
        </div>
      )}
    </div>
  );
}
