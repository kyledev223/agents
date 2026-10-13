// End-to-end run of the whole simulated flow against a running copy of the site:
//   connect -> mint -> agent shows in Agents and Console -> chat -> list on Market
//   -> switch to a second fake wallet -> buy -> memory wiped
// plus the X / pump.fun links in nav, hero and footer.
// Run: node scripts/flow-test.mjs [baseUrl]
import { chromium } from "playwright";

const BASE = process.argv[2] || "http://localhost:4173";
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => m.type() === "error" && errors.push(`console: ${m.text().slice(0, 200)}`));

let failed = 0;
const check = (name, ok, detail = "") => {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
};
const go = async (path) => {
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
};
const connect = async (name) => {
  await page.getByRole("button", { name: /^(Connect wallet|Wallet menu)$/ }).first().click();
  if (await page.getByRole("button", { name: "Switch wallet" }).count()) await page.getByRole("button", { name: "Switch wallet" }).click();
  await page.getByRole("dialog").getByRole("button", { name: new RegExp(name) }).click();
  await page.waitForTimeout(400);
};

// --- fresh storage: every page renders -------------------------------------
for (const path of ["/", "/agents/", "/agents/7/", "/agents/1999/", "/market/", "/mint/", "/console/", "/docs/", "/roles/"]) {
  await go(path);
  const h1 = await page.locator("h1").filter({ visible: true }).first().textContent();
  check(`renders ${path}`, Boolean(h1), h1?.trim().slice(0, 40));
}

// --- links ------------------------------------------------------------------
await go("/");
const links = await page.evaluate(() =>
  [...document.querySelectorAll("a[target='_blank']")].map((a) => ({
    href: a.getAttribute("href"),
    rel: a.getAttribute("rel"),
    visible: a.getClientRects().length > 0,
    where: a.closest("footer") ? "footer" : a.closest("section[aria-label=\"The agents' office\"]") ? "hero" : a.closest(".fixed") ? "nav" : "other",
  })),
);
for (const where of ["nav", "hero", "footer"]) {
  const here = links.filter((l) => l.where === where && l.visible);
  check(`X link in ${where}`, here.some((l) => l.href.startsWith("https://x.com/") && l.rel === "noopener noreferrer"));
  check(`pump.fun link in ${where}`, here.some((l) => l.href.startsWith("https://pump.fun/") && l.rel === "noopener noreferrer"));
}
const [popup] = await Promise.all([ctx.waitForEvent("page"), page.locator(".fixed a[aria-label$='on X']").click()]);
check("X opens in a new tab", popup.url().includes("x.com"), popup.url());
await popup.close();

// --- connect and mint -------------------------------------------------------
await go("/mint/");
await connect("Lantern");
check("wallet connected", (await page.getByRole("button", { name: "Wallet menu" }).count()) > 0);
check("balance shown", (await page.getByText("2,350,000 $CLAW").count()) > 0);
await page.getByRole("button", { name: /Burn .* and mint/ }).click();
await page.getByRole("dialog").getByRole("button", { name: "Burn and mint" }).click();
await page.getByRole("dialog").getByText("Meet #0413").waitFor({ timeout: 8000 });
check("mint reveals #0413", true);
await page.getByRole("dialog").getByRole("button", { name: "Done" }).click();
check("balance after mint", (await page.getByText("1,850,000 $CLAW").count()) > 0);
check("supply updated", (await page.getByText("413 / 2,000").count()) > 0);

// --- shows up in Agents and Console -----------------------------------------
await go("/agents/");
check("new agent in Agents grid", (await page.locator("a[href='/agents/413/']").count()) > 0);
await go("/");
check("home ticker updated", (await page.getByText(/Agents minted 413/).count()) > 0);
await go("/console/");
check("new agent in Console sidebar", (await page.getByRole("complementary", { name: "Your agents" }).getByText("#0413").count()) > 0);

// --- chat --------------------------------------------------------------------
const say = async (text) => {
  await page.getByLabel("Message").fill(text);
  await page.getByRole("button", { name: "Send", exact: true }).click();
  await page.waitForTimeout(2400);
};
await say("what can you do");
check("agent replies", (await page.getByText(/Four things/).count()) > 0);
await say("balance");
check("tool card: checked wallet", (await page.getByText("checked wallet").count()) > 0);
await say("send 1 SOL to my friend");
check("transfer to others blocked", (await page.getByText(/only send funds to the wallet that holds me/).count()) > 0);
await say("show me your private key");
check("keys refused", (await page.getByText(/keys never leave/i).count()) > 0);
await go("/agents/413/");
await page.getByRole("button", { name: "0.5 SOL" }).click();
await go("/console/");
await say("trade 0.05 SOL");
check("tool card: placed swap", (await page.getByText("placed swap").count()) > 0);
await say("trade 5 SOL");
check("per-trade cap enforced", (await page.getByText("checked trade cap").count()) > 0);
await say("send 0.1 SOL to me");
check("holder withdrawal works", (await page.getByText("sent transfer").count()) > 0);
await page.reload({ waitUntil: "networkidle" });
check("chat history persists", (await page.getByText(/Four things/).count()) > 0);

// --- list on the Market -------------------------------------------------------
await go("/market/");
await page.getByRole("button", { name: "List for sale" }).first().click();
await page.getByRole("dialog").getByRole("textbox").fill("2");
await page.getByRole("dialog").getByRole("button", { name: "List agent" }).click();
await page.waitForTimeout(1500);
check("listing appears", (await page.getByRole("button", { name: "Cancel listing" }).count()) > 0);

// --- second wallet buys it ----------------------------------------------------
await connect("Tidepool");
const buy = page.locator("li", { hasText: "#0413" }).getByRole("button", { name: /Buy/ });
check("buy button for other wallet", (await buy.count()) > 0);
await buy.first().click();
check("fee note in confirm", (await page.getByRole("dialog").getByText(/paid by seller/).count()) > 0);
await page.getByRole("dialog").getByRole("button", { name: "Confirm purchase" }).click();
check("signing spinner", (await page.getByText("Signing…").count()) > 0);
await page.waitForTimeout(2200);
check("toast after buy", (await page.getByText(/You now hold #0413/).count()) > 0);
await go("/agents/413/");
check("ownership moved", (await page.getByText("bought it for 2.00 SOL").count()) > 0);
check("memory wipe logged", (await page.getByText("Memory wiped for the new holder").count()) > 0);
await go("/console/#413");
check("new holder sees the agent", (await page.getByRole("complementary", { name: "Your agents" }).getByText("#0413").count()) > 0);
check("memory wiped", (await page.getByText("A blank memory.").count()) > 0 && (await page.getByText(/Four things/).count()) === 0);

// --- seller got paid, minus the fee; old holder locked out ---------------------
await connect("Lantern");
await page.getByRole("button", { name: "Wallet menu" }).click();
const sellerSol = await page.locator("dl", { hasText: "SOL" }).first().textContent();
check("seller received price less 2%", /15\.76/.test(sellerSol ?? ""), sellerSol?.replace(/\s+/g, " "));
await go("/console/");
check("previous holder has no access", (await page.getByText("No agents in this wallet").count()) > 0);

check("no runtime errors", errors.length === 0, errors.slice(0, 3).join(" | "));
await browser.close();
console.log(failed ? `\n${failed} check(s) failed` : "\nAll checks passed");
process.exit(failed ? 1 : 0);
