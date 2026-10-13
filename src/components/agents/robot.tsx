import { useId } from "react";
import { pick, rngFor } from "@/lib/rng";
import type { RoleKey } from "@/lib/types";

// Original vector characters. One parametric head and body is used for the six
// office roles and, with seeded traits, for all 2,000 agent avatars.

export type HeadShape = "square" | "round" | "wide" | "tall";
export type Antenna = "ball" | "twin" | "dish" | "coil" | "bolt" | "flat" | "coin";
export type Eyes = "dots" | "visor" | "round" | "sleepy" | "pixel" | "wink";
export type Mouth = "smile" | "line" | "grill" | "o" | "none";
export type Accessory = "none" | "headphones" | "headset" | "glasses" | "monocle" | "bowtie" | "cap";
export type Prop = "none" | "tablet" | "key" | "phone" | "folder" | "clipboard";
export type Pose = "idle" | "type" | "wave" | "hold";

export interface Look {
  body: string;
  dark: string;
  light: string;
  eye: string;
  head: HeadShape;
  antenna: Antenna;
  eyes: Eyes;
  mouth: Mouth;
  accessory: Accessory;
}

const SHAPES: Record<HeadShape, { x: number; y: number; w: number; h: number; rx: number }> = {
  square: { x: 14, y: 26, w: 72, h: 62, rx: 18 },
  round: { x: 13, y: 24, w: 74, h: 66, rx: 33 },
  wide: { x: 7, y: 32, w: 86, h: 54, rx: 23 },
  tall: { x: 20, y: 18, w: 60, h: 72, rx: 21 },
};

const SCREEN = "#111a22";
const TRIM = "#23262b";

export const ROLE_LOOKS: Record<RoleKey, Look & { prop: Prop; pose: Pose }> = {
  trader: {
    body: "#2fb98a", dark: "#1c7d5f", light: "#7fe6bf", eye: "#b9ffe9",
    head: "wide", antenna: "twin", eyes: "visor", mouth: "line", accessory: "headset", prop: "none", pose: "type",
  },
  treasurer: {
    body: "#e9a53c", dark: "#a96a16", light: "#ffd88a", eye: "#fff3c4",
    head: "square", antenna: "coin", eyes: "round", mouth: "smile", accessory: "none", prop: "key", pose: "hold",
  },
  scout: {
    body: "#3f9cf2", dark: "#2264b3", light: "#9bd0ff", eye: "#d6f0ff",
    head: "round", antenna: "dish", eyes: "round", mouth: "o", accessory: "headphones", prop: "phone", pose: "hold",
  },
  archivist: {
    body: "#8d6df0", dark: "#5a3fb5", light: "#c7b6ff", eye: "#ece5ff",
    head: "tall", antenna: "coil", eyes: "sleepy", mouth: "smile", accessory: "glasses", prop: "folder", pose: "hold",
  },
  concierge: {
    body: "#f2687f", dark: "#b53a52", light: "#ffb3c0", eye: "#ffe3e8",
    head: "round", antenna: "ball", eyes: "wink", mouth: "smile", accessory: "bowtie", prop: "none", pose: "wave",
  },
  auditor: {
    body: "#5a6b88", dark: "#35425a", light: "#a9b8d1", eye: "#ffd9a0",
    head: "square", antenna: "flat", eyes: "pixel", mouth: "grill", accessory: "monocle", prop: "clipboard", pose: "hold",
  },
};

const HEADS: HeadShape[] = ["square", "round", "wide", "tall"];
const ANTENNAS: Antenna[] = ["ball", "twin", "dish", "coil", "bolt", "flat", "coin"];
const EYES: Eyes[] = ["dots", "visor", "round", "sleepy", "pixel", "wink"];
const MOUTHS: Mouth[] = ["smile", "line", "grill", "o", "none"];
const ACCESSORIES: Accessory[] = ["none", "none", "headphones", "headset", "glasses", "monocle", "bowtie", "cap"];
const EYE_GLOWS = ["#b9ffe9", "#fff3c4", "#ffe3e8", "#d8ffb5", "#ffffff", "#d6f0ff"];

