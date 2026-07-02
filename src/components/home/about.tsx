/**
 * About section: bio, grouped skills grid, learning journey timeline.
 * Server component — only the Reveal wrappers are client-side.
 */
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/reveal";
import { journey, skills } from "@/data/skills";
import { siteConfig } from "@/data/site";
import type { Skill } from "@/types";

const SKILL_GROUPS = ["Languages", "AI & Data", "Game Dev", "Web", "Tools"] as const;

function groupSkills(group: Skill["group"]) {
  return skills.filter((s) => s.group === group);
}

export function About() {
  return (
    <Section
      id="about"
      eyebrow="01 — About"
      title="Turning curiosity into working systems."
      description={`I'm ${siteConfig.name}, an Informatics student who moves between game engines, machine-learning notebooks, and production web apps — and enjoys every layer of the stack.`}
    >
      <div className="grid gap-10 lg:grid-cols-5">
        {/* Skills grid */}
        <RevealGroup className="grid gap-4 sm:grid-cols-2 lg:col-span-3">
          {SKILL_GROUPS.map((group) => (
            <RevealItem key={group}>
              <Card className="glass h-full border-0">
                <CardContent className="p-5">
                  <h3 className="mb-3 font-mono text-xs tracking-widest text-neon-cyan uppercase">
                    {group}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {groupSkills(group).map((skill) => (
                      <Badge key={skill.name} variant="secondary" className="rounded-lg">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* Learning journey */}
        <Reveal className="lg:col-span-2">
          <h3 className="mb-6 font-mono text-xs tracking-widest text-neon-cyan uppercase">
            Learning Journey
          </h3>
          <ol className="relative space-y-8 border-l border-border pl-6">
            {journey.map((step) => (
              <li key={step.period} className="relative">
                <span
                  aria-hidden
                  className="absolute top-1.5 -left-[1.83rem] size-2.5 rounded-full bg-neon-cyan shadow-[0_0_8px] shadow-neon-cyan/50"
                />
                <p className="font-mono text-xs text-muted-foreground">{step.period}</p>
                <h4 className="mt-1 font-medium">{step.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </Section>
  );
}
