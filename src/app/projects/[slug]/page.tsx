import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Lightbulb, Puzzle, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { GitHubIcon } from "@/components/ui/icons";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { projects } from "@/data/projects";
import { cn } from "@/lib/utils";

interface ProjectPageProps {
  params: Promise<{ slug: string }>;
}

/** Pre-render every project page at build time. */
export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.description,
    openGraph: { title: project.title, description: project.description },
  };
}

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
  const { slug } = await params;
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();

  return (
    <article className="mx-auto w-full max-w-4xl px-4 pt-28 pb-20 sm:px-6">
      <Reveal>
        <Link
          href="/projects"
          className="mb-8 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> All projects
        </Link>

        <p className="font-mono text-sm tracking-widest text-neon-cyan uppercase">
          {project.category} · {project.status}
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
          {project.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground text-pretty">
          {project.description}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.techStack.map((tech) => (
            <Badge key={tech} variant="secondary" className="rounded-lg">
              {tech}
            </Badge>
          ))}
        </div>

        {(project.links.demo || project.links.github) && (
          <div className="mt-8 flex flex-wrap gap-3">
            {project.links.demo && (
              <a
                href={project.links.demo}
                target={project.links.demo.startsWith("/") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className={cn(buttonVariants(), "h-10 rounded-xl px-4")}
              >
                <ExternalLink className="size-4" /> Live Demo
              </a>
            )}
            {project.links.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(buttonVariants({ variant: "outline" }), "h-10 rounded-xl px-4")}
              >
                <GitHubIcon className="size-4" /> Source Code
              </a>
            )}
          </div>
        )}
      </Reveal>

      {/* Hero image */}
      <Reveal className="mt-12">
        <div className="glass relative aspect-video overflow-hidden rounded-2xl">
          <Image
            src={project.thumbnail}
            alt={project.title}
            fill
            priority
            sizes="(max-width: 896px) 100vw, 896px"
            className="object-cover"
          />
        </div>
      </Reveal>

      {/* Body */}
      <div className="mt-14 space-y-14">
        <Reveal>
          <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            {project.longDescription}
          </p>
        </Reveal>

        <Reveal>
          <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Lightbulb className="size-5 text-neon-cyan" /> Problem Statement
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            {project.problemStatement}
          </p>
        </Reveal>

        <Reveal>
          <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            <Wrench className="size-5 text-neon-cyan" /> Development Process
          </h2>
          <ol className="mt-5 space-y-4">
            {project.developmentProcess.map((step, i) => (
              <li key={step} className="flex gap-4">
                <span className="glass flex size-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs text-neon-cyan">
                  {i + 1}
                </span>
                <p className="pt-0.5 text-muted-foreground">{step}</p>
              </li>
            ))}
          </ol>
        </Reveal>

        <RevealGroup className="grid gap-5 sm:grid-cols-2">
          <RevealItem>
            <div className="glass h-full rounded-2xl p-6">
              <h3 className="flex items-center gap-2 font-semibold">
                <Puzzle className="size-4 text-neon-pink" /> Challenges
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {project.challenges.map((c) => (
                  <li key={c} className="flex gap-2.5">
                    <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-neon-pink" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </RevealItem>
          <RevealItem>
            <div className="glass h-full rounded-2xl p-6">
              <h3 className="flex items-center gap-2 font-semibold">
                <Lightbulb className="size-4 text-neon-cyan" /> Solutions
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {project.solutions.map((s) => (
                  <li key={s} className="flex gap-2.5">
                    <span aria-hidden className="mt-2 size-1 shrink-0 rounded-full bg-neon-cyan" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </RevealItem>
        </RevealGroup>

        {project.screenshots.length > 0 && (
          <div>
            <Reveal>
              <h2 className="text-2xl font-semibold tracking-tight">Screenshots</h2>
            </Reveal>
            <RevealGroup className="mt-6 grid gap-4 sm:grid-cols-2">
              {project.screenshots.map((src) => (
                <RevealItem key={src}>
                  <div className="glass relative aspect-video overflow-hidden rounded-xl">
                    <Image
                      src={src}
                      alt={`${project.title} screenshot`}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, 440px"
                      className="object-cover"
                    />
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        )}
      </div>

      <Separator className="my-12" />
      <Reveal className="text-center">
        <Link
          href="/projects"
          className={cn(buttonVariants({ variant: "outline" }), "h-10 rounded-xl px-4")}
        >
          <ArrowLeft className="size-4" /> Back to all projects
        </Link>
      </Reveal>
    </article>
  );
}
