import type { ReactNode } from "react";
import { Lifecycle } from "@/components/home/Sections";
import { BoardPage } from "@/components/scene/BoardPage";
import { DAILY_CAP_SOL, MARKET_FEE, MAX_SUPPLY, MINT_COST, PER_TRADE_CAP_SOL, PROJECT_NAME, TICKER } from "@/config/site";
import { ROLES } from "@/lib/roles";

const cost = MINT_COST.toLocaleString("en-US");
const supply = MAX_SUPPLY.toLocaleString("en-US");
const fee = `${Math.round(MARKET_FEE * 100)}%`;

const card = "rounded-2xl border border-rule bg-card/90";

function Steps({ items }: { items: ReactNode[] }) {
  return (
    <ol className="space-y-2.5">
      {items.map((item, i) => (
        <li key={i} className={`flex gap-3.5 ${card} px-4 py-3`}>
          <span className="font-display tabular text-[18px] font-extrabold text-ink-4">{i + 1}</span>
          <span>{item}</span>
        </li>
      ))}
    </ol>
  );
}

const TOOLSET: { tool: string; desk: string; does: string }[] = [
  { tool: "get_balance", desk: "Treasurer", does: "Reads the agent wallet's SOL and token balances." },
  { tool: "get_quote", desk: "Trader", does: "Prices a swap before anything is signed." },
  { tool: "place_swap", desk: "Trader", does: "Swaps from the agent's own wallet, inside the caps." },
  { tool: "search_posts", desk: "Scout", does: "Reads public posts on X. Read-only; it never posts." },
  { tool: "send_to_holder", desk: "Treasurer", does: "Sends funds to the current holder's wallet, and nowhere else." },
  { tool: "remember / recall", desk: "Archivist", does: "Keeps notes for the current holder only." },
  { tool: "wipe_on_transfer", desk: "Archivist", does: "Empties the memory when the NFT changes hands." },
  { tool: "check_caps", desk: "Auditor", does: "Runs before every signature. Blocks anything over a limit." },
];

const LIMITS: { title: string; body: string }[] = [
  { title: "Keys never leave the server", body: "No tool can read, print or export a private key. Asking the agent for one gets a refusal, every time." },
  { title: "Transfers go to the holder only", body: "The only outbound destination is the wallet that currently holds the NFT. Any other address is blocked before signing." },
  { title: `Per-trade cap: ${PER_TRADE_CAP_SOL} SOL`, body: "A single swap can never be larger than this, whatever the agent is told." },
  { title: `Daily cap: ${DAILY_CAP_SOL} SOL`, body: "Once a day's swaps add up to this, trading stops until the next day." },
];

const FAQ: { q: string; a: string }[] = [
  { q: "Is any of this real?", a: `No. ${PROJECT_NAME} is a front-end simulation. There is no program, no token transfers and no wallet connection; every number lives in your browser's local storage.` },
  { q: "What happens to the agent's wallet when I sell it?", a: "It goes with the NFT, balance and all. That is why a listing shows the wallet balance next to the price." },
  { q: "Can the previous holder still talk to it?", a: "No. The Console checks who holds the NFT before every message, and the memory from the previous holder is gone." },
  { q: `Who pays the ${fee} marketplace fee?`, a: "The seller. A buyer pays exactly the listed price, and the fee is taken from what the seller receives." },
  { q: "Are the chat replies an AI model?", a: "Not here. The Console uses scripted, rule-based replies so the site works with no backend." },
  { q: "How do I start over?", a: "Open the wallet menu and choose Reset the simulation. That clears everything stored in your browser." },
];

interface Section {
  id: string;
  title: string;
  body: ReactNode;
}

