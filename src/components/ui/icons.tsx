import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

const Base = ({ children, ...props }: IconProps) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...stroke} {...props}>
    {children}
  </svg>
);

export const HomeIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" />
  </Base>
);

export const AgentsIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="5" y="8" width="14" height="11" rx="3" />
    <path d="M12 8V4.5" />
    <circle cx="12" cy="3.6" r="1" />
    <path d="M9.5 13v1.5M14.5 13v1.5" />
  </Base>
);

export const MarketIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 19h16" />
    <path d="M7 16v-4M12 16V7M17 16v-6" />
  </Base>
);

export const MintIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3c1 3.5 5 5.2 5 10a5 5 0 0 1-10 0c0-2 .8-3.2 2-4.4.3 1.6 1 2.4 2 2.9C10.600 9 11 6 12 3z" />
  </Base>
);

export const ConsoleIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="3.500" y="5" width="17" height="14" rx="2.500" />
    <path d="m8 10 2.500 2L8 14M13 14h3" />
  </Base>
);

export const DocsIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 3.500h7l4 4V19.500a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1z" />
    <path d="M14 3.500v4h4M9 12.500h6M9 16h6" />
  </Base>
);

export const ArrowRight = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);

export const MenuIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Base>
);

export const CloseIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </Base>
);

export const CheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="m5 12.500 4.500 4.500L19 7.500" />
  </Base>
);

export const CopyIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="8.500" y="8.500" width="11" height="11" rx="2" />
    <path d="M15.500 5.500v-1a1 1 0 0 0-1-1h-9a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h1" />
  </Base>
);

export const WalletIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7.500A2.500 2.500 0 0 1 6.500 5H18v3" />
    <rect x="4" y="8" width="16" height="11" rx="2.500" />
    <circle cx="16" cy="13.500" r="1" fill="currentColor" stroke="none" />
  </Base>
);

export const WrenchIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M14.500 6.500a4 4 0 0 0 5 5L11 20a2.100 2.100 0 0 1-3-3l8.500-8.500a4 4 0 0 1-2-2z" />
  </Base>
);

export const ShieldIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 3.500 5 6v5.500c0 4.200 2.900 7.300 7 9 4.100-1.700 7-4.800 7-9V6z" />
  </Base>
);

// The X logo, drawn as two strokes rather than copied from brand art.
export const XIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" fill="currentColor" {...p}>
    <path d="M17.800 3.500h3L14.300 11l7.600 9.500h-6L11.300 14.600 6 20.500H3l7-8L2.700 3.500h6.100l4.200 5.400zm-1 15.200h1.600L7.900 5.200H6.100z" />
  </svg>
);

// pump.fun: a generic two-tone capsule, not their logo file.
export const PumpIcon = (p: IconProps) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" {...p}>
    <g transform="rotate(-45 12 12)">
      <rect x="3" y="7.500" width="18" height="9" rx="4.500" fill="#fff" stroke="currentColor" strokeWidth="1.800" />
      <path d="M12 7.500h4.500a4.500 4.500 0 0 1 0 9H12z" fill="#22c55e" stroke="currentColor" strokeWidth="1.800" />
    </g>
  </svg>
);

export const Spinner = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true" className={`animate-spin ${className}`}>
    <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeOpacity=".25" strokeWidth="3" />
    <path d="M21 12a9 9 0 0 0-9-9" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);
