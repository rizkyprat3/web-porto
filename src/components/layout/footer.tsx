import Link from "next/link";
import { Mail } from "lucide-react";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/icons";
import { Separator } from "@/components/ui/separator";
import { siteConfig } from "@/data/site";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
          <div>
            <p className="font-mono text-sm font-bold">
              <span className="text-gradient">{"<"}RP{" />"}</span>
            </p>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              {siteConfig.tagline}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={siteConfig.links.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-neon-cyan"
            >
              <GitHubIcon />
            </a>
            <a
              href={siteConfig.links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-neon-cyan"
            >
              <LinkedInIcon />
            </a>
            <a
              href={`mailto:${siteConfig.email}`}
              aria-label="Email"
              className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-neon-cyan"
            >
              <Mail className="size-5" />
            </a>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col items-start justify-between gap-3 text-xs text-muted-foreground sm:flex-row">
          <p>
            © {new Date().getFullYear()} {siteConfig.name}. Built with Next.js,
            Tailwind CSS &amp; Framer Motion.
          </p>
          <nav className="flex gap-4">
            <Link href="/projects" className="hover:text-foreground">
              Projects
            </Link>
            <Link href="/arcade" className="hover:text-foreground">
              Arcade
            </Link>
            <Link href="/contact" className="hover:text-foreground">
              Contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
