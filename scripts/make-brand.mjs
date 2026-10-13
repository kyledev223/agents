// Renders the social artwork (original vector art, same characters as the site)
// to ./brand: pfp.png (1000x1000), banner.png (1500x500) and the SVG sources.
// Run: node scripts/make-brand.mjs      (needs network once, for the fonts)
import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const NAME = "Clawgents";
const TICKER = "$CLAW";
const TAGLINE = "AI agents you can hand on.";
const OUT = new URL("../brand/", import.meta.url);

const BOTS = {
  trader: { body: "#2fb98a", dark: "#1c7d5f", light: "#7fe6bf", eye: "#b9ffe9", eyes: "visor", antenna: "twin" },
  treasurer: { body: "#e9a53c", dark: "#a96a16", light: "#ffd88a", eye: "#fff3c4", eyes: "round", antenna: "coin" },
  scout: { body: "#3f9cf2", dark: "#2264b3", light: "#9bd0ff", eye: "#d6f0ff", eyes: "round", antenna: "ball" },
  archivist: { body: "#8d6df0", dark: "#5a3fb5", light: "#c7b6ff", eye: "#ece5ff", eyes: "sleepy", antenna: "ball" },
  concierge: { body: "#f2687f", dark: "#b53a52", light: "#ffb3c0", eye: "#ffe3e8", eyes: "wink", antenna: "ball" },
  auditor: { body: "#5a6b88", dark: "#35425a", light: "#a9b8d1", eye: "#ffd9a0", eyes: "pixel", antenna: "flat" },
};

let uid = 0;

// A bot in a 100 x 150 box: head, neck and (optionally) a body.
function bot(kind, { x = 0, y = 0, scale = 1, body = true } = {}) {
  const c = BOTS[kind];
  const id = `g${uid++}`;
  const eyes = {
    round: `<circle cx="36" cy="55" r="7.500" fill="${c.eye}"/><circle cx="64" cy="55" r="7.500" fill="${c.eye}"/><circle cx="37.500" cy="56" r="3.200" fill="#111a22"/><circle cx="65.500" cy="56" r="3.200" fill="#111a22"/>`,
    visor: `<rect x="27" y="50" width="46" height="10" rx="5" fill="${c.eye}" opacity=".28"/><rect x="31" y="52" width="12" height="6" rx="3" fill="${c.eye}"/><rect x="57" y="52" width="12" height="6" rx="3" fill="${c.eye}"/>`,
    sleepy: `<path d="M30 54a6 6 0 0 0 12 0M58 54a6 6 0 0 0 12 0" fill="none" stroke="${c.eye}" stroke-width="3.200" stroke-linecap="round"/>`,
    wink: `<circle cx="36" cy="55" r="6" fill="${c.eye}"/><path d="M58 56a6 5 0 0 1 12 0" fill="none" stroke="${c.eye}" stroke-width="3.400" stroke-linecap="round"/>`,
    pixel: `<rect x="31" y="50" width="10" height="10" rx="2" fill="${c.eye}"/><rect x="59" y="50" width="10" height="10" rx="2" fill="${c.eye}"/>`,
  }[c.eyes];
  const antenna = {
    ball: `<rect x="48.500" y="13" width="3" height="14" fill="#23262b"/><circle cx="50" cy="10" r="5.500" fill="${c.light}"/>`,
    twin: `<path d="M38 27 33 13M62 27l5-14" stroke="#23262b" stroke-width="3" stroke-linecap="round"/><circle cx="33" cy="12" r="3.600" fill="${c.light}"/><circle cx="67" cy="12" r="3.600" fill="${c.light}"/>`,
    coin: `<rect x="48.500" y="19" width="3" height="8" fill="#23262b"/><circle cx="50" cy="12" r="7.500" fill="#ffd35c" stroke="#b9820f" stroke-width="1.600"/><path d="M50 8v8" stroke="#b9820f" stroke-width="1.800" stroke-linecap="round"/>`,
    flat: `<rect x="48.500" y="18" width="3" height="9" fill="#23262b"/><rect x="39" y="14" width="22" height="5" rx="2.500" fill="${c.light}"/>`,
  }[c.antenna];
  return `<g transform="translate(${x} ${y}) scale(${scale})">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c.light}"/><stop offset=".5" stop-color="${c.body}"/><stop offset="1" stop-color="${c.dark}"/></linearGradient></defs>
    ${body ? `<rect x="42" y="84" width="16" height="12" fill="#23262b"/><rect x="18" y="92" width="64" height="70" rx="22" fill="${c.body}"/><rect x="18" y="92" width="64" height="70" rx="22" fill="${c.dark}" opacity=".35"/><rect x="35" y="106" width="30" height="20" rx="7" fill="#fff" opacity=".2"/><circle cx="43" cy="116" r="3.200" fill="${c.eye}"/>` : ""}
    ${antenna}
    <rect x="9" y="48" width="8" height="18" rx="3.500" fill="${c.dark}"/><rect x="83" y="48" width="8" height="18" rx="3.500" fill="${c.dark}"/>
    <rect x="14" y="26" width="72" height="62" rx="24" fill="url(#${id})"/>
    <ellipse cx="36" cy="33" rx="12" ry="3" fill="#fff" opacity=".4"/>
    <rect x="23" y="38" width="54" height="38" rx="14" fill="#111a22"/>
    ${eyes}
    <path d="M43 66a7 5.500 0 0 0 14 0" fill="none" stroke="${c.eye}" stroke-width="2.600" stroke-linecap="round"/>
  </g>`;
}

