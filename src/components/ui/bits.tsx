"use client";

import type { ReactNode } from "react";
import { timeAgo } from "@/lib/format";
import { useStore } from "@/state/store";

// Relative times depend on the visitor's clock, so they render after hydration.
export function TimeAgo({ at, className = "" }: { at: number; className?: string }) {
  const { ready, now } = useStore();
  return (
    <time className={`tabular ${className}`} dateTime={ready ? new Date(at).toISOString() : undefined}>
      {ready ? timeAgo(at, now) : "--"}
    </time>
  );
}

export function DemoBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-paper-2 px-2.5 py-0.5 text-[12px] font-semibold text-ink-2 ${className}`}
      title="Nothing on this site touches a real blockchain or wallet."
    >
      <span className="h-1.5 w-1.5 rounded-full bg-warm" aria-hidden="true" />
      Demo / simulation
    </span>
  );
}

export function Tag({ tone = "neutral", children }: { tone?: "neutral" | "win" | "loss" | "dark"; children: ReactNode }) {
  const tones = {
    neutral: "bg-paper-2 text-ink-2",
    win: "bg-win-soft text-win-deep",
    loss: "bg-loss-soft text-loss",
    dark: "bg-ink text-white",
  } as const;
  return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-semibold ${tones[tone]}`}>{children}</span>;
}

export const Eyebrow = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <p className={`text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3 ${className}`}>{children}</p>
);

// Card with the header strip used on the reference launch page.
export function Panel({
  eyebrow,
  title,
  aside,
  children,
  className = "",
  bodyClassName = "px-5 py-5",
}: {
  eyebrow?: string;
  title: string;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`overflow-hidden rounded-2xl border border-rule bg-card ${className}`}>
      <header className="flex items-start justify-between gap-4 border-b border-rule px-5 pb-3.5 pt-4">
        <div className="min-w-0">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h2 className="font-display mt-0.5 text-[20px] font-extrabold leading-tight">{title}</h2>
        </div>
        {aside && <div className="shrink-0 pt-1">{aside}</div>}
      </header>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-rule bg-card px-4 py-3.5">
      <p className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">{label}</p>
      <p className="font-display tabular mt-1 truncate text-[26px] font-extrabold leading-tight">{value}</p>
      {hint && <p className="mt-0.5 truncate text-[12.5px] text-ink-3">{hint}</p>}
    </div>
  );
}
