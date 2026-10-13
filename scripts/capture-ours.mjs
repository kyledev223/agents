// Screenshots of this site, for side-by-side comparison with /reference.
// Run the site first (npm run dev, or serve ./out), then:
//   node scripts/capture-ours.mjs [baseUrl] [page,page,...] [width,width,...]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const BASE = process.argv[2] || "http://localhost:3000";
const PAGES = (process.argv[3] || "home,agents,agents/412,market,mint,console,docs,roles").split(",");
const WIDTHS = (process.argv[4] || "375,768,1440").split(",").map(Number);
const OUT = new URL("../screenshots/", import.meta.url);

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch();
for (const width of WIDTHS) {
  const ctx = await browser.newContext({
    viewport: { width, height: width === 375 ? 812 : width === 768 ? 1024 : 900 },
    deviceScaleFactor: 1,
  });
  const page = await ctx.newPage();
  page.on("pageerror", (e) => console.log(`  [page error] ${e.message}`));
  page.on("console", (m) => m.type() === "error" && console.log(`  [console] ${m.text().slice(0, 300)}`));
  for (const p of PAGES) {
    const path = p === "home" ? "" : `${p}/`;
    await page.goto(`${BASE}/${path}`, { waitUntil: "networkidle", timeout: 90000 });
    await page.waitForTimeout(1800);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    await page.screenshot({ path: fileURLToPath(new URL(`${p.replace(/\//g, "-")}-${width}.png`, OUT)), fullPage: true });
    console.log(`captured ${p} @ ${width}${overflow > 0 ? `  (horizontal overflow: ${overflow}px)` : ""}`);
  }
  await ctx.close();
}
await browser.close();
