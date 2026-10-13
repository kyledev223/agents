import { HeroDesktop, HeroMobile } from "@/components/home/Hero";
import { HomeSections } from "@/components/home/Sections";

export default function HomePage() {
  return (
    <main>
      <HeroDesktop />
      <HeroMobile />
      <HomeSections />
    </main>
  );
}
