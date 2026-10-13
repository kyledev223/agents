"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";
import { agentHref } from "@/components/agents/AgentCard";
import { AgentAvatar } from "@/components/agents/robot";
import { BoardPage } from "@/components/scene/BoardPage";
import { Panel, Tag } from "@/components/ui/bits";
import { Button, buttonClass } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EXTERNAL_LINK_PROPS, WALLET_URL } from "@/config/links";
import { MAX_SUPPLY, MINT_COST, TICKER } from "@/config/site";
import { compact, padId, whole } from "@/lib/format";
import { agentIdentity } from "@/lib/seed";
import { useStore } from "@/state/store";

type Phase = "idle" | "confirm" | "burning" | "reveal";

const BURN_MS = 2600;

function BurnAnimation() {
  const reduce = useReducedMotion();
  return (
    <div className="relative mx-auto h-[180px] w-full max-w-[280px]" aria-hidden="true">
      {!reduce &&
        Array.from({ length: 9 }, (_, i) => (
          <motion.span
            key={i}
            className="absolute top-0 grid h-7 w-7 place-items-center rounded-full border border-[#b9820f] bg-[#ffd35c] text-[11px] font-extrabold text-[#8a5f08]"
            style={{ left: `${12 + ((i * 37) % 70)}%` }}
            initial={{ y: -10, opacity: 0, rotate: 0 }}
            animate={{ y: 118, opacity: [0, 1, 1, 0], rotate: 220 }}
            transition={{ duration: 1.1, delay: i * 0.24, repeat: Infinity, ease: "easeIn" }}
          >
            $
          </motion.span>
        ))}
      <svg viewBox="0 0 120 120" className="absolute bottom-0 left-1/2 h-[120px] w-[120px] -translate-x-1/2">
        <motion.path
          d="M60 8c8 26 38 38 38 72a38 38 0 0 1-76 0c0-16 6-26 15-35 2 13 8 19 16 22-3-22 0-42 7-59z"
          fill="#e5484d"
          animate={reduce ? undefined : { scaleY: [1, 1.07, 0.97, 1.04, 1], scaleX: [1, 0.97, 1.03, 0.98, 1] }}
          transition={{ duration: 0.9, repeat: Infinity }}
          style={{ transformOrigin: "60px 118px" }}
        />
        <motion.path
          d="M60 44c5 15 21 22 21 41a21 21 0 0 1-42 0c0-9 3-14 8-19 1 7 4 10 9 12-2-12 0-24 4-34z"
          fill="#e7a33e"
          animate={reduce ? undefined : { scaleY: [1, 0.94, 1.08, 1] }}
          transition={{ duration: 0.7, repeat: Infinity }}
          style={{ transformOrigin: "60px 118px" }}
        />
        <path d="M60 72c3 8 11 12 11 22a11 11 0 0 1-22 0c0-5 2-8 5-10 0 4 2 6 4 7-1-7 0-13 2-19z" fill="#fff3c4" />
      </svg>
      {!reduce &&
        [0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="animate-ember absolute bottom-[86px] h-1.5 w-1.5 rounded-full bg-warm"
            style={{ left: `${40 + i * 7}%`, animationDelay: `${i * 0.38}s` }}
          />
        ))}
    </div>
  );
}

