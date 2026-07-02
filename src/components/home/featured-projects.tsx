/**
 * Home page teaser: featured projects + link to the full grid.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Section } from "@/components/ui/section";
import { cn } from "@/lib/utils";
import { RevealGroup, RevealItem } from "@/components/ui/reveal";
import { ProjectCard } from "@/components/projects/project-card";
import { featuredProjects } from "@/data/projects";

export function FeaturedProjects() {
  if (featuredProjects.length === 0) return null;

  return (
    <Section
      id="featured"
      eyebrow="02 — Selected Work"
      title="Featured projects."
      description="A snapshot of what I've been building — from playable games to production web apps."
    >
      <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {featuredProjects.slice(0, 3).map((project) => (
          <RevealItem key={project.slug} className="h-full">
            <ProjectCard project={project} />
          </RevealItem>
        ))}
      </RevealGroup>
      <div className="mt-10 text-center">
        <Link
          href="/projects"
          className={cn(buttonVariants({ variant: "outline" }), "group h-10 rounded-xl px-4")}
        >
          View all projects
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </Section>
  );
}
