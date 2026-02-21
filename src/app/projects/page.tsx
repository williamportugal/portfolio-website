import { Metadata } from "next";
import ProjectCard from "@/components/ProjectCard";
import styles from "./page.module.css";
import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "Projects",
  description: "Browse my portfolio of projects",
};

const sampleProjects = [
  {
    title: "Sample Project",
    description: "This is a placeholder project. Replace with your actual projects.",
    tags: ["React", "TypeScript", "Tailwind"],
    projectUrl: "#",
    githubUrl: "#",
  },
];

export default function ProjectsPage() {
  return (
    <PageTransition>
      {/* Mobile Projects - visible below 768px */}
      <div className="md:hidden">
        <div className={styles.mobileContainer}>
          <h1 className={styles.mobileTitle}>Projects</h1>
          <div className={styles.mobileGrid}>
            {sampleProjects.map((project) => (
              <ProjectCard key={project.title} {...project} />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop Projects - visible at 768px and above */}
      <div className="hidden md:block">
        <div className={styles.desktopContainer}>
          <h1 className={styles.desktopTitle}>Projects</h1>
          <div className={styles.desktopGrid}>
            {sampleProjects.map((project) => (
              <ProjectCard key={project.title} {...project} />
            ))}
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
