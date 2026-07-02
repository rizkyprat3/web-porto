import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { ProjectsExplorer } from "@/components/projects/projects-explorer";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "AI, game development, research, and web development projects — filterable and searchable.",
};

export default function ProjectsPage() {
  return (
    <div className="pt-16">
      <Section
        eyebrow="Projects"
        title="Things I've built."
        description="Filter by category or search by name and technology. Every project links to a full case study."
      >
        <ProjectsExplorer projects={projects} />
      </Section>
    </div>
  );
}
