import { PROJECT_NAME } from "@/config/site";
import { ROLE_LOOKS, Robot } from "@/components/agents/robot";
import type { RoleKey } from "@/lib/types";
import { Books, ChartScreen, Plant, Skyline } from "./parts";

// The home scene: an original front-on office on a 2071 x 940 canvas, drawn in
// three layers so they can drift apart slightly with the mouse.
//   back  - wall, windows, shelves, wall monitors, floor
//   mid   - the six agents and whatever sits behind their desks
//   front - desk fronts, the spare chair and foreground plants
// The wall screen's HTML overlay goes at SCREEN; hover targets use HOTSPOTS.

export const OFFICE = { w: 2071, h: 940 } as const;
export const SCREEN = { x: 874, y: 222, w: 174, h: 294 } as const;

export const HOTSPOTS: { role: RoleKey; x: number; y: number; w: number; h: number }[] = [
  { role: "scout", x: 262, y: 366, w: 276, h: 226 },
  { role: "trader", x: 552, y: 366, w: 276, h: 226 },
  { role: "archivist", x: 1086, y: 366, w: 212, h: 214 },
  { role: "auditor", x: 1300, y: 366, w: 150, h: 214 },
  { role: "treasurer", x: 36, y: 596, w: 468, h: 300 },
  { role: "concierge", x: 592, y: 596, w: 462, h: 300 },
];

const svgProps = {
  viewBox: `0 0 ${OFFICE.w} ${OFFICE.h}`,
  preserveAspectRatio: "none",
  "aria-hidden": true,
  overflow: "visible",
} as const;

const layerClass = "pointer-events-none absolute inset-0 h-full w-full select-none";

function Lamp({ x, drop, p }: { x: number; drop: number; p: string }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <path d={`M0 -60V${drop}`} stroke="#3a2a22" strokeWidth="3" />
      <ellipse cx="0" cy={drop + 46} rx="74" ry="26" fill="#fff0c8" opacity=".5" filter={`url(#${p}-soft)`} />
      <path d={`M-30 ${drop + 34}q4-34 30-34t30 34z`} fill="#2b2622" />
      <ellipse cx="0" cy={drop + 34} rx="30" ry="6" fill="#ffe7ae" />
    </g>
  );
}

