"use client";

/**
 * Animated project card with tilt + hover lift. Shared by the projects grid
 * and the home page's featured section.
 */
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { TiltCard } from "@/components/ui/tilt-card";
import { hoverLift, tapPress } from "@/lib/animations";
import { categoryColor } from "@/lib/category-color";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

const STATUS_STYLES: Record<Project["status"], string> = {
  completed:
    "bg-emerald-500/10 text-emerald-700 border-emerald-500/30 dark:bg-emerald-400/10 dark:text-emerald-300 dark:border-emerald-400/20",
  "in-progress":
    "bg-amber-500/10 text-amber-700 border-amber-500/30 dark:bg-amber-400/10 dark:text-amber-300 dark:border-amber-400/20",
  planned:
    "bg-sky-500/10 text-sky-700 border-sky-500/30 dark:bg-sky-400/10 dark:text-sky-300 dark:border-sky-400/20",
};

export function ProjectCard({ project }: { project: Project }) {
  const accent = categoryColor[project.category];

  return (
    <TiltCard>
      <motion.article whileHover={hoverLift} whileTap={tapPress} className="h-full">
        <Link
          href={`/projects/${project.slug}`}
          className={cn(
            "glass group flex h-full flex-col overflow-hidden rounded-2xl transition-colors",
            accent.hoverBorder,
          )}
        >
          <div className="relative aspect-video overflow-hidden">
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            />
            <Badge
              variant="outline"
              className={cn(
                "absolute top-3 right-3 rounded-lg backdrop-blur-sm",
                STATUS_STYLES[project.status],
              )}
            >
              {project.status}
            </Badge>
          </div>

          <div className="flex flex-1 flex-col p-5">
            <p className={cn("font-mono text-xs tracking-widest uppercase", accent.text)}>
              {project.category}
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight">{project.title}</h3>
            <p className="mt-2 line-clamp-2 flex-1 text-sm text-muted-foreground">
              {project.description}
            </p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {project.techStack.slice(0, 4).map((tech) => (
                <Badge key={tech} variant="secondary" className="rounded-md text-xs">
                  {tech}
                </Badge>
              ))}
              {project.techStack.length > 4 && (
                <Badge variant="secondary" className="rounded-md text-xs">
                  +{project.techStack.length - 4}
                </Badge>
              )}
            </div>
          </div>
        </Link>
      </motion.article>
    </TiltCard>
  );
}
