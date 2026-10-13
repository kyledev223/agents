import { ViewTransition } from "react";
import { HeroDesktop, HeroMobile } from "@/components/home/Hero";
import { HomeSections } from "@/components/home/Sections";

export default function HomePage() {
  // The transition boundary has to be the page's outermost node (see BoardPage).
  return (
    <ViewTransition enter="page-in" exit="page-out" default="none">
      <main>
        <HeroDesktop />
        <HeroMobile />
        <HomeSections />
      </main>
    </ViewTransition>
  );
}
