"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/icons";
import { Modal } from "@/components/ui/Modal";
import { MARKET_FEE } from "@/config/site";
import { padId, sol, truncate } from "@/lib/format";
import type { Agent } from "@/lib/types";
import { useStore } from "@/state/store";
import { AgentAvatar } from "./robot";

const FEE_PCT = `${Math.round(MARKET_FEE * 100)}%`;

function Summary({ agent, rows }: { agent: Agent; rows: [string, string][] }) {
  return (
    <>
      <div className="flex items-center gap-3 rounded-xl border border-rule bg-paper px-4 py-3">
        <AgentAvatar id={agent.id} size={44} />
        <div className="min-w-0">
          <p className="font-display tabular truncate text-[17px] font-extrabold leading-tight">{padId(agent.id)}</p>
          <p className="truncate text-[13px] text-ink-3">{agent.name}</p>
        </div>
      </div>
      <dl className="mt-3 space-y-2 text-[13.5px]">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-3">
            <dt className="text-ink-3">{label}</dt>
            <dd className="tabular text-right font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

// Pretend signature: a spinner, a pause, then the local state change.
function useSigning() {
  const [signing, setSigning] = useState(false);
  const sign = (ms: number, then: () => void) => {
    setSigning(true);
    window.setTimeout(() => {
      setSigning(false);
      then();
    }, ms);
  };
  return { signing, sign };
}

type Size = "sm" | "md" | "lg";

export function BuyButton({ agent, size = "sm", className = "" }: { agent: Agent; size?: Size; className?: string }) {
  const { wallet, setWalletModalOpen, buy, toast } = useStore();
  const [open, setOpen] = useState(false);
  const { signing, sign } = useSigning();
  if (!agent.listing) return null;
  const price = agent.listing.priceSol;
  const short = wallet ? wallet.sol < price : false;

  const confirm = () =>
    sign(1500, () => {
      const result = buy(agent.id);
      setOpen(false);
      if (result.ok) toast(`You now hold ${padId(agent.id)}. Its memory was wiped.`);
      else toast(result.reason, "error");
    });

  return (
    <>
      <Button size={size} className={className} onClick={() => (wallet ? setOpen(true) : setWalletModalOpen(true))}>
        Buy · {sol(price)}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} eyebrow="Purchase" title={`Buy ${padId(agent.id)}`} dismissable={!signing}>
        <Summary
          agent={agent}
          rows={[
            ["Price", sol(price)],
            [`Marketplace fee (${FEE_PCT}, paid by seller)`, sol(price * MARKET_FEE, 3)],
            ["Seller receives", sol(price * (1 - MARKET_FEE), 3)],
            ["Comes with wallet balance", sol(agent.balanceSol, 3)],
            ["Your SOL after", wallet ? sol(wallet.sol - price) : "-"],
          ]}
        />
        <p className="mt-3 rounded-xl bg-paper-2 px-3.5 py-2.5 text-[12.5px] leading-relaxed text-ink-2">
          The agent&apos;s wallet moves with the NFT. Its memory of {truncate(agent.holder)} is wiped before you sign in.
        </p>
        {short && <p className="mt-3 text-[13px] font-medium text-loss">This wallet does not have enough SOL for that.</p>}
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="lg" className="flex-1" disabled={signing} onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="lg" className="flex-1" disabled={signing || short} onClick={confirm}>
            {signing ? (
              <>
                <Spinner /> Signing…
              </>
            ) : (
              "Confirm purchase"
            )}
          </Button>
        </div>
      </Modal>
    </>
  );
}

export function ListButton({ agent, size = "sm", className = "" }: { agent: Agent; size?: Size; className?: string }) {
  const { list, toast } = useStore();
  const [open, setOpen] = useState(false);
  const [price, setPrice] = useState("");
  const { signing, sign } = useSigning();
  const value = Number(price);
  const valid = Number.isFinite(value) && value > 0;

  const confirm = () =>
    sign(900, () => {
      const result = list(agent.id, Math.round(value * 100) / 100);
      setOpen(false);
      if (!result.ok) toast(result.reason, "error");
    });

  return (
    <>
      <Button
        variant="outline"
        size={size}
        className={className}
        onClick={() => {
          setPrice((Math.max(agent.balanceSol * 1.1, 0.5) + 0.5).toFixed(2));
          setOpen(true);
        }}
      >
        List for sale
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} eyebrow="Listing" title={`List ${padId(agent.id)}`} dismissable={!signing}>
        <Summary agent={agent} rows={[["Wallet balance (goes with it)", sol(agent.balanceSol, 3)]]} />
        <div className="mt-4">
          <label htmlFor={`price-${agent.id}`} className="mb-1.5 block text-[13.5px] font-semibold text-ink">
            Price
          </label>
          <div className="flex h-12 rounded-xl border border-rule bg-paper focus-within:bg-white focus-within:ring-2 focus-within:ring-ink/30">
            <input
              id={`price-${agent.id}`}
              inputMode="decimal"
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^0-9.]/g, ""))}
              className="tabular min-w-0 flex-1 bg-transparent px-3.5 text-[16px] font-semibold text-ink outline-none"
            />
            <span className="flex items-center border-l border-rule px-3.5 text-[13px] font-bold text-ink-2">SOL</span>
          </div>
          <p className="tabular mt-2 text-[12.5px] text-ink-3">
            The {FEE_PCT} fee comes out of your side: you receive {valid ? sol(value * (1 - MARKET_FEE), 3) : "-"}.
          </p>
        </div>
        <div className="mt-4 flex gap-2">
          <Button variant="outline" size="lg" className="flex-1" disabled={signing} onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button size="lg" className="flex-1" disabled={signing || !valid} onClick={confirm}>
            {signing ? (
              <>
                <Spinner /> Signing…
              </>
            ) : (
              "List agent"
            )}
          </Button>
        </div>
      </Modal>
    </>
  );
}

export function CancelListingButton({ agent, size = "sm", className = "" }: { agent: Agent; size?: Size; className?: string }) {
  const { cancelListing, toast } = useStore();
  const { signing, sign } = useSigning();
  return (
    <Button
      variant="outline"
      size={size}
      className={className}
      disabled={signing}
      onClick={() =>
        sign(700, () => {
          const result = cancelListing(agent.id);
          if (!result.ok) toast(result.reason, "error");
        })
      }
    >
      {signing ? (
        <>
          <Spinner /> Signing…
        </>
      ) : (
        "Cancel listing"
      )}
    </Button>
  );
}

// The right action for whoever is looking: buy, list or cancel.
export function TradeActions({ agent, size = "sm", className = "" }: { agent: Agent; size?: Size; className?: string }) {
  const { wallet } = useStore();
  const mine = wallet?.address === agent.holder;
  if (mine) return agent.listing ? <CancelListingButton agent={agent} size={size} className={className} /> : <ListButton agent={agent} size={size} className={className} />;
  return agent.listing ? <BuyButton agent={agent} size={size} className={className} /> : null;
}
