import type { Metadata } from "next";
import { Mail } from "lucide-react";
import { Section } from "@/components/ui/section";
import { Reveal } from "@/components/ui/reveal";
import { AnimatedGradient } from "@/components/ui/animated-gradient";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/icons";
import { ContactForm } from "@/components/contact/contact-form";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch — collaborations, questions, or just to say hi.",
};

const CHANNELS = [
  {
    label: "Email",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
    icon: Mail,
  },
  {
    label: "GitHub",
    value: "@rizkyprat3",
    href: siteConfig.links.github,
    icon: GitHubIcon,
  },
  {
    label: "LinkedIn",
    value: "Rizki Pratama",
    href: siteConfig.links.linkedin,
    icon: LinkedInIcon,
  },
] as const;

export default function ContactPage() {
  return (
    <div className="relative overflow-hidden pt-16">
      {/* Animated background, no parallax — subtler than the hero */}
      <AnimatedGradient className="pointer-events-none opacity-60" />

      <Section
        eyebrow="Contact"
        title="Let's build something."
        description="Have a project, a collaboration idea, or just want to talk games and data? My inbox is open."
        className="relative"
      >
        <div className="grid gap-10 lg:grid-cols-5">
          <Reveal className="space-y-3 lg:col-span-2">
            {CHANNELS.map(({ label, value, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("mailto:") ? undefined : "_blank"}
                rel="noopener noreferrer"
                className="glass group flex items-center gap-4 rounded-2xl p-4 transition-colors hover:border-neon-cyan/30"
              >
                <span className="flex size-11 items-center justify-center rounded-xl bg-accent text-neon-cyan">
                  <Icon className="size-5" />
                </span>
                <span>
                  <span className="block text-sm text-muted-foreground">{label}</span>
                  <span className="block font-medium transition-colors group-hover:text-neon-cyan">
                    {value}
                  </span>
                </span>
              </a>
            ))}
          </Reveal>

          <Reveal className="relative lg:col-span-3">
            <ContactForm />
          </Reveal>
        </div>
      </Section>
    </div>
  );
}
