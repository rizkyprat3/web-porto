"use client";

/**
 * Animated project card with hover lift. Shared by the projects grid
 * and the home page's featured section.
 */
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { hoverLift, tapPress } from "@/lib/animations";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

const STATUS_STYLES: Record<Project["status"], string> = {
  completed: "bg-emerald-400/10 text-emerald-300 border-emerald-400/20",
  "in-progress": "bg-amber-400/10 text-amber-300 border-amber-400/20",
  planned: "bg-sky-400/10 text-sky-300 border-sky-400/20",
};

export function ProjectCard({ project }: { project: Project }) {
  return (
    <motion.article whileHover={hoverLift} whileTap={tapPress} className="h-full">
      <Link
        href={`/projects/${project.slug}`}
        className="glass group flex h-full flex-col overflow-hidden rounded-2xl transition-colors hover:border-neon-cyan/30"
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
          <p className="font-mono text-xs tracking-widest text-neon-cyan uppercase">
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
  );
}
