#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import JSON5 from "json5";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SRC_DIR = path.resolve(__dirname, "../src/locales");
const OUT_DIR = path.resolve(__dirname, "../public/locales");

function flatten(obj, prefix = "", out = {}) {
  for (const [k, v] of Object.entries(obj || {})) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v != null && typeof v === "object" && !Array.isArray(v)) {
      flatten(v, key, out);
    } else {
      if (key in out && out[key] !== v) {
        console.warn(`[build-locales] duplicate key "${key}" – keeping last value`);
      }
      out[key] = v;
    }
  }
  return out;
}

if (!fs.existsSync(SRC_DIR)) {
  console.error(`[build-locales] Missing ${SRC_DIR}`);
  process.exit(0);
}
fs.mkdirSync(OUT_DIR, { recursive: true });

const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith(".json5"));
if (files.length === 0) {
  console.log("[build-locales] No .json5 files found");
  process.exit(0);
}

for (const file of files) {
  const lang = path.basename(file, ".json5");
  const srcPath = path.join(SRC_DIR, file);
  const outPath = path.join(OUT_DIR, `${lang}.json`);

  const data = JSON5.parse(fs.readFileSync(srcPath, "utf8"));
  const flat = flatten(data);
  const sorted = Object.fromEntries(Object.entries(flat).sort(([a], [b]) => a.localeCompare(b)));

  fs.writeFileSync(outPath, JSON.stringify(sorted, null, 2), "utf8");
  console.log(`[build-locales] ${lang} → ${path.relative(process.cwd(), outPath)} (${Object.keys(sorted).length} keys)`);
}
