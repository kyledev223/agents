// Freezes a page transition part-way through and screenshots it, so the layering
// and timing can be inspected. Also reports which view-transition groups ran.
// Run against a running copy of the site:
//   node scripts/capture-transition.mjs [baseUrl]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const BASE = process.argv[2] || "http://localhost:4173";
const OUT = new URL("../screenshots/transitions/", import.meta.url);
await mkdir(OUT, { recursive: true });

// [label, start path, link text to click, viewport]
const CASES = [
  ["home-to-agents", "/", "Agents", { width: 1440, height: 900 }],
  ["agents-to-market", "/agents/", "Market", { width: 1440, height: 900 }],
  ["market-to-mint", "/market/", "Mint", { width: 1440, height: 900 }],
  ["mint-to-home", "/mint/", "Home", { width: 1440, height: 900 }],
  ["mobile-agents-to-docs", "/agents/", "Docs", { width: 375, height: 812 }],
];
const TIMES = [70, 230, 420];

const browser = await chromium.launch();
for (const [label, start, link, viewport] of CASES) {
  for (const t of TIMES) {
    const page = await (await browser.newContext({ viewport })).newPage();
    const problems = [];
    page.on("console", (m) => ["error", "warning"].includes(m.type()) && problems.push(m.text().slice(0, 160)));
    await page.goto(`${BASE}${start}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(700);

    // Pause every view-transition animation at time t as soon as the transition is ready.
    await page.evaluate((at) => {
      const original = document.startViewTransition.bind(document);
      document.startViewTransition = (arg) => {
        const transition = original(arg);
        transition.ready.then(() => {
          const animations = document.getAnimations().filter((a) => a.effect?.pseudoElement?.startsWith("::view-transition"));
          window.__vt = animations.map((a) => `${a.effect.pseudoElement} ${a.animationName ?? ""}`.trim());
          for (const a of animations) {
            a.pause();
            a.currentTime = at;
          }
        });
        return transition;
      };
    }, t);

    if (viewport.width < 768) await page.getByRole("button", { name: "Menu" }).click();
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: link, exact: true }).click();
    await page.waitForFunction(() => Array.isArray(window.__vt), null, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(250);
    await page.screenshot({ path: fileURLToPath(new URL(`${label}-${t}ms.png`, OUT)) });
    if (t === TIMES[0]) {
      const groups = await page.evaluate(() => window.__vt ?? null);
      console.log(`${label}: ${groups ? [...new Set(groups.map((g) => g.replace(/^::view-transition-/, "")))].join(", ") : "NO TRANSITION RAN"}`);
      if (problems.length) console.log(`  console: ${[...new Set(problems)].join(" | ")}`);
    }
    await page.context().close();
  }
}
await browser.close();
