#!/usr/bin/env node
/**
 * Downloads generated assets listed in scripts/assets.json.
 *
 *   node scripts/fetch-assets.mjs --raw     # download raw sources into .assets-raw/ (used by CI)
 *   node scripts/fetch-assets.mjs           # ensure public/ outputs exist; if missing, download raw and
 *                                           # produce best-effort outputs (sharp for images, raw copy for GLB)
 *
 * The Vercel build runs the second form via `prebuild`, so a fresh clone still deploys with real assets even
 * before the fetch-assets GitHub workflow has committed the optimized copies.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "scripts/assets.json"), "utf8"));
const rawDir = path.join(root, ".assets-raw");
const rawOnly = process.argv.includes("--raw");

async function download(name, url) {
  const dest = path.join(rawDir, name);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 0) return dest;
  fs.mkdirSync(rawDir, { recursive: true });
  process.stdout.write(`↓ ${name} … `);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${name}: HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  console.log(`${(buf.length / 1e6).toFixed(1)} MB`);
  return dest;
}

async function main() {
  if (rawOnly) {
    for (const [name, url] of Object.entries(manifest.raw)) await download(name, url);
    return;
  }
  const missing = Object.entries(manifest.outputs).filter(([out]) => !fs.existsSync(path.join(root, out)));
  if (missing.length === 0) {
    console.log("assets: all outputs present");
    return;
  }
  let sharp = null;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.log("assets: sharp unavailable, images will be copied unconverted");
  }
  for (const [out, spec] of missing) {
    const url = manifest.raw[spec.from];
    if (!url) continue;
    let src;
    try {
      src = await download(spec.from, url);
    } catch (e) {
      console.warn(`assets: skip ${out}: ${e.message}`);
      continue;
    }
    const dest = path.join(root, out);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    if (out.endsWith(".glb")) {
      fs.copyFileSync(src, dest);
    } else if (sharp) {
      await sharp(src).resize({ width: spec.width, withoutEnlargement: true }).jpeg({ quality: spec.quality ?? 80, mozjpeg: true }).toFile(dest);
    } else {
      fs.copyFileSync(src, dest.replace(/\.jpg$/, ".png"));
    }
    console.log(`✓ ${out}`);
  }
}

main().catch((e) => {
  console.warn("assets: non-fatal:", e.message);
});
