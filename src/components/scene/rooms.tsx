import { Plant, Skyline, Vine } from "./parts";

// Two original room illustrations on a 1672 x 940 canvas. Page content is laid
// over a surface in each: the whiteboard, or the monitor.

export const SURFACES = {
  whiteboard: { x: 543, y: 106, w: 1056, h: 534, topBias: 0.18, capW: 1640 },
  screen: { x: 319, y: 105, w: 1255, h: 568, topBias: 0.28, capW: 1600 },
} as const;

export type Surface = keyof typeof SURFACES;

const svgProps = {
  viewBox: "0 0 1672 940",
  preserveAspectRatio: "none",
  "aria-hidden": true,
} as const;

export function BoardRoomBack() {
  return (
    <svg {...svgProps} className="absolute inset-0 h-full w-full select-none">
      <defs>
        <linearGradient id="br-wall" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0c69a" />
          <stop offset=".5" stopColor="#d9a47a" />
          <stop offset="1" stopColor="#b77f58" />
        </linearGradient>
        <linearGradient id="br-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f6a45e" />
          <stop offset=".45" stopColor="#ffc97f" />
          <stop offset=".75" stopColor="#ffe3ae" />
          <stop offset="1" stopColor="#f9b98f" />
        </linearGradient>
        <linearGradient id="br-floor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e3b085" />
          <stop offset="1" stopColor="#b9805a" />
        </linearGradient>
        <linearGradient id="br-board" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fffdfb" />
          <stop offset=".6" stopColor="#fbf5f3" />
          <stop offset="1" stopColor="#f1e6ec" />
        </linearGradient>
        <linearGradient id="br-desk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9b27c" />
          <stop offset="1" stopColor="#b3713f" />
        </linearGradient>
        <radialGradient id="br-sun" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fffbe8" />
          <stop offset=".35" stopColor="#ffe9a8" stopOpacity=".9" />
          <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="br-wash" cx=".22" cy=".4" r=".7">
          <stop offset="0" stopColor="#ffe9c2" stopOpacity=".75" />
          <stop offset="1" stopColor="#ffe9c2" stopOpacity="0" />
        </radialGradient>
        <filter id="br-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="7" />
        </filter>
        <filter id="br-soft" x="-10%" y="-10%" width="120%" height="140%">
          <feGaussianBlur stdDeviation="12" />
        </filter>
      </defs>

      {/* wall */}
      <rect width="1672" height="940" fill="url(#br-wall)" />
      <rect width="1672" height="940" fill="url(#br-wash)" />

      {/* window */}
      <rect x="-10" y="-10" width="446" height="660" fill="url(#br-sky)" />
      <ellipse cx="120" cy="150" rx="150" ry="16" fill="#fff" opacity=".35" />
      <ellipse cx="330" cy="225" rx="110" ry="11" fill="#fff" opacity=".3" />
      <circle cx="222" cy="332" r="90" fill="url(#br-sun)" />
      <circle cx="222" cy="332" r="20" fill="#fffbe8" />
      <Skyline x={-10} y={470} width={446} seed="br-far" color="#e39a86" opacity={0.6} maxH={130} />
      <Skyline x={-10} y={500} width={446} seed="br-near" color="#b9667a" opacity={0.75} maxH={150} />
      <rect x="-10" y="500" width="446" height="70" fill="#f2a98a" opacity=".85" />
      <path d="M210 505h28l14 62h-56z" fill="#fff3cf" opacity=".65" />
      <Skyline x={-10} y={640} width={446} seed="br-close" color="#8a4a5f" opacity={0.85} maxH={96} />
      <rect x="-10" y="-10" width="446" height="660" fill="#ffd9a0" opacity=".12" />
      {/* frame */}
      <rect x="250" y="-10" width="12" height="660" fill="#5e3a27" />
      <rect x="424" y="-10" width="22" height="664" fill="#553322" />
      <rect x="-10" y="636" width="456" height="18" fill="#553322" />

      {/* floor */}
      <rect x="0" y="652" width="1672" height="300" fill="url(#br-floor)" />
      <rect x="446" y="640" width="1226" height="14" fill="#a26d4a" opacity=".7" />
      <path d="M40 654h380l330 290H-200z" fill="#fff0cf" opacity=".42" />
      <path d="M270 654h150l330 290H520z" fill="#fff6dd" opacity=".3" />

      {/* ceiling light */}
      <rect x="600" y="28" width="820" height="26" rx="13" fill="#fff3d6" filter="url(#br-soft)" opacity=".9" />
      <rect x="600" y="34" width="820" height="9" rx="4.500" fill="#fffaf0" />
      <path d="M700 0v34M1320 0v34" stroke="#5e3a27" strokeWidth="3" />

      {/* whiteboard */}
      <rect x="531" y="104" width="1096" height="574" rx="10" fill="#6b3f22" opacity=".35" filter="url(#br-soft)" />
      <rect x="521" y="84" width="1100" height="578" rx="9" fill="#d5d8dc" />
      <rect x="529" y="92" width="1084" height="562" rx="4" fill="url(#br-board)" />
      {[[517, 80], [1601, 80], [517, 642], [1601, 642]].map(([cx, cy]) => (
        <rect key={`${cx}-${cy}`} x={cx} y={cy} width="24" height="24" rx="6" fill="#3d4046" />
      ))}
      <rect x="1090" y="660" width="400" height="11" rx="3" fill="#b4b8be" />
      <rect x="1124" y="652" width="54" height="9" rx="4.500" fill="#1b1c1f" />
      <rect x="1186" y="652" width="54" height="9" rx="4.500" fill="#2f6fd6" />
      <rect x="1248" y="652" width="54" height="9" rx="4.500" fill="#d94b43" />
      <rect x="1392" y="645" width="74" height="16" rx="4" fill="#26282c" />

      {/* left cabinet */}
      <rect x="-10" y="560" width="158" height="130" rx="6" fill="#6e452c" />
      <rect x="0" y="574" width="66" height="104" rx="4" fill="#84563a" />
      <rect x="72" y="574" width="66" height="104" rx="4" fill="#84563a" />
      <path d="M60 620v14M78 620v14" stroke="#4d2f1e" strokeWidth="3" strokeLinecap="round" />
      <rect x="-10" y="552" width="166" height="12" rx="4" fill="#553322" />
      <Plant x={46} y={556} scale={1.15} seed="br-a" leaves={11} spread={170} tall />
      <Plant x={116} y={556} scale={0.8} seed="br-b" pot="#c98a55" potShade="#a9683b" leaves={8} />
      <Plant x={196} y={700} scale={1.35} seed="br-c" pot="#7b7f86" potShade="#5d6168" leaves={10} spread={160} tall />
      <Vine x={318} y={-6} length={235} seed="br-v1" sway={20} />
      <Vine x={352} y={-6} length={150} seed="br-v2" />
      <Vine x={384} y={-6} length={205} seed="br-v3" sway={12} />

      {/* foreground desk */}
      <path d="M-20 940V872c260-52 620-64 1000-62 300 2 520-10 712-34v164z" fill="url(#br-desk)" />
      <path d="M-20 872c260-52 620-64 1000-62 300 2 520-10 712-34v14c-192 24-412 36-712 34-380-2-740 10-1000 62z" fill="#fff1d3" opacity=".55" />
      <g transform="translate(1168 742)">
        <rect x="0" y="52" width="250" height="24" rx="4" fill="#f1e7d8" />
        <rect x="14" y="30" width="232" height="24" rx="4" fill="#3a2a25" />
        <rect x="36" y="8" width="196" height="24" rx="4" fill="#26282c" />
        <rect x="0" y="52" width="250" height="5" fill="#fff" opacity=".4" />
      </g>
      <g transform="translate(1520 706)">
        <path d="M-2-40 6 8M22-56 20 8M44-46 34 8M60-30 46 8" stroke="#5d4a3a" strokeWidth="7" strokeLinecap="round" />
        <path d="M-2-40l-3-12M22-56l0-13M44-46l3-12M60-30l5-11" stroke="#1b1c1f" strokeWidth="7" strokeLinecap="round" />
        <path d="M-12 0h80l-7 88a8 8 0 0 1-8 7H3a8 8 0 0 1-8-7z" fill="#f4ebe0" />
        <path d="M30 0h38l-7 88a8 8 0 0 1-8 7H30z" fill="#dccfbe" opacity=".7" />
      </g>
      <Plant x={1330} y={792} scale={1.5} seed="br-d" pot="#6f737a" potShade="#565a61" leaves={12} spread={175} />

      {/* soft foreground leaves, bottom-left */}
      <g filter="url(#br-blur)" opacity=".92">
        <Plant x={40} y={1010} scale={3.4} seed="br-fg" pot="#2f6b3a" potShade="#2f6b3a" leaves={10} spread={150} tall />
      </g>
    </svg>
  );
}