export interface AvatarLook extends Look {
  bg: string;
  bg2: string;
  pattern: number;
}

// Deterministic per agent number, so #0042 looks the same for everyone, always.
export function lookForId(id: number): AvatarLook {
  const r = rngFor("look", id);
  const hue = Math.floor(r() * 360);
  const bgHue = (hue + 140 + Math.floor(r() * 80)) % 360;
  return {
    body: `hsl(${hue} 64% 56%)`,
    dark: `hsl(${hue} 58% 36%)`,
    light: `hsl(${hue} 88% 76%)`,
    eye: pick(r, EYE_GLOWS),
    head: pick(r, HEADS),
    antenna: pick(r, ANTENNAS),
    eyes: pick(r, EYES),
    mouth: pick(r, MOUTHS),
    accessory: pick(r, ACCESSORIES),
    bg: `hsl(${bgHue} 62% 89%)`,
    bg2: `hsl(${bgHue} 58% 79%)`,
    pattern: Math.floor(r() * 4),
  };
}

function AntennaArt({ look, top }: { look: Look; top: number }) {
  const y = top;
  switch (look.antenna) {
    case "ball":
      return (
        <g>
          <rect x="48.500" y={y - 13} width="3" height="14" fill={TRIM} />
          <circle cx="50" cy={y - 16} r="5.500" fill={look.light} />
          <circle cx="48.400" cy={y - 17.600} r="1.600" fill="#fff" opacity=".7" />
        </g>
      );
    case "twin":
      return (
        <g>
          <path d={`M38 ${y + 1} 33 ${y - 13}M62 ${y + 1} 67 ${y - 13}`} stroke={TRIM} strokeWidth="3" strokeLinecap="round" />
          <circle cx="33" cy={y - 14} r="3.600" fill={look.light} />
          <circle cx="67" cy={y - 14} r="3.600" fill={look.light} />
        </g>
      );
    case "dish":
      return (
        <g>
          <rect x="48.500" y={y - 9} width="3" height="10" fill={TRIM} />
          <path d={`M37 ${y - 16}a13 9 0 0 0 26 0z`} fill={look.light} />
          <circle cx="50" cy={y - 19} r="2.400" fill={look.dark} />
        </g>
      );
    case "coil":
      return (
        <g>
          <path
            d={`M50 ${y + 1}c-7 -3 7 -5 0 -8s7 -5 0 -8`}
            fill="none" stroke={TRIM} strokeWidth="2.600" strokeLinecap="round"
          />
          <circle cx="50" cy={y - 18} r="4" fill={look.light} />
        </g>
      );
    case "bolt":
      return <path d={`M53 ${y - 20} 44 ${y - 8}h6l-3 9 9-12h-6z`} fill={look.light} stroke={TRIM} strokeWidth="1.400" strokeLinejoin="round" />;
    case "flat":
      return (
        <g>
          <rect x="48.500" y={y - 8} width="3" height="9" fill={TRIM} />
          <rect x="39" y={y - 12} width="22" height="5" rx="2.500" fill={look.light} />
        </g>
      );
    case "coin":
      return (
        <g>
          <rect x="48.500" y={y - 7} width="3" height="8" fill={TRIM} />
          <circle cx="50" cy={y - 14} r="7.500" fill="#ffd35c" stroke="#b9820f" strokeWidth="1.600" />
          <path d={`M50 ${y - 18}v8`} stroke="#b9820f" strokeWidth="1.800" strokeLinecap="round" />
        </g>
      );
  }
}

