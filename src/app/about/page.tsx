import { Metadata } from "next";
import AboutHeroSection from "@/components/AboutHeroSection";

export const metadata: Metadata = {
  title: "About",
  description: "Learn more about me and my background",
};

export default function AboutPage() {
  return (
    <>
      {/* Mobile About - visible below 768px */}
      <div className="md:hidden">
        <AboutHeroSection variant="mobile" />
      </div>

      {/* Desktop About - visible at 768px and above */}
      <div className="hidden md:block">
        <AboutHeroSection variant="desktop" />
      </div>
    </>
  );
}
