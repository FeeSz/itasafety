import LandingFAQ from "@/components/landing/LandingFAQ";
import LandingHero from "@/components/landing/LandingHero";
import LandingReasons from "@/components/landing/LandingReasons";

export default function EntryLanding() {
  return (
    <div className="relative isolate min-h-dvh overflow-x-clip bg-background text-foreground">
      <div className="relative z-10">
        <div id="conteudo">
          <LandingHero />
          <LandingReasons />
          <LandingFAQ />
        </div>
      </div>
    </div>
  );
}