function EyesArt({ look, cx, cy, gap }: { look: Look; cx: number; cy: number; gap: number }) {
  const l = cx - gap;
  const r = cx + gap;
  switch (look.eyes) {
    case "dots":
      return <path d={`M${l} ${cy}h.01M${r} ${cy}h.01`} stroke={look.eye} strokeWidth="9" strokeLinecap="round" />;
    case "visor":
      return (
        <g>
          <rect x={l - 8} y={cy - 5} width={gap * 2 + 16} height="10" rx="5" fill={look.eye} opacity=".28" />
          <rect x={l - 5} y={cy - 3} width="11" height="6" rx="3" fill={look.eye} />
          <rect x={r - 6} y={cy - 3} width="11" height="6" rx="3" fill={look.eye} />
        </g>
      );
    case "round":
      return (
        <g>
          <circle cx={l} cy={cy} r="7.500" fill={look.eye} />
          <circle cx={r} cy={cy} r="7.500" fill={look.eye} />
          <circle cx={l + 1.200} cy={cy + 0.800} r="3.200" fill={SCREEN} />
          <circle cx={r + 1.200} cy={cy + 0.800} r="3.200" fill={SCREEN} />
          <circle cx={l + 2.600} cy={cy - 1} r="1.100" fill="#fff" />
          <circle cx={r + 2.600} cy={cy - 1} r="1.100" fill="#fff" />
        </g>
      );
    case "sleepy":
      return (
        <path
          d={`M${l - 6} ${cy - 1}a6 6 0 0 0 12 0M${r - 6} ${cy - 1}a6 6 0 0 0 12 0`}
          fill="none" stroke={look.eye} strokeWidth="3.200" strokeLinecap="round"
        />
      );
    case "pixel":
      return (
        <g fill={look.eye}>
          <rect x={l - 4.500} y={cy - 4.500} width="9" height="9" rx="1.500" />
          <rect x={r - 4.500} y={cy - 4.500} width="9" height="9" rx="1.500" />
        </g>
      );
    case "wink":
      return (
        <g>
          <circle cx={l} cy={cy} r="5" fill={look.eye} />
          <path d={`M${r - 6} ${cy + 1}a6 5 0 0 1 12 0`} fill="none" stroke={look.eye} strokeWidth="3.200" strokeLinecap="round" />
        </g>
      );
  }
}

function MouthArt({ look, cx, cy }: { look: Look; cx: number; cy: number }) {
  switch (look.mouth) {
    case "smile":
      return <path d={`M${cx - 7} ${cy - 1}a7 5.500 0 0 0 14 0`} fill="none" stroke={look.eye} strokeWidth="2.600" strokeLinecap="round" />;
    case "line":
      return <path d={`M${cx - 6} ${cy}h12`} stroke={look.eye} strokeWidth="2.600" strokeLinecap="round" />;
    case "grill":
      return <path d={`M${cx - 7} ${cy - 2.500}v5M${cx - 2.300} ${cy - 2.500}v5M${cx + 2.300} ${cy - 2.500}v5M${cx + 7} ${cy - 2.500}v5`} stroke={look.eye} strokeWidth="2.200" strokeLinecap="round" />;
    case "o":
      return <circle cx={cx} cy={cy} r="3.200" fill="none" stroke={look.eye} strokeWidth="2.400" />;
    case "none":
      return null;
  }
}

interface HeadProps {
  look: Look;
  animated?: boolean;
  delay?: number;
}

