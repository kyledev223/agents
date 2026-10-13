"use client";

import type { CSSProperties, ReactNode } from "react";
import { Footer } from "@/components/chrome/chrome";
import { SideNav } from "@/components/chrome/nav";
import { BoardRoomBack, BoardRoomFront, DeskRoomBack, SURFACES, type Surface } from "./rooms";

interface Props {
  surface: Surface;
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  aside?: ReactNode; // sits to the right of the title block
  maxWidth?: string;
  children: ReactNode;
}

// The page shell for every sub-page. From 768px up the content scrolls inside a
// surface in a fixed room; below that the same markup is a plain paper page.
export function BoardPage({ surface, eyebrow, title, intro, aside, maxWidth = "", children }: Props) {
  const s = SURFACES[surface];
  const u = (n: number) => `calc(${n} * var(--u))`;

  const frame = {
    "--u": `min(max(calc(100svh / 940), calc(100vw / 1672)), calc(100svh / 601.6), calc(100vw / ${s.capW}))`,
  } as CSSProperties;
  const layer = {
    "--room-top": `min(0px, calc((100svh - 940 * var(--u)) * ${s.topBias}))`,
    "--room-w": u(1672),
    "--room-h": u(940),
  } as CSSProperties;
  const box = { "--box-x": u(s.x), "--box-y": u(s.y), "--box-w": u(s.w), "--box-h": u(s.h) } as CSSProperties;

  return (
    <main>
      <div className="board-frame" style={frame}>
        <div className="board-layer" style={layer}>
          <div className="pointer-events-none hidden md:block">{surface === "whiteboard" ? <BoardRoomBack /> : <DeskRoomBack />}</div>
          <div data-surface={surface} className="board-box @container" style={box}>
            <div className={`mx-auto px-4 pb-20 pt-6 md:px-[clamp(22px,3.4cqw,52px)] md:pb-10 md:pt-[clamp(18px,2.6cqw,40px)] ${maxWidth}`}>
              <header className="mb-8 flex flex-wrap items-end justify-between gap-x-8 gap-y-4">
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-3">{eyebrow}</p>
                  <h1 className="page-title font-display mt-1 text-[40px] font-extrabold leading-[1.05] @xl:text-[52px]">{title}</h1>
                  {intro && <div className="mt-3 max-w-[720px] text-[16px] leading-relaxed text-ink-2">{intro}</div>}
                </div>
                {aside}
              </header>
              {children}
              <Footer />
            </div>
          </div>
          {surface === "whiteboard" && <BoardRoomFront />}
        </div>
        <SideNav card />
      </div>
    </main>
  );
}
