import type { Metadata } from "next";
import { Section } from "@/components/ui/section";
import { AchievementsTimeline } from "@/components/achievements/timeline";
import { sortedAchievements } from "@/data/achievements";

export const metadata: Metadata = {
  title: "Achievements",
  description:
    "Competitions, awards, certifications, and academic milestones on an interactive timeline.",
};

export default function AchievementsPage() {
  return (
    <div className="pt-16">
      <Section
        eyebrow="Achievements"
        title="Milestones along the way."
        description="Competitions, awards, certifications, and academic milestones — newest first."
      >
        <AchievementsTimeline items={sortedAchievements} />
      </Section>
    </div>
  );
}