// Drawn in a 100 x 100 box (antenna may poke a little above y = 0).
export function RobotHead({ look, animated = false, delay = 0 }: HeadProps) {
  const uid = useId();
  const s = SHAPES[look.head];
  const fx = s.x + 9;
  const fy = s.y + 12;
  const fw = s.w - 18;
  const fh = s.h - 25;
  const cx = 50;
  const eyeY = fy + fh * 0.42;
  const gap = Math.min(fw * 0.25, 15);
  const earY = s.y + s.h / 2 - 9;

  return (
    <g>
      <defs>
        <linearGradient id={`${uid}h`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={look.light} />
          <stop offset=".5" stopColor={look.body} />
          <stop offset="1" stopColor={look.dark} />
        </linearGradient>
      </defs>
      <AntennaArt look={look} top={s.y} />
      <rect x={s.x - 5} y={earY} width="8" height="18" rx="3.500" fill={look.dark} />
      <rect x={s.x + s.w - 3} y={earY} width="8" height="18" rx="3.500" fill={look.dark} />
      <rect x={s.x} y={s.y} width={s.w} height={s.h} rx={s.rx} fill={`url(#${uid}h)`} />
      <ellipse cx={s.x + s.w * 0.3} cy={s.y + 7} rx={s.w * 0.16} ry="3" fill="#fff" opacity=".4" />
      <rect x={fx} y={fy} width={fw} height={fh} rx={Math.min(s.rx - 6, 15)} fill={SCREEN} />
      <path d={`M${fx + 6} ${fy + 5}h${fw * 0.35}`} stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".12" />
      <g
        className={animated ? "animate-blink" : undefined}
        style={animated ? { transformBox: "fill-box", transformOrigin: "50% 50%", animationDelay: `${delay}s` } : undefined}
      >
        <EyesArt look={look} cx={cx} cy={eyeY} gap={gap} />
      </g>
      <MouthArt look={look} cx={cx} cy={fy + fh * 0.8} />

      {look.accessory === "headphones" && (
        <g>
          <path d={`M${s.x - 2} ${earY + 4}C${s.x - 2} ${s.y - 14} ${s.x + s.w + 2} ${s.y - 14} ${s.x + s.w + 2} ${earY + 4}`} fill="none" stroke={TRIM} strokeWidth="5" strokeLinecap="round" />
          <rect x={s.x - 9} y={earY - 3} width="13" height="24" rx="6" fill={TRIM} />
          <rect x={s.x + s.w - 4} y={earY - 3} width="13" height="24" rx="6" fill={TRIM} />
        </g>
      )}
      {look.accessory === "headset" && (
        <g>
          <rect x={s.x - 9} y={earY - 3} width="13" height="24" rx="6" fill={TRIM} />
          <path d={`M${s.x - 3} ${earY + 19}q2 ${fy + fh - earY - 8} ${fx + 8 - s.x} ${fy + fh - earY - 12}`} fill="none" stroke={TRIM} strokeWidth="2.600" strokeLinecap="round" />
          <circle cx={fx + 6} cy={fy + fh + 6} r="3.400" fill={TRIM} />
        </g>
      )}
      {look.accessory === "glasses" && (
        <g fill="#fff" fillOpacity=".1" stroke="#f4eee7" strokeWidth="2.400">
          <circle cx={cx - gap} cy={eyeY} r="10" />
          <circle cx={cx + gap} cy={eyeY} r="10" />
          <path d={`M${cx - gap + 10} ${eyeY}h${gap * 2 - 20}`} fill="none" />
        </g>
      )}
      {look.accessory === "monocle" && (
        <g fill="none" stroke="#ffd35c" strokeWidth="2.400">
          <circle cx={cx + gap} cy={eyeY} r="10.500" fill="#fff" fillOpacity=".1" />
          <path d={`M${cx + gap + 8} ${eyeY + 7}q9 14 4 ${s.y + s.h - eyeY}`} strokeWidth="1.600" />
        </g>
      )}
      {look.accessory === "bowtie" && (
        <g transform={`translate(50 ${s.y + s.h + 5})`}>
          <path d="M0 0-12-7v14zM0 0 12-7v14z" fill="#1b1c1f" />
          <circle r="3.200" fill="#3a3b3d" />
        </g>
      )}
      {look.accessory === "cap" && (
        <g>
          <path d={`M${s.x + 2} ${s.y + 13}a${s.w / 2 - 2} ${Math.min(s.rx, 20)} 0 0 1 ${s.w - 4} 0z`} fill={TRIM} />
          <rect x={s.x + s.w * 0.45} y={s.y + 10} width={s.w * 0.68} height="6" rx="3" fill={TRIM} />
        </g>
      )}
    </g>
  );
}

function Arm({ x, y, angle, look, animation, delay = 0, length = 36 }: {
  x: number; y: number; angle: number; look: Look; animation?: "typing" | "wave"; delay?: number; length?: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle})`}>
      <g
        className={animation === "typing" ? "animate-typing" : animation === "wave" ? "animate-[typing_1.1s_ease-in-out_infinite]" : undefined}
        style={animation ? { transformBox: "fill-box", transformOrigin: "50% 8%", animationDelay: `${delay}s` } : undefined}
      >
        <rect x="-7" y="-5" width="14" height={length} rx="7" fill={look.body} />
        <rect x="-7" y="-5" width="14" height={length} rx="7" fill={look.dark} opacity=".22" />
        <circle cx="0" cy={length - 5} r="8" fill={look.dark} />
        <circle cx="-2" cy={length - 7} r="2.400" fill="#fff" opacity=".25" />
      </g>
    </g>
  );
}

function PropArt({ prop }: { prop: Prop }) {
  switch (prop) {
    case "tablet":
      return (
        <g transform="translate(40 122)">
          <rect width="40" height="27" rx="4" fill="#1b1c1f" />
          <path d="M5 19 13 12l6 5 8-10 8 6" fill="none" stroke="#4ade80" strokeWidth="2.400" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case "key":
      return (
        <g transform="translate(60 132) rotate(-18)">
          <circle cx="-15" cy="0" r="10" fill="none" stroke="#ffd35c" strokeWidth="5" />
          <path d="M-5 0h30M15 0v9M23 0v7" fill="none" stroke="#ffd35c" strokeWidth="5" strokeLinecap="round" />
        </g>
      );
    case "phone":
      return (
        <g transform="translate(50 116) rotate(6)">
          <rect width="22" height="36" rx="5" fill="#1b1c1f" />
          <rect x="2.500" y="3" width="17" height="27" rx="2.500" fill="#9bd0ff" />
          <path d="M5.500 9h11M5.500 14h8M5.500 19h10" stroke="#2264b3" strokeWidth="1.800" strokeLinecap="round" />
        </g>
      );
    case "folder":
      return (
        <g transform="translate(36 120)">
          <path d="M0 6a4 4 0 0 1 4-4h14l5 5h21a4 4 0 0 1 4 4v19a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4z" fill="#f1c56d" />
          <path d="M0 13h48v17a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4z" fill="#f7d98d" />
          <rect x="15" y="19" width="18" height="6" rx="2" fill="#fff" opacity=".8" />
        </g>
      );
    case "clipboard":
      return (
        <g transform="translate(42 112) rotate(-5)">
          <rect width="36" height="44" rx="5" fill="#c98a4b" />
          <rect x="3.500" y="6" width="29" height="34.500" rx="2.500" fill="#fffaf0" />
          <rect x="11" y="-3" width="14" height="8" rx="3" fill="#6b7280" />
          <path d="m7 15 2.500 2.500L14 13M7 24l2.500 2.500L14 22" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="m7 31 5 5m0-5-5 5" stroke="#e5484d" strokeWidth="2" strokeLinecap="round" />
          <path d="M18 16h10M18 25h10M18 34h7" stroke="#9a9b9a" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "none":
      return null;
  }
}

const ARM_ANGLES: Record<Pose, [number, number]> = {
  idle: [9, -9],
  type: [-30, 30],
  wave: [10, -152],
  hold: [-34, 34],
};

interface RobotProps {
  look: Look;
  pose?: Pose;
  prop?: Prop;
  seated?: boolean;
  animated?: boolean;
  delay?: number;
}

// Full figure in a 120 x 184 box. `seated` drops the legs so a desk can cover the rest.
export function Robot({ look, pose = "idle", prop = "none", seated = false, animated = true, delay = 0 }: RobotProps) {
  const uid = useId();
  const [la, ra] = ARM_ANGLES[pose];
  const armsInFront = pose === "type" || pose === "hold";
  const arms = (
    <>
      <Arm x={32} y={110} angle={la} look={look} animation={animated && pose === "type" ? "typing" : undefined} delay={delay} length={armsInFront ? 32 : 36} />
      <Arm
        x={88} y={110} angle={ra} look={look} length={armsInFront ? 32 : 36}
        animation={animated ? (pose === "type" ? "typing" : pose === "wave" ? "wave" : undefined) : undefined}
        delay={delay + 0.21}
      />
    </>
  );
  return (
    <g>
      <defs>
        <linearGradient id={`${uid}b`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={look.body} />
          <stop offset="1" stopColor={look.dark} />
        </linearGradient>
      </defs>
      {!seated && (
        <g>
          <rect x="40" y="150" width="15" height="24" rx="6" fill={look.dark} />
          <rect x="65" y="150" width="15" height="24" rx="6" fill={look.dark} />
          <rect x="33" y="169" width="25" height="13" rx="6.500" fill={TRIM} />
          <rect x="62" y="169" width="25" height="13" rx="6.500" fill={TRIM} />
        </g>
      )}
      <g
        className={animated ? "animate-team-bob" : undefined}
        style={animated ? { transformBox: "fill-box", animationDelay: `${delay}s` } : undefined}
      >
        {!armsInFront && arms}
        <rect x="52" y="92" width="16" height="12" fill={TRIM} />
        <rect x="27" y="100" width="66" height="60" rx="22" fill={`url(#${uid}b)`} />
        <rect x="44" y="114" width="32" height="22" rx="7" fill="#fff" opacity=".2" />
        <circle cx="52" cy="125" r="3.400" fill={look.eye} />
        <path d="M60 122h10M60 128h7" stroke={look.dark} strokeWidth="2.400" strokeLinecap="round" />
        <g transform="translate(10 0)">
          <RobotHead look={look} animated={animated} delay={delay * 1.7 + 0.4} />
        </g>
        <PropArt prop={prop} />
        {armsInFront && arms}
      </g>
    </g>
  );
}

