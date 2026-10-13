export const padId = (id: number) => `#${String(id).padStart(4, "0")}`;

export const truncate = (address: string, head = 4, tail = 4) =>
  address.length <= head + tail + 3 ? address : `${address.slice(0, head)}...${address.slice(-tail)}`;

export function sol(value: number, digits = 2): string {
  const d = value !== 0 && Math.abs(value) < 1 ? Math.max(digits, 3) : digits;
  return `${value.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d })} SOL`;
}

export const whole = (value: number) => Math.round(value).toLocaleString("en-US");

export function compact(value: number): string {
  const abs = Math.abs(value);
  const trim = (n: number) => n.toFixed(1).replace(/\.0$/, "");
  if (abs >= 1e9) return `${trim(value / 1e9)}B`;
  if (abs >= 1e6) return `${trim(value / 1e6)}M`;
  if (abs >= 1e3) return `${trim(value / 1e3)}K`;
  return trim(value);
}

export function timeAgo(at: number, now: number): string {
  const s = Math.max(0, Math.round((now - at) / 1000));
  if (s < 45) return "just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}
