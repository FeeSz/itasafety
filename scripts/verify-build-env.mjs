#!/usr/bin/env node
// Verifies that VITE_SUPABASE_URL was inlined into the built client bundle.
// Exits with non-zero status to BLOCK publish/deploy if the env var is missing
// from the generated client bundle, which would otherwise produce a
// blank-screen production site.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST_CANDIDATES = [".output/public", "dist/client"];
const DIST = DIST_CANDIDATES.find(existsSync);
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
  if (!DIST) throw new Error("no generated client directory found");
  files = walk(DIST);
} catch (err) {
  console.error(
    `[verify-build-env] Could not read ${DIST ?? DIST_CANDIDATES.join(" or ")}: ${err.message}`,
  );
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
      [
        /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/,
        /sb_publishable_[A-Za-z0-9_-]{20,}/,
      ].some((pattern) => pattern.test(content))
    ) {
      found.add(marker);
    }
  }
}

const missing = REQUIRED_MARKERS.filter((m) => !found.has(m));
if (missing.length > 0) {
  console.error(
    `\n[verify-build-env] ERROR — missing env in ${DIST} bundle:\n  - ${missing.join(
      "\n  - ",
    )}\n\nBuild blocked: configure the public Supabase variables and rebuild before publishing.\n`,
  );
  process.exit(1);
}

console.log(`[verify-build-env] OK — VITE_SUPABASE_* inlined into ${DIST}.`);