export default function MintPage() {
  const { wallet, ready, stats, mint, toast, agentById } = useStore();
  const [phase, setPhase] = useState<Phase>("idle");
  const [mintedId, setMintedId] = useState<number | null>(null);

  const nextId = stats.minted + 1;
  const soldOut = stats.remaining <= 0;
  const balance = wallet?.token ?? 0;
  const enough = balance >= MINT_COST;
  const canMint = Boolean(wallet) && enough && !soldOut;
  const minted = mintedId ? agentById(mintedId) : undefined;
  const preview = agentIdentity(nextId);

  useEffect(() => {
    if (phase !== "burning") return;
    const timer = window.setTimeout(() => {
      const result = mint();
      if (result.ok) {
        setMintedId(result.id);
        setPhase("reveal");
      } else {
        toast(result.reason, "error");
        setPhase("idle");
      }
    }, BURN_MS);
    return () => window.clearTimeout(timer);
    // The burn runs once per attempt; mint/toast are stable enough for that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const close = () => phase !== "burning" && setPhase("idle");

  const checks: { label: string; value: string; ok: boolean }[] = [
    { label: "Wallet", value: wallet ? wallet.name : "Not connected", ok: Boolean(wallet) },
    { label: TICKER, value: wallet ? (enough ? "Enough to mint" : `Short by ${whole(MINT_COST - balance)}`) : "Connect to check", ok: Boolean(wallet) && enough },
    { label: "Supply", value: soldOut ? "Sold out" : `${stats.remaining.toLocaleString("en-US")} left`, ok: !soldOut },
  ];

  return (
    <BoardPage
      surface="screen"
      eyebrow="Mint"
      title="Burn. Mint. Meet your agent."
      intro={
        <>
          Burn {whole(MINT_COST)} {TICKER} and the next numbered agent is yours: an NFT with its own wallet, a fixed look and temperament, and a memory
          that starts empty. Only {MAX_SUPPLY.toLocaleString("en-US")} will ever exist.
        </>
      }
    >
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 @4xl:grid-cols-[minmax(0,1fr)_340px] @5xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="space-y-6">
          <Panel eyebrow="Fixed" title="What a mint costs" aside={<Tag>Paid in {TICKER}</Tag>} bodyClassName="">
            <dl>
              {[
                ["Burn cost", `${whole(MINT_COST)} ${TICKER}`, "Burned for good. It does not go to a treasury and cannot be refunded."],
                ["You receive", `Agent ${padId(nextId)}`, "Numbers are handed out in order, #0001 to #2000."],
                ["Its wallet", "Created empty", "Fund it after minting. Only the holder can pull funds back out."],
                ["Memory", "Blank", "It learns from its holder, and forgets everything when it changes hands."],
              ].map(([label, value, note]) => (
                <div key={label} className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 border-b border-rule-soft px-5 py-3 last:border-b-0">
                  <dt className="text-[13px] text-ink-3">{label}</dt>
                  <dd className="tabular ml-auto text-right text-[14px] font-semibold text-ink">{value}</dd>
                  <dd className="basis-full text-[12.5px] leading-snug text-ink-3">{note}</dd>
                </div>
              ))}
            </dl>
          </Panel>

          <Panel eyebrow="Capped" title="Supply">
            <div className="flex items-center justify-between text-[12.5px]">
              <span className="text-ink-3">Minted</span>
              <span className="tabular font-medium text-ink-2">
                {stats.minted.toLocaleString("en-US")} / {MAX_SUPPLY.toLocaleString("en-US")}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-paper-2">
              <div className="h-full rounded-full bg-ink transition-[width] duration-700" style={{ width: `${(stats.minted / MAX_SUPPLY) * 100}%` }} />
            </div>
            <dl className="mt-4 grid grid-cols-3 gap-2">
              <div className="min-w-0">
                <dt className="text-[11.5px] text-ink-3">Remaining</dt>
                <dd className="tabular truncate text-[15px] font-semibold">{stats.remaining.toLocaleString("en-US")}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[11.5px] text-ink-3">{TICKER} burned</dt>
                <dd className="tabular truncate text-[15px] font-semibold">{compact(stats.burned)}</dd>
              </div>
              <div className="min-w-0">
                <dt className="text-[11.5px] text-ink-3">Listed</dt>
                <dd className="tabular truncate text-[15px] font-semibold">{stats.listings}</dd>
              </div>
            </dl>
          </Panel>
        </div>

        <div className="space-y-6 @4xl:sticky @4xl:top-6">
          <Panel eyebrow="Up next" title="Your agent" bodyClassName="">
            <div className="p-5">
              <div className="relative overflow-hidden rounded-xl px-4 py-4 text-white" style={{ background: "radial-gradient(130% 90% at 20% 0%, #12303a 0%, #0a161d 50%, #060a0e 100%)" }}>
                <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.028) 0 1px, transparent 1px 3px)" }} />
                <div className="relative flex items-center gap-4">
                  <span className="relative grid h-[72px] w-[72px] shrink-0 place-items-center overflow-hidden rounded-2xl shadow-[0_0_0_1px_rgba(94,234,212,0.45),0_0_18px_rgba(94,234,212,0.25)]">
                    <AgentAvatar id={nextId} size={72} className="!rounded-none !border-0 scale-125 blur-[7px] saturate-150" />
                    <span className="absolute inset-0 bg-black/25" />
                    <span className="font-condensed absolute text-[30px] font-bold leading-none text-white drop-shadow">?</span>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-digital flex items-center gap-1.5 text-[11px] uppercase tracking-[0.08em] text-glow-green">
                      <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-glow-green" aria-hidden="true" />
                      Next in line
                    </p>
                    <p className="font-condensed tabular mt-1 text-[30px] font-bold uppercase leading-none tracking-[0.02em]">{padId(nextId)}</p>
                    <p className="mt-1 truncate text-[14px] text-white/75">{preview.name}</p>
                  </div>
                </div>
                <dl className="relative mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
                  {[
                    ["Wallet", "0.00 SOL"],
                    ["Memory", "Blank"],
                    ["Look", "Sealed"],
                  ].map(([label, value]) => (
                    <div key={label} className="min-w-0">
                      <dt className="font-digital text-[10.5px] uppercase tracking-[0.08em] text-white/45">{label}</dt>
                      <dd className="font-digital tabular truncate text-[14px] text-white/90">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            <div className="px-5 pb-5 pt-2">
              <ul className="divide-y divide-rule-soft">
                {checks.map((check) => (
                  <li key={check.label} className="flex items-center justify-between gap-3 py-2.5 text-[14px]">
                    <span className="flex items-center gap-2.5">
                      <span className={`inline-block h-2 w-2 rounded-full ${check.ok ? "bg-win" : "bg-warm"}`} />
                      <span className="font-semibold text-ink-2">{check.label}</span>
                    </span>
                    <span className="tabular text-right text-ink-2">{ready ? check.value : "Checking"}</span>
                  </li>
                ))}
              </ul>
              <dl className="mt-3 space-y-2 border-t border-rule pt-3 text-[13.5px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-3">Burn cost</dt>
                  <dd className="tabular font-semibold">
                    {whole(MINT_COST)} {TICKER}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-3">Your balance</dt>
                  <dd className="tabular font-semibold">{wallet ? `${whole(balance)} ${TICKER}` : "-"}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-3">After minting</dt>
                  <dd className="tabular font-semibold">{wallet && enough ? `${whole(balance - MINT_COST)} ${TICKER}` : "-"}</dd>
                </div>
              </dl>
              {wallet ? (
                <Button size="lg" className="mt-4 w-full" disabled={!canMint} onClick={() => setPhase("confirm")}>
                  {soldOut ? "Sold out" : enough ? `Burn ${compact(MINT_COST)} ${TICKER} and mint` : `Not enough ${TICKER}`}
                </Button>
              ) : (
                <a href={WALLET_URL} {...EXTERNAL_LINK_PROPS} className={buttonClass({ size: "lg", className: "mt-4 w-full" })}>
                  Connect wallet
                </a>
              )}
              <p className="mt-2.5 text-[13px] leading-relaxed text-ink-3">
                {wallet ? "A burn is permanent." : "Opens OKX Wallet in a new tab."}
              </p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-3">Not a financial product.</p>
            </div>
          </Panel>
        </div>
      </div>

      <Modal
        open={phase !== "idle"}
        onClose={close}
        dismissable={phase !== "burning"}
        eyebrow={phase === "reveal" ? "Minted" : "Burn"}
        title={phase === "confirm" ? `Mint agent ${padId(nextId)}?` : phase === "burning" ? `Burning ${whole(MINT_COST)} ${TICKER}` : minted ? `Meet ${padId(minted.id)}` : "Minted"}
      >
        <AnimatePresence mode="wait">
          {phase === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <dl className="space-y-2 text-[13.5px]">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-3">You burn</dt>
                  <dd className="tabular font-semibold">
                    {whole(MINT_COST)} {TICKER}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-3">You receive</dt>
                  <dd className="tabular font-semibold">Agent {padId(nextId)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-3">Balance after</dt>
                  <dd className="tabular font-semibold">
                    {whole(balance - MINT_COST)} {TICKER}
                  </dd>
                </div>
              </dl>
              <p className="mt-3 rounded-xl bg-paper-2 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ink-2">
                A burn cannot be undone.
              </p>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="lg" className="flex-1" onClick={close}>
                  Cancel
                </Button>
                <Button size="lg" className="flex-1" onClick={() => setPhase("burning")}>
                  Burn and mint
                </Button>
              </div>
            </motion.div>
          )}
          {phase === "burning" && (
            <motion.div key="burning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <BurnAnimation />
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-paper-2">
                <motion.div className="h-full rounded-full bg-ink" initial={{ width: "4%" }} animate={{ width: "100%" }} transition={{ duration: BURN_MS / 1000, ease: "easeInOut" }} />
              </div>
              <p className="mt-3 text-center text-[13.5px] text-ink-3">Tokens going up in smoke, agent coming out the other side.</p>
            </motion.div>
          )}
          {phase === "reveal" && minted && (
            <motion.div key="reveal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
              <motion.div
                className="mx-auto w-fit"
                initial={{ scale: 0.3, rotate: -14, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 220, damping: 14 }}
              >
                <AgentAvatar id={minted.id} size={136} className="!rounded-[32px] shadow-[0_18px_50px_rgba(60,30,8,0.22)]" />
              </motion.div>
              <p className="font-display mt-4 text-[26px] font-extrabold leading-tight">{minted.name}</p>
              <p className="mx-auto mt-1 max-w-[320px] text-[13.5px] leading-relaxed text-ink-3">{minted.persona}</p>
              <div className="mt-5 grid gap-2">
                <Link href={`/console#${minted.id}`} className={buttonClass({ size: "lg", className: "w-full" })}>
                  Say hello in the Console
                </Link>
                <div className="flex gap-2">
                  <Link href={agentHref(minted.id)} className={buttonClass({ variant: "outline", size: "lg", className: "flex-1" })}>
                    View agent
                  </Link>
                  <Button variant="outline" size="lg" className="flex-1" onClick={close}>
                    Done
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </BoardPage>
  );
}
