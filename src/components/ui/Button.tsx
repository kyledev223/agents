import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:cursor-not-allowed";

const variants = {
  primary: "bg-ink text-white hover:bg-ink-2 disabled:bg-ink-4",
  outline: "border border-outline bg-card text-ink hover:bg-paper-2 disabled:border-rule disabled:text-ink-4",
  ghost: "border border-outline bg-white/45 text-ink backdrop-blur-[2px] hover:bg-white/80",
  danger: "border border-loss/50 bg-card text-loss hover:bg-loss-soft",
} as const;

const sizes = {
  sm: "h-8 px-3.5 text-[13px]",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-6 text-[15px]",
} as const;

interface Common {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: ReactNode;
}

export const buttonClass = ({ variant = "primary", size = "md", className = "" }: Omit<Common, "children">) =>
  `${base} ${variants[variant]} ${sizes[size]} ${className}`;

export function Button({ variant, size, className, children, ...rest }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className={buttonClass({ variant, size, className })} {...rest}>
      {children}
    </button>
  );
}

export function ButtonLink({ variant, size, className, children, href }: Common & { href: string }) {
  return (
    <Link href={href} className={buttonClass({ variant, size, className })}>
      {children}
    </Link>
  );
}

// Filter / sort pill, as on the reference grid page.
export function Pill({ active, children, ...rest }: { active?: boolean; children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-[14px] font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 ${
        active ? "border-ink bg-ink text-white" : "border-outline text-ink hover:bg-paper-2"
      }`}
      {...rest}
    >
      {children}
    </button>
  );
}
