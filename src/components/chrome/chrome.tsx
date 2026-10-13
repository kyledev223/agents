"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EXTERNAL_LINK_PROPS, PUMPFUN_URL, TWITTER_URL } from "@/config/links";
import { PROJECT_NAME, TICKER } from "@/config/site";
import { CloseIcon, MenuIcon, PumpIcon, XIcon } from "@/components/ui/icons";
import { Modal } from "@/components/ui/Modal";
import { compact, sol, truncate, whole } from "@/lib/format";
import { FAKE_WALLETS } from "@/lib/seed";
import { useStore } from "@/state/store";
import { LogoMark, NAV, useActive } from "./nav";

const pill =
  "inline-flex items-center rounded-full border border-outline bg-white/85 font-medium leading-none text-ink backdrop-blur transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2";

// Round icon link used for X and pump.fun in the nav, hero and footer.
export function SocialButtons({ size = "max(36px, calc(40 * var(--u)))", className = "" }: { size?: string; className?: string }) {
  return (
    <>
      <a
        href={TWITTER_URL}
        {...EXTERNAL_LINK_PROPS}
        aria-label={`${PROJECT_NAME} on X`}
        title="X"
        className={`${pill} justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <XIcon style={{ width: "42%", height: "42%" }} />
      </a>
      <a
        href={PUMPFUN_URL}
        {...EXTERNAL_LINK_PROPS}
        aria-label={`${TICKER} on pump.fun`}
        title="pump.fun"
        className={`${pill} justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <PumpIcon style={{ width: "54%", height: "54%" }} />
      </a>
    </>
  );
}

function WalletButton({ compactLabel = false, style }: { compactLabel?: boolean; style: React.CSSProperties }) {
  const { wallet, ready, setWalletModalOpen, disconnect, reset } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    window.addEventListener("mousedown", close);
    return () => window.removeEventListener("mousedown", close);
  }, [open]);

  const cls =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 bg-ink text-white shadow-[0_4px_16px_rgba(0,0,0,0.18)] hover:bg-ink-2 disabled:opacity-60";

  if (!wallet || !ready) {
    return (
      <button type="button" className={cls} style={style} onClick={() => setWalletModalOpen(true)}>
        {compactLabel ? "Connect" : "Connect wallet"}
      </button>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button type="button" className={cls} style={style} onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Wallet menu">
        <span className="h-2 w-2 rounded-full bg-win" aria-hidden="true" />
        <span className="tabular">{compactLabel ? truncate(wallet.address, 3, 3) : truncate(wallet.address)}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-[calc(100%+8px)] z-50 w-[264px] overflow-hidden rounded-2xl border border-rule bg-card shadow-[0_18px_50px_rgba(60,30,8,0.22)]"
          >
            <div className="border-b border-rule px-4 py-3">
              <p className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">{wallet.name}</p>
              <p className="tabular mt-0.5 truncate text-[13.5px] font-semibold">{truncate(wallet.address, 6, 6)}</p>
            </div>
            <dl className="space-y-2 px-4 py-3 text-[13.5px]">
              <div className="flex justify-between gap-3">
                <dt className="text-ink-3">{TICKER}</dt>
                <dd className="tabular font-semibold">{whole(wallet.token)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-ink-3">SOL</dt>
                <dd className="tabular font-semibold">{sol(wallet.sol)}</dd>
              </div>
            </dl>
            <div className="grid gap-px border-t border-rule bg-rule-soft text-[13.5px] font-medium">
              <button type="button" className="bg-card px-4 py-2.5 text-left hover:bg-paper" onClick={() => { setOpen(false); setWalletModalOpen(true); }}>
                Switch wallet
              </button>
              <button type="button" className="bg-card px-4 py-2.5 text-left hover:bg-paper" onClick={() => { setOpen(false); disconnect(); }}>
                Disconnect
              </button>
              <button type="button" className="bg-card px-4 py-2.5 text-left text-loss hover:bg-loss-soft" onClick={() => { setOpen(false); reset(); }}>
                Reset everything
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Fixed top-right cluster on desktop.
export function TopChrome() {
  return (
    <div
      className="vt-chrome fixed z-50 hidden items-center md:flex"
      style={{ right: "max(16px, calc(22 * var(--u)))", top: "max(14px, calc(20 * var(--u)))", gap: "max(8px, calc(10 * var(--u)))" }}
    >
      <SocialButtons />
      <WalletButton
        style={{
          height: "max(36px, calc(40 * var(--u)))",
          fontSize: "max(13px, calc(13.5 * var(--u)))",
          paddingInline: "max(16px, calc(20 * var(--u)))",
        }}
      />
    </div>
  );
}

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const isActive = useActive();
  return (
    <header className="vt-mobile-header sticky top-0 z-50 border-b border-rule bg-paper/95 backdrop-blur md:hidden">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/" aria-label={`${PROJECT_NAME} home`} className="font-display flex items-center gap-2 text-[22px] font-black leading-none" onClick={() => setOpen(false)}>
          <span className="text-[21px] leading-[0]">
            <LogoMark />
          </span>
          {PROJECT_NAME}
        </Link>
        <div className="flex items-center gap-2">
          <a
            href={TWITTER_URL}
            {...EXTERNAL_LINK_PROPS}
            aria-label={`${PROJECT_NAME} on X`}
            className="grid h-9 w-9 place-items-center rounded-full border border-outline bg-white text-ink"
          >
            <XIcon className="h-[15px] w-[15px]" />
          </a>
          <WalletButton compactLabel style={{ height: 34, fontSize: 13, paddingInline: 12 }} />
          <button type="button" aria-expanded={open} aria-label="Menu" className="rounded-full p-2 text-[20px] hover:bg-paper-2" onClick={() => setOpen((v) => !v)}>
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="Main" className="border-t border-rule bg-paper px-2 pb-3 pt-1">
          <ul>
            {NAV.map(({ href, label, Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(href) ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-xl px-3 py-3 text-[15px] ${isActive(href) ? "bg-paper-2 font-bold" : "font-medium text-ink-2"}`}
                >
                  <Icon className="text-[18px]" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-center gap-2 border-t border-rule px-3 pt-3">
            <SocialButtons size="38px" />
            <span className="text-[13px] text-ink-3">X and pump.fun</span>
          </div>
        </nav>
      )}
    </header>
  );
}

export function Footer({ className = "" }: { className?: string }) {
  return (
    <footer className={`mt-14 border-t border-[#1b1c1f]/10 pt-6 text-[13.5px] text-ink-3 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <nav aria-label="Footer" className="flex flex-wrap items-center gap-x-5 gap-y-2 font-medium text-ink">
          <Link href="/docs" className="underline decoration-rule underline-offset-4 hover:decoration-ink">Docs</Link>
          <Link href="/docs#capabilities" className="underline decoration-rule underline-offset-4 hover:decoration-ink">Capabilities</Link>
          <a href={TWITTER_URL} {...EXTERNAL_LINK_PROPS} className="underline decoration-rule underline-offset-4 hover:decoration-ink">X</a>
          <a href={PUMPFUN_URL} {...EXTERNAL_LINK_PROPS} className="underline decoration-rule underline-offset-4 hover:decoration-ink">pump.fun</a>
        </nav>
        <div className="flex items-center gap-2">
          <SocialButtons size="36px" />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 text-[12.5px]">
        <p>{PROJECT_NAME} is experimental. It is not a financial product.</p>
      </div>
    </footer>
  );
}

export function WalletModal() {
  const { walletModalOpen, setWalletModalOpen, connect, wallet } = useStore();
  return (
    <Modal open={walletModalOpen} onClose={() => setWalletModalOpen(false)} title="Connect a wallet">
      <p className="text-[13.5px] leading-relaxed text-ink-2">
        Pick a wallet to continue.
      </p>
      <ul className="mt-4 space-y-2">
        {FAKE_WALLETS.map((w, i) => (
          <li key={w.key}>
            <button
              type="button"
              onClick={() => connect(w.key)}
              className="flex w-full items-center gap-3 rounded-xl border border-rule bg-paper px-4 py-3 text-left transition-colors hover:border-ink-4 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/30"
            >
              <span
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-[15px] font-extrabold text-white"
                style={{ background: ["#0b0c0c", "#2264b3", "#a96a16"][i] }}
                aria-hidden="true"
              >
                {w.name[0]}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[15px] font-semibold">{w.name}</span>
                <span className="tabular block truncate text-[12.5px] text-ink-3">
                  {w.blurb} · {truncate(w.address)}
                </span>
              </span>
              <span className="tabular shrink-0 text-right text-[12.5px] text-ink-3">
                {wallet?.key === w.key ? <span className="font-semibold text-win-deep">Connected</span> : <>{compact(w.token)} {TICKER}</>}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-[12.5px] leading-relaxed text-ink-3">Pick a different one later to act as a second holder.</p>
    </Modal>
  );
}

export function Toasts() {
  const { toasts } = useStore();
  return (
    <div className="vt-toasts pointer-events-none fixed inset-x-0 bottom-5 z-[110] flex flex-col items-center gap-2 px-4" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2 }}
            className="flex max-w-full items-center gap-2.5 rounded-full bg-ink px-4 py-2.5 text-[13.5px] font-medium text-white shadow-lg"
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${t.tone === "error" ? "bg-loss" : "bg-win"}`} aria-hidden="true" />
            <span className="truncate">{t.text}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
