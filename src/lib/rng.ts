// Small deterministic PRNG so the mock data is identical on every load.
export function hash(input: string | number): number {
  const s = String(input);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Rng = () => number;

export const rngFor = (...parts: (string | number)[]) => mulberry32(hash(parts.join(":")));

export const pick = <T,>(r: Rng, list: readonly T[]): T => list[Math.floor(r() * list.length)];

export const between = (r: Rng, min: number, max: number) => min + r() * (max - min);

const BASE58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export function fakeAddress(seed: string, prefix = ""): string {
  const r = rngFor("addr", seed);
  let out = prefix;
  while (out.length < 44) out += BASE58[Math.floor(r() * BASE58.length)];
  return out;
}
