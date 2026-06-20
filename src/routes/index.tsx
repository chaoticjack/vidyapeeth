import { createFileRoute } from "@tanstack/react-router";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsBar } from "@/components/home/StatsBar";
import { CourseShowcase } from "@/components/home/CourseShowcase";
import { VSATBlock } from "@/components/home/VSATBlock";
import { DemoBookingSection } from "@/components/home/DemoBookingSection";
import { HowItWorks } from "@/components/home/HowItWorks";
import { TestimonialsGrid } from "@/components/home/TestimonialsGrid";
import { SuccessMarquee } from "@/components/home/SuccessMarquee";
import { CTABanner } from "@/components/home/CTABanner";
import { WaveDivider } from "@/components/shared/WaveDivider";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "Vidyapeeth — Education Matters | Class 6–10 Online Coaching",
      },
      {
        name: "description",
        content:
          "Live mentor-led classes for Class 6–10 across India. CBSE, ICSE & state boards. Book a free demo, win VSAT scholarships, learn without the noise.",
      },
      {
        property: "og:title",
        content: "Vidyapeeth — Education Matters",
      },
      {
        property: "og:description",
        content:
          "India's most patient online school for Class 6–10. Live mentor classes, doubt rooms, weekly tests.",
      },
      { property: "og:url", content: "/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <HeroSection />
      <StatsBar />
      <CourseShowcase />
      <div className="bg-cream"><WaveDivider fill="#1B2A4A" /></div>
      <VSATBlock />
      <div className="bg-navy"><WaveDivider fill="#FFF8F0" flip /></div>
      <DemoBookingSection />
      <HowItWorks />
      <TestimonialsGrid />
      <SuccessMarquee />
      <CTABanner />
    </>
  );
}
