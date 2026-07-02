import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-7xl font-bold text-gradient sm:text-8xl">404</p>
      <h1 className="mt-4 text-xl font-semibold">This page doesn&apos;t exist.</h1>
      <p className="mt-2 text-muted-foreground">
        The page you&apos;re looking for was moved, deleted, or never existed.
      </p>
      <Link href="/" className={cn(buttonVariants(), "mt-8 h-10 rounded-xl px-5")}>
        Back to home
      </Link>
    </div>
  );
}
