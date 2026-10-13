// Screenshots of the interactive states (wallet modal, console chat, burn, reveal).
// Run against a running copy of the site: node scripts/capture-states.mjs [baseUrl]
import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const BASE = process.argv[2] || "http://localhost:4173";
const OUT = new URL("../screenshots/states/", import.meta.url);
await mkdir(OUT, { recursive: true });
const shot = (page, name) => page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, OUT)) });

const browser = await chromium.launch();
for (const [label, viewport] of [["1440", { width: 1440, height: 900 }], ["375", { width: 375, height: 812 }]]) {
  const page = await (await browser.newContext({ viewport })).newPage();
  const open = async (path) => {
    await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(500);
  };

  await open("/console/");
  await page.getByRole("button", { name: "Connect wallet" }).first().click();
  await page.waitForTimeout(400);
  await shot(page, `wallet-modal-${label}`);
  await page.getByRole("dialog").getByRole("button", { name: /Tidepool/ }).click();
  await page.waitForTimeout(600);
  for (const text of ["Balance", "Trade 0.05 SOL", "send 1 SOL to my friend"]) {
    await page.getByLabel("Message").fill(text);
    await page.getByRole("button", { name: "Send", exact: true }).click();
    await page.waitForTimeout(2300);
  }
  await page.getByLabel("Message").fill("what can you do");
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await page.waitForTimeout(350);
  await shot(page, `console-chat-${label}`);

  await open("/mint/");
  await page.getByRole("button", { name: /Burn .* and mint/ }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Burn and mint" }).click();
  await page.waitForTimeout(1200);
  await shot(page, `mint-burning-${label}`);
  await page.getByRole("dialog").getByText(/Meet #/).waitFor({ timeout: 8000 });
  await page.waitForTimeout(900);
  await shot(page, `mint-reveal-${label}`);

  await open("/market/");
  await page.getByRole("button", { name: /^Buy/ }).first().click();
  await page.waitForTimeout(400);
  await shot(page, `market-buy-${label}`);

  if (label === "1440") {
    await open("/");
    await page.mouse.move(700, 720);
    await page.waitForTimeout(700);
    await shot(page, `home-hover-${label}`);
    await open("/roles/");
    await page.getByRole("button", { name: /^Folio/ }).click();
    await page.waitForTimeout(600);
    await shot(page, `roles-info-${label}`);
  }
  await page.context().close();
  console.log(`captured states @ ${label}`);
}
await browser.close();
