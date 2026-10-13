import { AgentDetail } from "@/components/agents/AgentDetail";
import { MAX_SUPPLY } from "@/config/site";

// Static export: every possible agent number gets a page, minted or not.
export const dynamicParams = false;

export function generateStaticParams() {
  return Array.from({ length: MAX_SUPPLY }, (_, i) => ({ id: String(i + 1) }));
}

export default async function AgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AgentDetail id={Number(id)} />;
}
