"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PROJECT_NAME, TAGLINE } from "@/config/site";
import { AgentsIcon, ConsoleIcon, DocsIcon, HomeIcon, MarketIcon, MintIcon } from "@/components/ui/icons";

export const NAV = [
  { href: "/", label: "Home", Icon: HomeIcon },
  { href: "/agents", label: "Agents", Icon: AgentsIcon },
  { href: "/market", label: "Market", Icon: MarketIcon },
  { href: "/mint", label: "Mint", Icon: MintIcon },
  { href: "/console", label: "Console", Icon: ConsoleIcon },
  { href: "/docs", label: "Docs", Icon: DocsIcon },
] as const;

export function useActive() {
  const pathname = usePathname() ?? "/";
  return (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
}

// Original mark: a small robot head. Scales with font-size (1em tall).
export function LogoMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 26" height="1em" className={className} aria-hidden="true">
      <path d="M15 6V2.200" stroke="currentColor" strokeWidth="2.400" strokeLinecap="round" />
      <circle cx="15" cy="2.200" r="2.200" fill="currentColor" />
      <rect x="1" y="6" width="28" height="19" rx="6.500" fill="currentColor" />
      <rect x="6.500" y="12" width="6" height="6.500" rx="3" fill="#fbf8f2" />
      <rect x="17.500" y="12" width="6" height="6.500" rx="3" fill="#fbf8f2" />
    </svg>
  );
}

// Desktop nav. On the home scene it sits straight on the artwork; on room pages
// it sits in a frosted card. All sizes are in scene units.
export function SideNav({ card = false }: { card?: boolean }) {
  const isActive = useActive();
  const u = (n: number) => `calc(${n} * var(--u))`;

  const inner = (
    <>
      <Link
        href="/"
        aria-label={`${PROJECT_NAME} home`}
        className="relative flex w-fit items-center text-ink outline-none"
        style={{ marginLeft: u(18), paddingTop: u(27), gap: u(6) }}
      >
        <span style={{ fontSize: u(20), lineHeight: 0 }}>
          <LogoMark />
        </span>
        <span className="font-display block font-black leading-none" style={{ fontSize: u(20.5), letterSpacing: "-0.035em" }}>
          {PROJECT_NAME}
        </span>
      </Link>
      <p
        className="font-medium uppercase text-[#5d5d5b]"
        style={{ marginLeft: u(27), marginTop: u(7), fontSize: u(9.2), lineHeight: u(13), letterSpacing: "0.01em" }}
      >
        {TAGLINE[0]}
        <br />
        {TAGLINE[1]}
      </p>
      <nav style={{ marginTop: u(17.5) }} aria-label="Main">
        <ul>
          {NAV.map(({ href, label, Icon }) => {
            const active = isActive(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex w-fit items-center outline-none transition-colors focus-visible:underline ${
                    active ? "font-bold text-ink" : "font-medium text-[#222221] hover:text-ink"
                  }`}
                  style={{ height: u(42.525), paddingLeft: u(26), paddingRight: u(12), gap: u(11), fontSize: u(12) }}
                >
                  <Icon style={{ width: u(16), height: u(16) }} strokeWidth={active ? 2.4 : 1.8} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );

  if (card) {
    return (
      <div className="absolute left-0 top-0 z-40 hidden md:block" style={{ padding: u(12) }}>
        <div
          style={{
            width: u(160),
            paddingBottom: u(12),
            marginLeft: u(-4),
            borderRadius: u(18),
            background: "rgba(255, 250, 243, 0.84)",
            backdropFilter: "blur(12px) saturate(1.15)",
            WebkitBackdropFilter: "blur(12px) saturate(1.15)",
            border: "1px solid rgba(255, 255, 255, 0.7)",
            boxShadow: "0 10px 30px rgba(60, 30, 8, 0.22)",
          }}
        >
          {inner}
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute left-0 top-0 z-40"
      style={{
        width: u(176),
        filter: "drop-shadow(0 0 2px rgba(255, 249, 238, 0.9)) drop-shadow(0 0 6px rgba(255, 244, 228, 0.7))",
      }}
    >
      {inner}
    </div>
  );
}
