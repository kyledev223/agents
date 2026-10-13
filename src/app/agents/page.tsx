"use client";

import { useMemo, useState } from "react";
import { AgentCard } from "@/components/agents/AgentCard";
import { BoardPage } from "@/components/scene/BoardPage";
import { Pill } from "@/components/ui/Button";
import { MAX_SUPPLY } from "@/config/site";
import { useStore } from "@/state/store";

const PAGE_SIZE = 24;
type Sort = "newest" | "balance";

export default function AgentsPage() {
  const { agents, stats } = useStore();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [listedOnly, setListedOnly] = useState(false);
  const [page, setPage] = useState(0);

  const results = useMemo(() => {
    const digits = query.replace(/\D/g, "").replace(/^0+/, "");
    const text = query.trim().toLowerCase();
    return agents
      .filter((a) => !listedOnly || a.listing)
      .filter((a) => {
        if (!text) return true;
        if (digits) return String(a.id).includes(digits);
        return a.name.toLowerCase().includes(text);
      })
      .sort((a, b) => (sort === "balance" ? b.balanceSol - a.balanceSol || a.id - b.id : b.mintedAt - a.mintedAt || b.id - a.id));
  }, [agents, query, sort, listedOnly]);

  const pages = Math.max(1, Math.ceil(results.length / PAGE_SIZE));
  const current = Math.min(page, pages - 1);
  const visible = results.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);
  const change = (fn: () => void) => {
    fn();
    setPage(0);
  };

  return (
    <BoardPage
      surface="whiteboard"
      eyebrow="Explore"
      title="Agents"
      intro={
        <>
          Every agent minted so far, {stats.minted.toLocaleString("en-US")} of {MAX_SUPPLY.toLocaleString("en-US")}. Each one is an NFT with its own
          wallet, and belongs to whoever holds it.
        </>
      }
    >
      <div className="mb-6 flex flex-col gap-3 @5xl:flex-row @5xl:items-center @5xl:justify-between">
        <form className="flex w-full max-w-[640px] gap-2 @5xl:max-w-[520px]" onSubmit={(e) => e.preventDefault()} role="search">
          <label htmlFor="agent-search" className="sr-only">
            Search agents
          </label>
          <input
            id="agent-search"
            value={query}
            onChange={(e) => change(() => setQuery(e.target.value))}
            inputMode="search"
            placeholder="Agent number, e.g. 0412"
            className="h-11 min-w-0 flex-1 rounded-full border border-rule bg-card px-5 text-[15px] outline-none placeholder:text-ink-4 focus:border-ink-3"
          />
          <button type="submit" className="h-11 shrink-0 rounded-full bg-ink px-5 text-[15px] font-medium text-white">
            Search
          </button>
        </form>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Sort and filter">
          <Pill active={sort === "newest"} onClick={() => change(() => setSort("newest"))}>
            Newest
          </Pill>
          <Pill active={sort === "balance"} onClick={() => change(() => setSort("balance"))}>
            Wallet balance
          </Pill>
          <Pill active={listedOnly} onClick={() => change(() => setListedOnly((v) => !v))}>
            Listed only
          </Pill>
        </div>
      </div>

      <p className="tabular mb-3 text-[13px] text-ink-3">
        {results.length.toLocaleString("en-US")} {results.length === 1 ? "agent" : "agents"}
      </p>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-rule bg-card px-5 py-10 text-center text-[15px] text-ink-3">
          No agent matches that. Numbers run from #0001 to #{String(stats.minted).padStart(4, "0")} so far.
        </div>
      ) : (
        <ul className="grid gap-3 @xl:grid-cols-2 @4xl:grid-cols-3 @5xl:grid-cols-4 @6xl:grid-cols-5 @7xl:grid-cols-6">
          {visible.map((agent) => (
            <li key={agent.id}>
              <AgentCard agent={agent} />
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pages">
          <button
            type="button"
            disabled={current === 0}
            onClick={() => setPage(current - 1)}
            className="rounded-full border border-outline px-5 py-2.5 text-[14px] font-medium hover:bg-paper-2 disabled:border-rule disabled:text-ink-4 disabled:hover:bg-transparent"
          >
            Previous
          </button>
          <span className="tabular px-2 text-[14px] text-ink-3">
            Page {current + 1} of {pages}
          </span>
          <button
            type="button"
            disabled={current >= pages - 1}
            onClick={() => setPage(current + 1)}
            className="rounded-full border border-outline px-5 py-2.5 text-[14px] font-medium hover:bg-paper-2 disabled:border-rule disabled:text-ink-4 disabled:hover:bg-transparent"
          >
            Next
          </button>
        </nav>
      )}
    </BoardPage>
  );
}
