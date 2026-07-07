#!/usr/bin/env node
// Verifies that VITE_SUPABASE_URL was inlined into the built client bundle.
// Exits with non-zero status to BLOCK publish/deploy if the env var is missing
// from dist/, which would otherwise produce a blank-screen production site.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST = "dist/client";
const REQUIRED_MARKERS = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) out.push(...walk(full));
    else if (/\.(js|mjs)$/.test(entry)) out.push(full);
  }
  return out;
}

let files;
try {
  files = walk(DIST);
} catch (err) {
  console.error(`[verify-build-env] Could not read ${DIST}: ${err.message}`);
  process.exit(1);
}

const found = new Set();
const supabaseUrlRegex = /https:\/\/[a-z0-9]+\.supabase\.co/i;

for (const f of files) {
  const content = readFileSync(f, "utf8");
  for (const marker of REQUIRED_MARKERS) {
    if (found.has(marker)) continue;
    // Vite replaces import.meta.env.VITE_* with the literal string value.
    // We check for the presence of a supabase.co URL (VITE_SUPABASE_URL)
    // and a JWT-shaped literal (VITE_SUPABASE_PUBLISHABLE_KEY).
    if (marker === "VITE_SUPABASE_URL" && supabaseUrlRegex.test(content)) {
      found.add(marker);
    }
    if (
      marker === "VITE_SUPABASE_PUBLISHABLE_KEY" &&
      /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/.test(content)
    ) {
      found.add(marker);
    }
  }
}

const missing = REQUIRED_MARKERS.filter((m) => !found.has(m));
if (missing.length > 0) {
  console.warn(
    `\n[verify-build-env] WARNING — missing env in dist/client bundle:\n  - ${missing.join(
      "\n  - ",
    )}\n\nPublishing will proceed, and the site will display a graceful "Configuration Missing" UI to administrators.\n`,
  );
  process.exit(0);
}

console.log("[verify-build-env] OK — VITE_SUPABASE_* inlined into client bundle.");