const mark = (x, y, s, fill = "#0b0c0c", eye = "#fbf8f2") =>
  `<g transform="translate(${x} ${y}) scale(${s})"><path d="M15 6V2.200" stroke="${fill}" stroke-width="2.400" stroke-linecap="round"/><circle cx="15" cy="2.200" r="2.200" fill="${fill}"/><rect x="1" y="6" width="28" height="19" rx="6.500" fill="${fill}"/><rect x="6.500" y="12" width="6" height="6.500" rx="3" fill="${eye}"/><rect x="17.500" y="12" width="6" height="6.500" rx="3" fill="${eye}"/></g>`;

const rays = (cx, cy, r, n) =>
  Array.from({ length: n }, (_, i) => `<path d="M${cx} ${cy} ${cx - 34} ${cy - r}h68z" fill="#fff" opacity=".16" transform="rotate(${(360 / n) * i} ${cx} ${cy})"/>`).join("");

const pfp = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <defs>
    <radialGradient id="bg" cx=".5" cy=".42" r=".75"><stop offset="0" stop-color="#fff0cf"/><stop offset=".55" stop-color="#ffc98a"/><stop offset="1" stop-color="#f08f6a"/></radialGradient>
  </defs>
  <rect width="1000" height="1000" fill="url(#bg)"/>
  ${rays(500, 520, 900, 14)}
  <ellipse cx="500" cy="1010" rx="420" ry="90" fill="#7a4a2c" opacity=".25"/>
  ${bot("concierge", { x: 110, y: 120, scale: 7.8 })}
</svg>`;

const order = ["trader", "treasurer", "scout", "archivist", "concierge", "auditor"];
const sizes = [1.5, 1.72, 1.95, 1.9, 1.7, 1.48];
let bx = 700;
const lineup = order
  .map((kind, i) => {
    const s = sizes[i];
    const el = bot(kind, { x: bx, y: 452 - 162 * s, scale: s });
    bx += 100 * s * 0.72;
    return { el, z: s };
  })
  .sort((a, b) => a.z - b.z)
  .map((b) => b.el)
  .join("");

const banner = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1500 500" width="1500" height="500">
  <defs>
    <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff0d2"/><stop offset=".5" stop-color="#f6d2a6"/><stop offset="1" stop-color="#e2ab7e"/></linearGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e7b98c"/><stop offset="1" stop-color="#b98558"/></linearGradient>
    <radialGradient id="sun" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffdf0"/><stop offset=".35" stop-color="#fff0b8" stop-opacity=".8"/><stop offset="1" stop-color="#ffd98a" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1500" height="500" fill="url(#wall)"/>
  <circle cx="1130" cy="210" r="330" fill="url(#sun)"/>
  <rect y="440" width="1500" height="60" fill="url(#floor)"/>
  <rect y="436" width="1500" height="8" fill="#c79a72"/>
  <ellipse cx="1130" cy="456" rx="460" ry="16" fill="#46280c" opacity=".18"/>
  ${lineup}
  ${mark(96, 118, 2.9)}
  <text x="196" y="188" font-family="Inter, sans-serif" font-weight="900" font-size="92" letter-spacing="-3.500" fill="#0b0c0c">${NAME}</text>
  <text x="98" y="252" font-family="Inter, sans-serif" font-weight="500" font-size="34" letter-spacing="-.5" fill="#2b2c2c">${TAGLINE}</text>
  <rect x="98" y="286" width="150" height="52" rx="26" fill="#0b0c0c"/>
  <text x="173" y="321" text-anchor="middle" font-family="Inter, sans-serif" font-weight="700" font-size="26" fill="#fff">${TICKER.replace("$", "&#36;")}</text>
</svg>`;

await mkdir(OUT, { recursive: true });
await writeFile(new URL("pfp.svg", OUT), pfp);
await writeFile(new URL("banner.svg", OUT), banner);

const browser = await chromium.launch();
for (const [name, svg, width, height] of [["pfp", pfp, 1000, 1000], ["banner", banner, 1500, 500]]) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.setContent(
    `<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@500;700;900&display=block"><style>body{margin:0}svg{display:block}</style>${svg}`,
    { waitUntil: "networkidle" },
  );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: fileURLToPath(new URL(`${name}.png`, OUT)) });
  await page.close();
  console.log(`wrote brand/${name}.png`);
}
await browser.close();
