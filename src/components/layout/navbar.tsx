"use client";

/**
 * Fixed glass navbar with active-link indicator and mobile menu.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { siteConfig } from "@/data/site";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/projects", label: "Projects" },
  { href: "/arcade", label: "Arcade" },
  { href: "/achievements", label: "Achievements" },
  { href: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile menu on route change
  useEffect(() => setOpen(false), [pathname]);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <nav className="glass mx-auto mt-3 flex w-[calc(100%-1.5rem)] max-w-6xl items-center justify-between rounded-2xl px-4 py-2.5 sm:px-6">
        <Link href="/" className="font-mono text-sm font-bold tracking-tight">
          <span className="text-gradient">{"<"}RP{" />"}</span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href} className="relative">
              <Link
                href={href}
                className={cn(
                  "relative rounded-lg px-3 py-1.5 text-sm transition-colors",
                  isActive(href)
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {isActive(href) && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-lg bg-accent"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <span className="relative">{label}</span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:block">
          <a
            href={siteConfig.links.github}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ size: "sm", variant: "outline" }), "rounded-lg")}
          >
            GitHub
          </a>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg p-2 text-muted-foreground hover:text-foreground md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="glass mx-auto mt-2 w-[calc(100%-1.5rem)] max-w-6xl rounded-2xl p-2 md:hidden"
          >
            <ul className="flex flex-col">
              {NAV_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      "block rounded-xl px-4 py-3 text-sm",
                      isActive(href)
                        ? "bg-accent text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
