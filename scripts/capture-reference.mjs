// Captures the visual target: full-page screenshots of hireagents.fun at three
// widths, plus computed styles for the key elements. Output goes to /reference.
// Run: node scripts/capture-reference.mjs
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const BASE = "https://hireagents.fun";
const PAGES = ["", "launch", "coins", "teams", "milestones", "leaderboard", "docs"];
const WIDTHS = [375, 768, 1440];
const OUT = new URL("../reference/", import.meta.url);

const PROPS = [
  "fontFamily", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "textTransform",
  "color", "backgroundColor", "backgroundImage", "borderRadius", "border", "boxShadow",
  "padding", "margin", "height", "width", "gap", "backdropFilter", "transition",
];

// Selectors are tried in order; the first visible match wins.
const TARGETS = {
  body: ["body"],
  nav: ["nav[aria-label='Main']", "header"],
  navLinkActive: ["nav a[aria-current='page']"],
  navLink: ["nav a:not([aria-current])"],
  logo: ["a[aria-label='HIRE home']", "a[aria-label='HIRE home'] span"],
  h1: ["h1"],
  h2: ["h2"],
  bodyText: ["h1 + p", "h1 + div", "main p"],
  primaryButton: ["a[href='/launch'].rounded-full", "button.bg-ink", "a.bg-ink"],
  secondaryButton: ["a[href='/coins'].rounded-full", "a.border.rounded-full"],
  card: ["a.rounded-2xl.border", "section.rounded-2xl.border", "div.rounded-2xl.border", "li.rounded-2xl.border"],
  tickerStrip: [".screen-ticker"],
  liveScreen: ["section[aria-label='Live coins']"],
  teamCard: ["a[href='/teams'].rounded-2xl", "ul.grid a.rounded-2xl"],
  statusPill: ["[role='status']"],
  connectButton: ["button:has-text('Connect')"],
  tableHead: ["th"],
  tableCell: ["td"],
  input: ["input:not(.hidden)"],
  boardBox: [".board-box"],
  footer: ["footer"],
};

const browser = await chromium.launch();
const styles = {};

for (const width of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width, height: width === 375 ? 812 : width === 768 ? 1024 : 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  for (const p of PAGES) {
    const name = p || "home";
    try {
      await page.goto(`${BASE}/${p}`, { waitUntil: "networkidle", timeout: 60000 });
    } catch {
      await page.goto(`${BASE}/${p}`, { waitUntil: "load", timeout: 60000 });
    }
    await page.waitForTimeout(2500);
    await mkdir(OUT, { recursive: true });
    await page.screenshot({
      path: fileURLToPath(new URL(`${name}-${width}.png`, OUT)),
      fullPage: true,
    });

    const result = {};
    for (const [key, selectors] of Object.entries(TARGETS)) {
      for (const sel of selectors) {
        const loc = page.locator(sel).filter({ visible: true }).first();
        if ((await loc.count()) === 0) continue;
        result[key] = await loc.evaluate((el, props) => {
          const cs = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          const out = { _text: (el.textContent || "").trim().slice(0, 60) };
          for (const k of props) out[k] = cs[k];
          out._rect = [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)];
          return out;
        }, PROPS);
        result[key]._selector = sel;
        break;
      }
    }
    styles[`${name}@${width}`] = result;
    console.log(`captured ${name} @ ${width}`);
  }
  await ctx.close();
}

await writeFile(new URL("computed-styles.json", OUT), JSON.stringify(styles, null, 2));
await browser.close();
