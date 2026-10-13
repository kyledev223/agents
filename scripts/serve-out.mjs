// Tiny static server for the exported site in ./out (no dependencies).
// Run: npm run build && npm run preview   -> http://localhost:4173
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("../out/", import.meta.url));
const PORT = Number(process.argv[2] || process.env.PORT || 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

// Next requests prefetch payloads as "__next.a.b.c.txt" but exports them as
// "__next.a/b/c.txt". Vercel maps one to the other; do the same here.
const segmentPath = (p) =>
  p.replace(/__next\.([^/]+)\.txt$/, (match, rest) => (rest.startsWith("_") ? match : `__next.${rest.split(".").join("/")}.txt`));

async function resolve(pathname) {
  const safe = normalize(segmentPath(decodeURIComponent(pathname))).replace(/^([/\\])+/, "");
  const candidates = [join(ROOT, safe), join(ROOT, safe, "index.html"), join(ROOT, `${safe}.html`)];
  for (const file of candidates) {
    if (!file.startsWith(ROOT)) continue;
    try {
      if ((await stat(file)).isFile()) return file;
    } catch {
      // try the next candidate
    }
  }
  return null;
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? "/", "http://localhost");
  const file = (await resolve(pathname)) ?? join(ROOT, "404.html");
  try {
    const body = await readFile(file);
    res.writeHead(file.endsWith("404.html") ? 404 : 200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404).end("Not found");
  }
}).listen(PORT, () => console.log(`Serving ./out at http://localhost:${PORT}`));
