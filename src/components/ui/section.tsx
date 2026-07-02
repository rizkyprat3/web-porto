import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

interface SectionProps {
  id?: string;
  /** Small neon label above the title, e.g. "01 — About" */
  eyebrow?: string;
  title?: string;
  description?: string;
  className?: string;
  children: React.ReactNode;
}

/**
 * Standard page section: consistent container width, vertical rhythm,
 * and an animated heading block. Keeps every page visually aligned.
 */
export function Section({
  id,
  eyebrow,
  title,
  description,
  className,
  children,
}: SectionProps) {
  return (
    <section id={id} className={cn("py-20 sm:py-28", className)}>
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {(eyebrow || title) && (
          <Reveal className="mb-12 max-w-2xl">
            {eyebrow && (
              <p className="mb-3 font-mono text-sm tracking-widest text-neon-cyan uppercase">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-4 text-muted-foreground text-pretty">
                {description}
              </p>
            )}
          </Reveal>
        )}
        {children}
      </div>
    </section>
  );
}
