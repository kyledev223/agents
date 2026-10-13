"use client";

import { useSyncExternalStore } from "react";

const noop = () => () => {};

// False during server render and hydration, true afterwards.
export function useMounted(): boolean {
  return useSyncExternalStore(noop, () => true, () => false);
}

function subscribeHash(onChange: () => void) {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
}

// The URL fragment without the leading "#"; empty on the server.
export function useHash(): string {
  return useSyncExternalStore(subscribeHash, () => window.location.hash.slice(1), () => "");
}
