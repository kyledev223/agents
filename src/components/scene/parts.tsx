import { rngFor } from "@/lib/rng";

// Shared pieces of the original SVG scenes. Flat shapes, soft gradients, no outlines.

const GREENS = ["#2f6b3a", "#3f8446", "#5aa24f", "#79b95c", "#2a5a36"];

// One decimal is plenty at these sizes, and keeps the exported HTML small.
const n = (v: number) => Math.round(v * 10) / 10;

function leafPath(length: number, fat = 0.3) {
  const len = n(length);
  const a = n(len * 0.3);
  const b = n(len * 0.75);
  const h = n(len * fat);
  return `M0 0C${a} ${-h} ${b} ${-h} ${len} 0C${b} ${h} ${a} ${h} 0 0z`;
}

export function Plant({
  x, y, scale = 1, seed = "p", pot = "#f3ece2", potShade = "#d9cdbd", leaves = 9, spread = 150, tall = false,
}: {
  x: number; y: number; scale?: number; seed?: string; pot?: string; potShade?: string; leaves?: number; spread?: number; tall?: boolean;
}) {
  const r = rngFor("plant", seed);
  const items = Array.from({ length: leaves }, (_, i) => {
    const t = leaves === 1 ? 0.5 : i / (leaves - 1);
    const angle = -90 - spread / 2 + t * spread + (r() - 0.5) * 14;
    const len = (tall ? 62 : 44) + r() * 26;
    return { angle, len, color: GREENS[Math.floor(r() * GREENS.length)], fat: 0.2 + r() * 0.14 };
  });
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {items.map((l, i) => (
        <path key={i} d={leafPath(l.len, l.fat)} fill={l.color} transform={`translate(0 -34) rotate(${n(l.angle)})`} />
      ))}
      <path d="M-22 -36h44l-5 32a6 6 0 0 1-6 5h-22a6 6 0 0 1-6-5z" fill={pot} />
      <path d="M2 -36h20l-5 32a6 6 0 0 1-6 5H4z" fill={potShade} opacity=".7" />
      <rect x="-24" y="-40" width="48" height="7" rx="3.500" fill={pot} />
    </g>
  );
}

// A trailing vine hanging down from (x, y).
export function Vine({ x, y, length, seed = "v", sway = 16 }: { x: number; y: number; length: number; seed?: string; sway?: number }) {
  const r = rngFor("vine", seed);
  const count = Math.max(4, Math.floor(length / 17));
  const pts = Array.from({ length: count }, (_, i) => {
    const t = (i + 1) / count;
    return { px: Math.sin(t * 5 + r() * 2) * sway * t, py: t * length, side: i % 2 ? 1 : -1, len: 15 + r() * 13, color: GREENS[Math.floor(r() * GREENS.length)], tilt: r() * 30 };
  });
  const stem = pts.map((p) => `L${p.px.toFixed(1)} ${p.py.toFixed(1)}`).join("");
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={`M0 0${stem}`} fill="none" stroke="#3b6b38" strokeWidth="2.200" strokeLinecap="round" />
      {pts.map((p, i) => (
        <path
          key={i}
          d={leafPath(p.len, 0.34)}
          fill={p.color}
          transform={`translate(${p.px.toFixed(1)} ${p.py.toFixed(1)}) rotate(${n(p.side > 0 ? 25 + p.tilt : 155 - p.tilt)})`}
        />
      ))}
    </g>
  );
}

// Hazy city on the horizon. Baseline at y; draws upward.
export function Skyline({ x, y, width, seed = "s", color = "#d98a7c", opacity = 0.7, maxH = 120 }: {
  x: number; y: number; width: number; seed?: string; color?: string; opacity?: number; maxH?: number;
}) {
  const r = rngFor("sky", seed);
  const rects: { bx: number; w: number; h: number }[] = [];
  let bx = 0;
  while (bx < width) {
    const w = 14 + r() * 30;
    const tower = r() < 0.16;
    rects.push({ bx, w, h: (tower ? 0.65 + r() * 0.35 : 0.18 + r() * 0.34) * maxH });
    bx += w + r() * 5;
  }
  return (
    <g transform={`translate(${x} ${y})`} fill={color} opacity={opacity}>
      {rects.map((b, i) => (
        <rect key={i} x={b.bx.toFixed(1)} y={(-b.h).toFixed(1)} width={b.w.toFixed(1)} height={b.h.toFixed(1)} rx="1.500" />
      ))}
    </g>
  );
}

// A little screen with a chart line that redraws itself.
export function ChartScreen({
  x, y, w, h, seed = "c", animated = true, color = "#4ade80", delay = 0, bars = false,
}: {
  x: number; y: number; w: number; h: number; seed?: string; animated?: boolean; color?: string; delay?: number; bars?: boolean;
}) {
  const r = rngFor("chart", seed);
  const steps = 9;
  const pts: string[] = [];
  for (let i = 0, v = 0.5; i < steps; i++) {
    v = Math.min(0.9, Math.max(0.12, v + (r() - 0.42) * 0.36));
    pts.push(`${(6 + (i / (steps - 1)) * (w - 12)).toFixed(1)} ${(h - 6 - v * (h - 16)).toFixed(1)}`);
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-4" y="-4" width={w + 8} height={h + 8} rx="6" fill="#16181b" />
      <rect width={w} height={h} rx="3" fill="#0a161d" />
      <g className={animated ? "animate-flicker" : undefined} style={animated ? { animationDelay: `${delay + 1.3}s` } : undefined}>
        <path d={`M5 ${h * 0.33}h${w - 10}M5 ${h * 0.66}h${w - 10}`} stroke="#fff" strokeOpacity=".08" strokeWidth="1" />
        {bars &&
          Array.from({ length: 8 }, (_, i) => {
            const bh = 4 + r() * (h * 0.3);
            return <rect key={i} x={n(6 + i * ((w - 12) / 8))} y={n(h - 4 - bh)} width={n((w - 12) / 8 - 3)} height={n(bh)} fill="#5eead4" opacity=".35" />;
          })}
        <path
          d={`M${pts.join("L")}`}
          pathLength={1}
          fill="none"
          stroke={color}
          strokeWidth="2.600"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="1"
          className={animated ? "animate-chart-tick" : undefined}
          style={animated ? { animationDelay: `${delay}s` } : undefined}
        />
      </g>
      <path d={`M0 0h${w * 0.5}L${w * 0.2} ${h}H0z`} fill="#fff" opacity=".05" />
    </g>
  );
}

export function Books({ x, y, seed = "b", count = 6, height = 44 }: { x: number; y: number; seed?: string; count?: number; height?: number }) {
  const r = rngFor("books", seed);
  const colors = ["#c9584c", "#e7a33e", "#3f7d8c", "#5a6b88", "#f3ece2", "#8d6df0", "#2f6b3a", "#b97d55"];
  const spines: { bx: number; w: number; h: number; fill: string }[] = [];
  for (let i = 0, bx = 0; i < count; i++) {
    const w = 8 + r() * 8;
    const h = height * (0.72 + r() * 0.28);
    spines.push({ bx, w, h, fill: colors[Math.floor(r() * colors.length)] });
    bx += w + 1.5;
  }
  return (
    <g transform={`translate(${x} ${y})`}>
      {spines.map((b, i) => (
        <rect key={i} x={n(b.bx)} y={n(-b.h)} width={n(b.w)} height={n(b.h)} rx="1.500" fill={b.fill} />
      ))}
    </g>
  );
}
