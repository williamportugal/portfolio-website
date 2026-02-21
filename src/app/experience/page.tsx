import { Metadata } from "next";
import ExperienceHeroSection from "@/components/ExperienceHeroSection";

export const metadata: Metadata = {
  title: "Experience",
  description: "My professional experience and work history",
};

export default function ExperiencePage() {
  return (
    <>
      {/* Mobile — visible below 768px */}
      <div className="md:hidden">
        <ExperienceHeroSection variant="mobile" />
      </div>

      {/* Desktop — visible at 768px and above */}
      <div className="hidden md:block">
        <ExperienceHeroSection variant="desktop" />
      </div>
    </>
  );
}