// `p` prefixes gradient ids so two copies of the scene can share a page.
export function OfficeBack({ animated = true, p = "of" }: { animated?: boolean; p?: string }) {
  return (
    <svg {...svgProps} className={layerClass}>
      <defs>
        <linearGradient id={`${p}-sky`} x1="0" y1="0" x2=".35" y2="1">
          <stop offset="0" stopColor="#fff8ec" />
          <stop offset=".45" stopColor="#ffe9c6" />
          <stop offset=".78" stopColor="#ffcf96" />
          <stop offset="1" stopColor="#f6a98a" />
        </linearGradient>
        <linearGradient id={`${p}-wall`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6dab6" />
          <stop offset="1" stopColor="#dcae84" />
        </linearGradient>
        <linearGradient id={`${p}-floor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e7b98c" />
          <stop offset="1" stopColor="#b98558" />
        </linearGradient>
        <linearGradient id={`${p}-column`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#9a6a48" />
          <stop offset="1" stopColor="#7a4f33" />
        </linearGradient>
        <radialGradient id={`${p}-sun`} cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fffdf0" />
          <stop offset=".3" stopColor="#fff0b8" stopOpacity=".85" />
          <stop offset="1" stopColor="#ffd98a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`${p}-screen`} cx=".25" cy="0" r="1.1">
          <stop offset="0" stopColor="#12303a" />
          <stop offset=".45" stopColor="#0a161d" />
          <stop offset="1" stopColor="#060a0e" />
        </radialGradient>
        <filter id={`${p}-soft`} x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      {/* wall */}
      <rect x="-80" y="-60" width="2231" height="640" fill={`url(#${p}-wall)`} />

      {/* big window, left */}
      <rect x="-80" y="-60" width="880" height="625" fill={`url(#${p}-sky)`} />
      <ellipse cx="560" cy="300" rx="170" ry="13" fill="#fff" opacity=".5" />
      <ellipse cx="330" cy="372" rx="120" ry="9" fill="#fff" opacity=".45" />
      <circle cx="668" cy="452" r="120" fill={`url(#${p}-sun)`} />
      <circle cx="668" cy="452" r="24" fill="#fffdf0" />
      <Skyline x={-80} y={548} width={880} seed="of-far" color="#efab93" opacity={0.5} maxH={112} />
      <Skyline x={-80} y={552} width={880} seed="of-near" color="#d98478" opacity={0.55} maxH={70} />
      <rect x="182" y="-60" width="8" height="625" fill="#6a4632" />
      <rect x="-80" y="398" width="880" height="6" fill="#6a4632" opacity=".85" />
      <rect x="-80" y="546" width="884" height="19" fill="#7a5038" />
      <rect x="786" y="-60" width="26" height="625" fill="#5e3c2a" />

      {/* feature column with the wall screen */}
      <rect x="840" y="-60" width="242" height="625" fill={`url(#${p}-column)`} />
      {[870, 900, 930, 960, 990, 1020, 1050].map((x) => (
        <path key={x} d={`M${x} -60V565`} stroke="#5e3c2a" strokeOpacity=".35" strokeWidth="2" />
      ))}
      <rect x="862" y="210" width="198" height="318" rx="8" fill="#5eead4" opacity=".16" filter={`url(#${p}-soft)`} />
      <rect x="868" y="216" width="186" height="306" rx="7" fill="#05070a" />
      <rect x="874" y="222" width="174" height="294" rx="3" fill={`url(#${p}-screen)`} />
      <path d="M886 250h80M886 268h150M886 300h150M886 346h150M886 392h150M886 438h150" stroke="#5eead4" strokeOpacity=".18" strokeWidth="3" strokeLinecap="round" />

      {/* right wall: monitors, shelves, clock, caps board */}
      <ChartScreen x={1108} y={92} w={140} h={88} seed="of-m1" animated={animated} />
      <ChartScreen x={1272} y={92} w={140} h={88} seed="of-m2" animated={animated} color="#5eead4" delay={2.2} bars />
      <rect x="1100" y="270" width="196" height="11" rx="3" fill="#8a5c3e" />
      <rect x="1100" y="281" width="196" height="5" fill="#5e3c2a" opacity=".35" />
      <Books x={1112} y={270} seed="of-b1" count={6} height={46} />
      <Plant x={1206} y={271} scale={0.62} seed="of-s1" leaves={8} />
      <g transform="translate(1232 228)">
        <rect width="54" height="42" rx="4" fill="#e4c79d" />
        <rect width="54" height="11" rx="4" fill="#c9a877" />
        <rect x="16" y="20" width="22" height="9" rx="2" fill="#fffaf0" />
      </g>

      <g transform="translate(1540 150)">
        <circle r="34" fill="#3a2a22" />
        <circle r="29" fill="#fffaf0" />
        <path d="M0 0V-19M0 0l13 7" stroke="#2b2622" strokeWidth="3.400" strokeLinecap="round" />
        <circle r="3" fill="#c23a32" />
      </g>

      <g transform="translate(1312 204) scale(.9)">
        <rect width="150" height="176" rx="10" fill="#fffaf0" />
        <rect width="150" height="34" rx="10" fill="#35425a" />
        <rect y="20" width="150" height="14" fill="#35425a" />
        <path d="M14 18h56" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity=".9" />
        <path d="M14 58h44M14 104h58" stroke="#9a9b9a" strokeWidth="4" strokeLinecap="round" />
        <rect x="14" y="68" width="122" height="13" rx="6.500" fill="#efe6d8" />
        <rect
          x="14" y="68" width="74" height="13" rx="6.500" fill="#22c55e"
          className={animated ? "animate-pm-fill" : undefined}
          style={{ transformBox: "fill-box", transformOrigin: "0 50%" }}
        />
        <rect x="14" y="114" width="122" height="13" rx="6.500" fill="#efe6d8" />
        <rect x="14" y="114" width="100" height="13" rx="6.500" fill="#e7a33e" />
        <path d="m16 150 6 6 11-12" fill="none" stroke="#16a34a" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M44 151h70" stroke="#9a9b9a" strokeWidth="4" strokeLinecap="round" />
      </g>

      {/* far-right window (only visible on wide screens) */}
      <rect x="1764" y="-60" width="400" height="625" fill={`url(#${p}-sky)`} />
      <Skyline x={1764} y={548} width={400} seed="of-far2" color="#efab93" opacity={0.5} maxH={130} />
      <rect x="1752" y="-60" width="24" height="625" fill="#5e3c2a" />
      <rect x="1920" y="-60" width="8" height="625" fill="#6a4632" />
      <rect x="1764" y="546" width="400" height="19" fill="#7a5038" />

      <rect x="812" y="553" width="940" height="12" fill="#c79a72" />

      {/* floor */}
      <rect x="-80" y="565" width="2231" height="460" fill={`url(#${p}-floor)`} />
      <path d="M-80 612h2231M-80 676h2231M-80 762h2231M-80 868h2231" stroke="#8f5a33" strokeOpacity=".14" strokeWidth="3" />
      <path d="M-80 565h860l-300 420H-80z" fill="#fff3d4" opacity=".34" />
      <path d="M1776 565h380v420h-140z" fill="#fff3d4" opacity=".28" />
      <ellipse cx="822" cy="800" rx="372" ry="104" fill="#f3dcbd" opacity=".85" />
      <ellipse cx="822" cy="800" rx="344" ry="90" fill="none" stroke="#d9b48e" strokeWidth="4" strokeDasharray="2 14" strokeLinecap="round" />

      <Lamp x={1190} drop={-22} p={p} />
      <Lamp x={1470} drop={-4} p={p} />
      <Lamp x={1690} drop={-20} p={p} />

      <Plant x={222} y={600} scale={1.5} seed="of-p1" leaves={11} spread={165} tall pot="#f3ece2" />
      <g transform="translate(1492 424)">
        <rect width="216" height="141" rx="6" fill="#8a5c3e" />
        <rect x="8" y="10" width="96" height="121" rx="4" fill="#a06f4c" />
        <rect x="112" y="10" width="96" height="121" rx="4" fill="#a06f4c" />
        <path d="M96 62v18M120 62v18" stroke="#5e3c2a" strokeWidth="4" strokeLinecap="round" />
        <rect x="-6" y="-8" width="228" height="12" rx="4" fill="#6e452c" />
      </g>
      <Plant x={1548} y={418} scale={0.95} seed="of-p2" leaves={10} spread={160} tall pot="#2b2622" potShade="#1b1a18" />
      <Books x={1608} y={416} seed="of-b2" count={5} height={40} />
      <Plant x={1836} y={604} scale={1.9} seed="of-p3" leaves={12} spread={170} tall />
    </svg>
  );
}

function Desk({ x, y, w, h = 66, top = "#eec08f", front = "#c98f5e" }: { x: number; y: number; w: number; h?: number; top?: string; front?: string }) {
  return (
    <g>
      <rect x={x + 10} y={y + 10} width={w - 20} height={h} rx="5" fill={front} />
      <rect x={x + 10} y={y + 10} width={w - 20} height="9" fill="#5e3c2a" opacity=".22" />
      <rect x={x} y={y} width={w} height="13" rx="5" fill={top} />
      <rect x={x} y={y} width={w} height="4" rx="2" fill="#fff" opacity=".35" />
    </g>
  );
}

const Shadow = ({ cx, cy, rx }: { cx: number; cy: number; rx: number }) => (
  <ellipse cx={cx} cy={cy} rx={rx} ry={rx * 0.16} fill="#46280c" opacity=".2" />
);

function Figure({ role, x, y, scale = 1, seated = false, animated, delay }: {
  role: RoleKey; x: number; y: number; scale?: number; seated?: boolean; animated: boolean; delay: number;
}) {
  const look = ROLE_LOOKS[role];
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} style={{ filter: "drop-shadow(0 5px 6px rgba(70, 40, 12, 0.28))" }}>
      <Robot look={look} pose={look.pose} prop={look.prop} seated={seated} animated={animated} delay={delay} />
    </g>
  );
}

export function OfficeMid({ animated = true }: { animated?: boolean }) {
  return (
    <svg {...svgProps} className={layerClass}>
      {/* Scout: reads X at the window desk */}
      <Figure role="scout" x={296} y={370} seated animated={animated} delay={0.3} />
      <Desk x={254} y={526} w={290} />
      <g transform="translate(438 446)">
        <rect x="34" y="62" width="12" height="20" fill="#2b2622" />
        <rect x="18" y="78" width="44" height="6" rx="3" fill="#2b2622" />
        <rect x="-4" y="-4" width="88" height="70" rx="6" fill="#16181b" />
        <rect width="80" height="62" rx="3" fill="#f7fbff" />
        <g className={animated ? "animate-flicker" : undefined}>
          {[8, 26, 44].map((yy) => (
            <g key={yy}>
              <circle cx="10" cy={yy + 5} r="4.500" fill="#9bd0ff" />
              <path d={`M20 ${yy + 2}h48M20 ${yy + 9}h30`} stroke="#b7c2cc" strokeWidth="3" strokeLinecap="round" />
            </g>
          ))}
        </g>
      </g>
      <path d="M270 526v-10a6 6 0 0 1 6-6h18a6 6 0 0 1 6 6v10z" fill="#fffaf0" />

      {/* Trader: two chart screens */}
      <ChartScreen x={566} y={458} w={70} h={52} seed="of-t1" animated={animated} delay={0.8} />
      <ChartScreen x={758} y={458} w={70} h={52} seed="of-t2" animated={animated} color="#f97366" delay={3.1} />
      <path d="M596 510h10v18h-10zM788 510h10v18h-10z" fill="#2b2622" />
      <Figure role="trader" x={636} y={370} seated animated={animated} delay={0} />
      <Desk x={552} y={526} w={290} />
      <rect x="656" y="518" width="80" height="9" rx="3" fill="#2b2c2c" />

      {/* Archivist: by the filing boxes */}
      <Shadow cx={1156} cy={566} rx={44} />
      <Figure role="archivist" x={1096} y={382} animated={animated} delay={0.9} />
      <g transform="translate(1212 470)">
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(${i === 1 ? 6 : 0} ${i * 32})`}>
            <rect width="82" height="30" rx="4" fill={i === 1 ? "#d9b98a" : "#e4c79d"} />
            <rect width="82" height="8" rx="4" fill="#bf9c6a" />
            <rect x="28" y="14" width="26" height="9" rx="2" fill="#fffaf0" />
          </g>
        ))}
      </g>

      {/* Auditor: clipboard, under the caps board */}
      <Shadow cx={1372} cy={566} rx={44} />
      <Figure role="auditor" x={1312} y={382} animated={animated} delay={1.4} />

      {/* Treasurer: front-left, next to the safe */}
      <g transform="translate(364 648)">
        <rect width="132" height="160" rx="12" fill="#4a5568" />
        <rect x="10" y="10" width="112" height="140" rx="8" fill="#5f6b80" />
        <circle cx="66" cy="74" r="27" fill="#3b4557" />
        <circle cx="66" cy="74" r="19" fill="#c8d0dc" />
        <path d="M66 58v32M50 74h32" stroke="#3b4557" strokeWidth="4" strokeLinecap="round" />
        <rect x="100" y="52" width="9" height="44" rx="4.500" fill="#ffd35c" />
        <rect x="14" y="26" width="7" height="18" rx="3" fill="#3b4557" />
        <rect x="14" y="108" width="7" height="18" rx="3" fill="#3b4557" />
      </g>
      <Figure role="treasurer" x={142} y={578} scale={1.5} seated animated={animated} delay={0.6} />

      {/* Concierge: at the front desk */}
      <Figure role="concierge" x={722} y={590} scale={1.5} seated animated={animated} delay={1.1} />
      <g className={animated ? "animate-wb-fade" : undefined} style={animated ? { animationDelay: "1.2s" } : undefined}>
        <path d="M934 604h92a16 16 0 0 1 16 16v28a16 16 0 0 1-16 16h-62l-22 20 6-20h-14a16 16 0 0 1-16-16v-28a16 16 0 0 1 16-16z" fill="#fff" />
        <text x="980" y="645" textAnchor="middle" fontSize="30" fontWeight="700" fill="#0b0c0c" style={{ fontFamily: "var(--font-hand-face), cursive" }}>
          gm!
        </text>
      </g>
    </svg>
  );
}

export function OfficeFront({ p = "of" }: { p?: string }) {
  return (
    <svg {...svgProps} className={`${layerClass} z-[6]`}>
      <defs>
        <linearGradient id={`${p}-deskfront`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d79c69" />
          <stop offset="1" stopColor="#b17446" />
        </linearGradient>
        <filter id={`${p}-blur`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      {/* planter under the wall screen */}
      <g>
        {[878, 906, 936, 966, 996, 1026, 1048].map((x, i) => (
          <Plant key={x} x={x} y={548} scale={0.62 + (i % 3) * 0.08} seed={`of-pl${i}`} pot="#00000000" potShade="#00000000" leaves={6} spread={120} />
        ))}
        <rect x="860" y="512" width="202" height="46" rx="5" fill="#26211e" />
        <rect x="860" y="512" width="202" height="6" rx="3" fill="#fff" opacity=".12" />
        <text
          x="961" y="545" textAnchor="middle" fontSize="25" fontWeight="700" fill="#fbf8f2" letterSpacing="2.500"
          style={{ fontFamily: "var(--font-barlow), sans-serif", textTransform: "uppercase" }}
        >
          {PROJECT_NAME}
        </text>
      </g>

      {/* Treasurer's desk */}
      <rect x="54" y="820" width="432" height="190" rx="6" fill={`url(#${p}-deskfront)`} />
      <rect x="54" y="820" width="432" height="12" fill="#5e3c2a" opacity=".22" />
      <rect x="84" y="852" width="170" height="62" rx="6" fill="#fff" opacity=".14" />
      <rect x="150" y="878" width="38" height="8" rx="4" fill="#5e3c2a" opacity=".5" />
      <rect x="38" y="802" width="464" height="20" rx="7" fill="#f1c896" />
      <rect x="38" y="802" width="464" height="5" rx="2.500" fill="#fff" opacity=".4" />
      {[0, 1, 2, 3].map((i) => (
        <ellipse key={`a${i}`} cx="80" cy={798 - i * 7} rx="19" ry="6.500" fill={i % 2 ? "#f2bd3f" : "#ffd35c"} stroke="#b9820f" strokeWidth="1.400" />
      ))}
      {[0, 1].map((i) => (
        <ellipse key={`b${i}`} cx="122" cy={798 - i * 7} rx="19" ry="6.500" fill={i % 2 ? "#f2bd3f" : "#ffd35c"} stroke="#b9820f" strokeWidth="1.400" />
      ))}

      {/* front desk */}
      <rect x="606" y="832" width="436" height="180" rx="6" fill="#201d1b" />
      <rect x="606" y="832" width="436" height="12" fill="#000" opacity=".3" />
      <rect x="590" y="814" width="468" height="20" rx="7" fill="#f6ead9" />
      <rect x="590" y="814" width="468" height="5" rx="2.500" fill="#fff" opacity=".6" />
      <g transform="translate(772 870)" fill="#fbf8f2">
        <path d="M17 7V2.500" stroke="#fbf8f2" strokeWidth="3" strokeLinecap="round" />
        <circle cx="17" cy="2.500" r="2.600" />
        <rect y="7" width="34" height="23" rx="8" />
        <rect x="7" y="14" width="7" height="8" rx="3.500" fill="#201d1b" />
        <rect x="20" y="14" width="7" height="8" rx="3.500" fill="#201d1b" />
        <text x="46" y="28" fontSize="28" fontWeight="800" letterSpacing="-1" style={{ fontFamily: "var(--font-inter), sans-serif" }}>
          {PROJECT_NAME}
        </text>
      </g>
      <g transform="translate(1004 814)">
        <rect x="-22" y="-5" width="44" height="6" rx="3" fill="#8a5c3e" />
        <path d="M-17-5a17 15 0 0 1 34 0z" fill="#ffd35c" />
        <rect x="-3" y="-25" width="6" height="7" rx="2" fill="#b9820f" />
      </g>

      {/* the spare chair, waiting for the next holder */}
      <g transform="translate(1196 668)">
        <ellipse cx="82" cy="262" rx="92" ry="13" fill="#46280c" opacity=".22" />
        <path d="M82 190v48M82 238 22 258M82 238l60 20M82 238v24" stroke="#2b2c2c" strokeWidth="9" strokeLinecap="round" />
        <circle cx="22" cy="260" r="7" fill="#1b1c1f" />
        <circle cx="142" cy="260" r="7" fill="#1b1c1f" />
        <circle cx="82" cy="264" r="7" fill="#1b1c1f" />
        <rect x="12" y="160" width="140" height="30" rx="14" fill="#3a3b3d" />
        <rect x="70" y="118" width="24" height="50" fill="#2b2c2c" />
        <rect x="18" y="0" width="128" height="132" rx="30" fill="#3f4144" />
        <rect x="32" y="14" width="100" height="104" rx="22" fill="#55585c" />
        <path d="M4 150v-36M160 150v-36" stroke="#2b2c2c" strokeWidth="10" strokeLinecap="round" />
      </g>

      {/* foreground plants */}
      <Plant x={548} y={952} scale={1.7} seed="of-f1" leaves={11} spread={150} tall pot="#f3ece2" />
      <Plant x={1108} y={950} scale={1.5} seed="of-f2" leaves={10} spread={150} tall pot="#c98a55" potShade="#a9683b" />
      <g filter={`url(#${p}-blur)`}>
        <Plant x={1980} y={1010} scale={3.6} seed="of-f3" leaves={11} spread={150} tall pot="#2f6b3a" potShade="#2f6b3a" />
      </g>
    </svg>
  );
}