// Standalone head-and-shoulders crop, used for team cards.
export function RoleBust({ role, className = "" }: { role: RoleKey; className?: string }) {
  const look = ROLE_LOOKS[role];
  return (
    <svg viewBox="-4 -8 108 108" className={className} aria-hidden="true">
      <rect x="18" y="86" width="64" height="40" rx="20" fill={look.dark} />
      <RobotHead look={look} />
    </svg>
  );
}

export function RoleFigure({ role, className = "", animated = true, delay = 0 }: { role: RoleKey; className?: string; animated?: boolean; delay?: number }) {
  const look = ROLE_LOOKS[role];
  return (
    <svg viewBox="-12 -24 144 212" className={className} aria-hidden="true">
      <ellipse cx="60" cy="181" rx="38" ry="5" fill="#46280c" opacity=".22" />
      <Robot look={look} pose={look.pose} prop={look.prop} animated={animated} delay={delay} />
    </svg>
  );
}

// NFT avatar: same head, traits seeded from the agent number.
export function AgentAvatar({ id, size = 48, className = "" }: { id: number; size?: number; className?: string }) {
  const uid = useId();
  const look = lookForId(id);
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`shrink-0 rounded-full border border-rule bg-paper-2 ${className}`}
      role="img"
      aria-label={`Avatar of agent ${id}`}
    >
      <defs>
        <linearGradient id={`${uid}g`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={look.bg} />
          <stop offset="1" stopColor={look.bg2} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${uid}g)`} />
      {look.pattern === 1 && (
        <g fill="#fff" opacity=".3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path key={i} d="M50 54 44 -30h12z" transform={`rotate(${i * 60 + 15} 50 54)`} />
          ))}
        </g>
      )}
      {look.pattern === 2 && (
        <g fill="#fff" opacity=".45">
          {[12, 37, 62, 87].map((x) => [10, 34, 58].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.600" />))}
        </g>
      )}
      {look.pattern === 3 && <circle cx="50" cy="52" r="40" fill="#fff" opacity=".28" />}
      <rect x="20" y="82" width="60" height="40" rx="20" fill={look.dark} />
      <g transform="translate(12 12) scale(.76)">
        <RobotHead look={look} />
      </g>
    </svg>
  );
}
