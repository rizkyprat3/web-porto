import { Hero } from "@/components/home/hero";
import { About } from "@/components/home/about";
import { FeaturedProjects } from "@/components/home/featured-projects";

export default function HomePage() {
  return (
    <>
      <Hero />
      <About />
      <FeaturedProjects />
    </>
  );
}
