"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { agentHref } from "@/components/agents/AgentCard";
import { AgentAvatar } from "@/components/agents/robot";
import { BoardPage } from "@/components/scene/BoardPage";
import { Panel, Tag } from "@/components/ui/bits";
import { Button, ButtonLink } from "@/components/ui/Button";
import { ShieldIcon, WrenchIcon } from "@/components/ui/icons";
import { DAILY_CAP_SOL, PER_TRADE_CAP_SOL } from "@/config/site";
import { padId, sol, truncate } from "@/lib/format";
import { useHash } from "@/lib/hooks";
import type { Agent, ChatMessage, ToolCall } from "@/lib/types";
import { useStore } from "@/state/store";

const QUICK = ["Balance", "What can you do?", "Trade 0.05 SOL", "What's trending?", "Send 0.1 SOL to me"];

function ToolCard({ tool }: { tool: ToolCall }) {
  const blocked = tool.status === "blocked";
  return (
    <div className={`w-full max-w-[320px] rounded-xl border px-3.5 py-2.5 ${blocked ? "border-loss/30 bg-loss-soft" : "border-rule bg-paper"}`}>
      <p className={`flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.08em] ${blocked ? "text-loss" : "text-ink-3"}`}>
        {blocked ? <ShieldIcon className="text-[13px]" /> : <WrenchIcon className="text-[13px]" />}
        {tool.title}
        <span className="ml-auto normal-case tracking-normal">{blocked ? "blocked" : "ok"}</span>
      </p>
      <dl className="mt-1.5 space-y-1 text-[12.5px]">
        {tool.rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3">
            <dt className="text-ink-3">{label}</dt>
            <dd className="tabular text-right font-semibold text-ink-2">{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function Bubble({ message }: { message: ChatMessage }) {
  const mine = message.from === "holder";
  return (
    <li className={`flex flex-col gap-1.5 ${mine ? "items-end" : "items-start"}`}>
      {message.tools?.map((tool, i) => <ToolCard key={i} tool={tool} />)}
      <p
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-[14.5px] leading-relaxed ${
          mine ? "rounded-br-md bg-ink text-white" : "rounded-bl-md border border-rule bg-card text-ink"
        }`}
      >
        {message.text}
      </p>
    </li>
  );
}

function Typing() {
  return (
    <li className="flex items-start" aria-label="Agent is typing">
      <span className="flex items-center gap-1 rounded-2xl rounded-bl-md border border-rule bg-card px-4 py-3.5">
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-ink-4" style={{ animationDelay: `${i * 0.14}s` }} />
        ))}
      </span>
    </li>
  );
}

function Chat({ agent }: { agent: Agent }) {
  const { chatOf, sendChat, agentReply } = useStore();
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const scroller = useRef<HTMLDivElement>(null);
  const timer = useRef<number | null>(null);
  const messages = chatOf(agent.id);

  useEffect(() => {
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight });
  }, [messages.length, typing, agent.id]);

  // Chat is keyed by agent, so switching agents (or leaving) unmounts this and
  // drops a reply that is still "being typed".
  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const send = (text: string) => {
    const clean = text.trim();
    if (!clean || typing) return;
    sendChat(agent.id, clean);
    setDraft("");
    setTyping(true);
    const id = agent.id;
    timer.current = window.setTimeout(() => {
      agentReply(id, clean);
      setTyping(false);
    }, 700 + Math.min(clean.length * 18, 900));
  };

  return (
    <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-rule bg-card" aria-label={`Chat with ${agent.name}`}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-rule px-5 py-3.5">
        <div className="flex min-w-0 items-center gap-3">
          <AgentAvatar id={agent.id} size={44} />
          <div className="min-w-0">
            <p className="font-display truncate text-[18px] font-extrabold leading-tight">
              <span className="tabular">{padId(agent.id)}</span> <span className="font-semibold text-ink-3">{agent.name}</span>
            </p>
            <p className="tabular truncate text-[12.5px] text-ink-3">
              Wallet {truncate(agent.wallet)} · {sol(agent.balanceSol, 3)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {agent.listing && <Tag tone="win">Listed</Tag>}
          <Link href={agentHref(agent.id)} className="text-[13px] font-semibold underline decoration-rule underline-offset-4">
            Agent page
          </Link>
        </div>
      </header>

      <div ref={scroller} className="h-[320px] overflow-y-auto bg-paper/60 px-4 py-4 @3xl:h-[272px]">
        {messages.length === 0 && !typing ? (
          <div className="grid h-full place-items-center text-center">
            <div>
              <p className="text-[15px] font-semibold">A blank memory.</p>
              <p className="mx-auto mt-1 max-w-[300px] text-[13.5px] leading-relaxed text-ink-3">
                {agent.name} remembers nothing from before you. Say hello, or try one of the prompts below.
              </p>
            </div>
          </div>
        ) : (
          <ul className="space-y-3">
            {messages.map((message) => (
              <Bubble key={message.id} message={message} />
            ))}
            {typing && <Typing />}
          </ul>
        )}
      </div>

      <div className="border-t border-rule px-4 pb-4 pt-3">
        <div className="mb-2.5 flex flex-wrap gap-2">
          {QUICK.map((prompt) => (
            <button
              key={prompt}
              type="button"
              disabled={typing}
              onClick={() => send(prompt)}
              className="h-8 rounded-full border border-rule bg-card px-3.5 text-[13px] font-medium transition-colors hover:bg-paper-2 disabled:text-ink-4"
            >
              {prompt}
            </button>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
        >
          <label htmlFor="chat-input" className="sr-only">
            Message
          </label>
          <input
            id="chat-input"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            autoComplete="off"
            placeholder={`Message ${agent.name}`}
            className="h-12 min-w-0 flex-1 rounded-xl border border-rule bg-paper px-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-4 focus:bg-white focus-visible:ring-2 focus-visible:ring-ink/30"
          />
          <Button type="submit" size="lg" disabled={typing || !draft.trim()}>
            Send
          </Button>
        </form>
        <p className="mt-2 text-[12.5px] text-ink-3">
          Caps: {sol(PER_TRADE_CAP_SOL)} per trade, {sol(DAILY_CAP_SOL)} per day. Transfers go to you only.
        </p>
      </div>
    </section>
  );
}

export default function ConsolePage() {
  const { wallet, ready, myAgents, setWalletModalOpen } = useStore();
  const [picked, setPicked] = useState<number | null>(null);
  // Deep link from an agent page or the mint reveal: /console#413
  const fromHash = Number(useHash());
  const selected = picked ?? fromHash;

  const active = myAgents.find((a) => a.id === selected) ?? myAgents[0];

  let body: React.ReactNode;
  if (!ready) {
    body = <div className="rounded-2xl border border-rule bg-card px-5 py-10 text-[15px] text-ink-3">Loading the console.</div>;
  } else if (!wallet) {
    body = (
      <Panel eyebrow="Holders only" title="Connect to sign in">
        <p className="max-w-[560px] text-[15px] leading-relaxed text-ink-2">
          An agent only talks to the wallet that holds it. Connect a wallet and any agents it holds will show up here.
        </p>
        <Button size="lg" className="mt-4" onClick={() => setWalletModalOpen(true)}>
          Connect wallet
        </Button>
      </Panel>
    );
  } else if (!active) {
    body = (
      <Panel eyebrow={`${wallet.name} · ${truncate(wallet.address)}`} title="No agents in this wallet">
        <p className="max-w-[560px] text-[15px] leading-relaxed text-ink-2">
          Mint a fresh one, or buy one that is already out there. Either way it arrives with a blank memory.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <ButtonLink href="/mint" size="lg">
            Mint an agent
          </ButtonLink>
          <ButtonLink href="/market" size="lg" variant="outline">
            Browse the Market
          </ButtonLink>
        </div>
      </Panel>
    );
  } else {
    body = (
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 @3xl:grid-cols-[250px_minmax(0,1fr)]">
        <aside className="overflow-hidden rounded-2xl border border-rule bg-card" aria-label="Your agents">
          <p className="border-b border-rule px-4 py-3 text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">
            Your agents · {myAgents.length}
          </p>
          <ul className="max-h-[220px] divide-y divide-rule-soft overflow-y-auto @3xl:max-h-[470px]">
            {myAgents.map((agent) => {
              const on = agent.id === active.id;
              return (
                <li key={agent.id}>
                  <button
                    type="button"
                    onClick={() => setPicked(agent.id)}
                    aria-current={on ? "true" : undefined}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${on ? "bg-paper-2" : "hover:bg-paper"}`}
                  >
                    <AgentAvatar id={agent.id} size={38} />
                    <span className="min-w-0 flex-1">
                      <span className="tabular block truncate text-[14.5px] font-semibold">{padId(agent.id)}</span>
                      <span className="block truncate text-[12.5px] text-ink-3">{agent.name}</span>
                    </span>
                    <span className="tabular shrink-0 text-[12.5px] font-semibold text-ink-2">{sol(agent.balanceSol, 2)}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </aside>
        <Chat key={active.id} agent={active} />
      </div>
    );
  }

  return (
    <BoardPage
      surface="screen"
      eyebrow="Console"
      title="Talk to your agent."
      intro="Private to the holder. Ask for a balance, a small trade, what is moving on X, or your funds back."
    >
      {body}
    </BoardPage>
  );
}
