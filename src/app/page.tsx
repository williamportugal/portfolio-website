import HomeHeroSection from "@/components/HomeHeroSection";

export default function Home() {
  return (
    <>
      {/* Mobile Home - visible below 768px */}
      <div className="md:hidden">
        <HomeHeroSection variant="mobile" />
      </div>

      {/* Desktop Home - visible at 768px and above */}
      <div className="hidden md:block">
        <HomeHeroSection variant="desktop" />
      </div>
    </>
  );
}