const SECTIONS: Section[] = [
  {
    id: "idea",
    title: "The idea",
    body: (
      <>
        <p>
          An agent here is a numbered NFT, #0001 to #{String(MAX_SUPPLY).padStart(4, "0")}, that gives its holder access to an AI agent with a wallet of
          its own. You do not rent it and you do not log in to it. You hold it, and while you hold it, it works for you.
        </p>
        <p>
          Because it is an NFT, it can be transferred or sold like any other. The wallet goes with it. What does not go with it is the memory: every new
          holder gets the same agent, starting from zero.
        </p>
      </>
    ),
  },
  {
    id: "mint",
    title: "Minting",
    body: (
      <>
        <Steps
          items={[
            <>Connect a wallet that holds at least {cost} {TICKER}.</>,
            <>Confirm the burn. {cost} {TICKER} is destroyed, not paid to anyone.</>,
            <>The next number in line is minted to you, with an empty wallet and a blank memory.</>,
          ]}
        />
        <p>
          Supply is capped at {supply}. When the last one is minted, the only way to get an agent is to buy one from a holder.
        </p>
      </>
    ),
  },
  {
    id: "life",
    title: "An agent's life",
    body: (
      <>
        <Lifecycle />
        <p>Stages three and four repeat for as long as you hold it. Stage five starts the loop again for someone else.</p>
      </>
    ),
  },
  {
    id: "team",
    title: "The six jobs",
    body: (
      <>
        <p>Every agent runs the same six jobs. In the office they are six characters; in practice they are six sets of tools with one voice.</p>
        <ul className="grid gap-2.5 @2xl:grid-cols-2">
          {ROLES.map((role) => (
            <li key={role.key} className={`${card} h-full px-4 py-3`}>
              <span className="flex items-baseline justify-between gap-3">
                <span className="text-[15px] font-semibold text-ink">
                  {role.name} · {role.role}
                </span>
                <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">{role.does}</span>
              </span>
              <span className="mt-0.5 block text-[14px] text-ink-2">{role.summary}</span>
              <span className="mt-1 block text-[12.5px] text-ink-3">{role.cadence}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "capabilities",
    title: "Capabilities",
    body: (
      <>
        <p>This is the whole toolset. An agent cannot do anything that is not on this list.</p>
        <div className={`${card} overflow-hidden`}>
          <ul className="divide-y divide-rule-soft">
            {TOOLSET.map((row) => (
              <li key={row.tool} className="grid gap-1 px-4 py-3 @2xl:grid-cols-[190px_110px_1fr] @2xl:items-baseline @2xl:gap-4">
                <code className="font-digital text-[14px] text-ink">{row.tool}</code>
                <span className="text-[11.5px] font-semibold uppercase tracking-[0.08em] text-ink-3">{row.desk}</span>
                <span className="text-[14px] text-ink-2">{row.does}</span>
              </li>
            ))}
          </ul>
        </div>
      </>
    ),
  },
  {
    id: "limits",
    title: "Hard limits",
    body: (
      <>
        <p>These are enforced outside the agent, by the signer. The agent cannot talk its way around them, and neither can its holder.</p>
        <ul className="grid gap-2.5 @2xl:grid-cols-2">
          {LIMITS.map((limit) => (
            <li key={limit.title} className={`${card} px-4 py-3`}>
              <span className="block text-[15px] font-semibold text-ink">{limit.title}</span>
              <span className="mt-0.5 block text-[14px] leading-relaxed text-ink-2">{limit.body}</span>
            </li>
          ))}
        </ul>
      </>
    ),
  },
  {
    id: "memory",
    title: "Memory",
    body: (
      <>
        <p>
          While you hold an agent, it keeps the thread of your conversation so it can pick up where you left off. That memory is tied to you, not to the
          NFT.
        </p>
        <p>
          The moment the NFT moves, by sale or transfer, the memory is wiped. The new holder cannot read what you said, and you cannot read what they
          say next.
        </p>
      </>
    ),
  },
  {
    id: "market",
    title: "Market and fees",
    body: (
      <>
        <Steps
          items={[
            <>A holder lists an agent at a price in SOL. They can cancel at any time before it sells.</>,
            <>A buyer pays the listed price. The {fee} fee comes out of the seller&apos;s side.</>,
            <>Ownership moves, the agent&apos;s wallet stays attached, and its memory is wiped.</>,
          ]}
        />
      </>
    ),
  },
  {
    id: "faq",
    title: "Good to know",
    body: (
      <dl className="space-y-3">
        {FAQ.map((item) => (
          <div key={item.q} className={`${card} px-5 py-4`}>
            <dt className="text-[15px] font-semibold text-ink">{item.q}</dt>
            <dd className="mt-1 text-[14.5px] leading-relaxed text-ink-2">{item.a}</dd>
          </div>
        ))}
      </dl>
    ),
  },
];

export default function DocsPage() {
  return (
    <BoardPage
      surface="whiteboard"
      eyebrow={`How ${PROJECT_NAME} works`}
      title="Docs"
      maxWidth="max-w-[1240px]"
      intro={
        <>
          Burn {cost} {TICKER}, get a numbered agent with its own wallet. Here is how that works, what an agent can do, and the limits it cannot cross.
        </>
      }
    >
      <nav className="mb-10 flex flex-wrap gap-2" aria-label="Sections">
        {SECTIONS.map((section, i) => (
          <a key={section.id} href={`#${section.id}`} className="rounded-full border border-outline bg-white/70 px-3.5 py-1.5 text-[13.5px] font-medium hover:bg-white">
            <span className="tabular mr-1.5 text-ink-4">{i + 1}</span>
            {section.title}
          </a>
        ))}
      </nav>
      {SECTIONS.map((section, i) => (
        <section key={section.id} id={section.id} className="scroll-mt-6 border-t border-marker/10 pb-10 pt-8 first:border-t-0 first:pt-0">
          <h2 className="font-display flex items-baseline gap-3 text-[28px] font-extrabold leading-tight @xl:text-[32px]">
            <span className="tabular text-ink-4">{i + 1}</span>
            {section.title}
          </h2>
          <div className="mt-4 max-w-[860px] space-y-4 text-[15.5px] leading-relaxed text-ink-2">{section.body}</div>
        </section>
      ))}
    </BoardPage>
  );
}