// Foliage that hangs in front of the board's right edge.
export function BoardRoomFront() {
  return (
    <svg {...svgProps} className="pointer-events-none absolute inset-0 z-10 hidden h-full w-full select-none md:block">
      <Vine x={1452} y={-8} length={150} seed="br-f1" sway={14} />
      <Vine x={1492} y={-8} length={205} seed="br-f2" sway={18} />
      <Vine x={1530} y={-8} length={120} seed="br-f3" />
      <g transform="translate(1700 470) rotate(-8)">
        <Plant x={0} y={0} scale={2.6} seed="br-f4" pot="#00000000" potShade="#00000000" leaves={7} spread={110} tall />
      </g>
    </svg>
  );
}

export function DeskRoomBack() {
  const keys = Array.from({ length: 4 }, (_, row) => Array.from({ length: 22 }, (_, col) => ({ row, col }))).flat();
  return (
    <svg {...svgProps} className="absolute inset-0 h-full w-full select-none">
      <defs>
        <linearGradient id="dr-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ffe2b3" />
          <stop offset=".5" stopColor="#f3b57c" />
          <stop offset="1" stopColor="#c98454" />
        </linearGradient>
        <linearGradient id="dr-desk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#edb57c" />
          <stop offset=".5" stopColor="#d6935a" />
          <stop offset="1" stopColor="#a9683b" />
        </linearGradient>
        <linearGradient id="dr-mug" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff6ea" />
          <stop offset="1" stopColor="#d9bfa2" />
        </linearGradient>
        <radialGradient id="dr-sun" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#fffbe8" />
          <stop offset="1" stopColor="#ffd27a" stopOpacity="0" />
        </radialGradient>
        <filter id="dr-blur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="14" />
        </filter>
        <filter id="dr-soft" x="-20%" y="-50%" width="140%" height="200%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>

      {/* out-of-focus office behind the desk */}
      <rect width="1672" height="940" fill="url(#dr-bg)" />
      <g filter="url(#dr-blur)">
        <circle cx="250" cy="250" r="190" fill="url(#dr-sun)" />
        <Skyline x={0} y={470} width={700} seed="dr-sky" color="#c9767a" opacity={0.55} maxH={230} />
        <path d="M150 0v720M560 0v720M1040 0v720M1500 0v720" stroke="#6b4128" strokeWidth="26" opacity=".7" />
        <path d="M0 150h1672" stroke="#6b4128" strokeWidth="18" opacity=".6" />
        <rect x="620" y="20" width="360" height="12" rx="6" fill="#fffaf0" />
        <rect x="1100" y="60" width="300" height="12" rx="6" fill="#fffaf0" />
        <Plant x={840} y={170} scale={2.2} seed="dr-p1" leaves={10} />
        <Plant x={1400} y={300} scale={2.6} seed="dr-p2" leaves={11} tall />
        <rect x="1180" y="520" width="492" height="18" fill="#8a5a3a" />
        <rect x="0" y="600" width="430" height="20" fill="#8a5a3a" />
      </g>
      <rect width="1672" height="940" fill="#ffcf96" opacity=".14" />

      {/* desk */}
      <rect x="-10" y="706" width="1692" height="244" fill="url(#dr-desk)" />
      <rect x="-10" y="706" width="1692" height="7" fill="#fff1d3" opacity=".7" />
      <path d="M0 760h1672M0 838h1672M0 900h1672" stroke="#8f5a33" strokeOpacity=".16" strokeWidth="3" />
      <path d="M260 713h620l-240 227H-60z" fill="#fff3d6" opacity=".25" />

      {/* monitor */}
      <rect x="640" y="768" width="620" height="34" rx="17" fill="#3d2414" opacity=".4" filter="url(#dr-soft)" />
      <rect x="884" y="690" width="124" height="84" fill="#242427" />
      <rect x="884" y="690" width="124" height="20" fill="#000" opacity=".35" />
      <path d="M770 792q0-22 26-22h300q26 0 26 22v6H770z" fill="#2b2b2f" />
      <rect x="770" y="796" width="352" height="7" rx="3" fill="#1a1a1c" />
      <rect x="301" y="87" width="1291" height="606" rx="16" fill="#18181a" />
      <rect x="301" y="87" width="1291" height="5" rx="2.500" fill="#fff" opacity=".12" />
      <rect x="319" y="105" width="1255" height="568" rx="3" fill="#fbf8f2" />

      {/* keyboard and mouse */}
      <rect x="548" y="884" width="760" height="22" rx="10" fill="#3d2414" opacity=".3" filter="url(#dr-soft)" />
      <path d="M572 822h700l40 68H532z" fill="#2a2b2f" />
      <path d="M532 890h780v8a6 6 0 0 1-6 6H538a6 6 0 0 1-6-6z" fill="#18181a" />
      {keys.map(({ row, col }) => {
        const top = 828 + row * 15;
        const inset = 40 - row * 10.5;
        const span = 700 + (row + 0.2) * 20;
        const kw = span / 22;
        return <rect key={`${row}-${col}`} x={Math.round(532 + inset + col * kw + 1.5)} y={top} width={Math.round(kw - 3)} height="11" rx="2.500" fill="#404248" />;
      })}
      <ellipse cx="1420" cy="872" rx="62" ry="26" fill="#3d2414" opacity=".3" filter="url(#dr-soft)" />
      <path d="M1362 858c0-30 26-46 58-46s58 16 58 46c0 14-26 22-58 22s-58-8-58-22z" fill="#2a2b2f" />
      <path d="M1420 812v22" stroke="#55585f" strokeWidth="3" strokeLinecap="round" />

      {/* mug, books, plants */}
      <g transform="translate(0 652)">
        <rect x="-10" y="104" width="150" height="26" rx="4" fill="#2f2622" />
        <rect x="-10" y="78" width="134" height="26" rx="4" fill="#f1e7d8" />
        <rect x="-10" y="52" width="120" height="26" rx="4" fill="#3b4a5f" />
      </g>
      <ellipse cx="222" cy="842" rx="96" ry="18" fill="#3d2414" opacity=".3" filter="url(#dr-soft)" />
      <ellipse cx="216" cy="838" rx="84" ry="15" fill="#b9773f" />
      <path d="M296 742c40-4 62 14 60 44s-30 48-66 44l2-20c22 2 40-8 42-26s-12-26-36-24z" fill="#e8d5bd" />
      <path d="M140 700h150v112a26 26 0 0 1-26 26h-98a26 26 0 0 1-26-26z" fill="url(#dr-mug)" />
      <ellipse cx="215" cy="700" rx="75" ry="13" fill="#fffaf2" />
      <ellipse cx="215" cy="702" rx="63" ry="9" fill="#6b4128" />
      <Plant x={86} y={672} scale={3} seed="dr-big" leaves={9} spread={150} tall />
      <Plant x={1630} y={792} scale={2} seed="dr-small" pot="#eadfce" leaves={10} spread={170} />
    </svg>
  );
}
