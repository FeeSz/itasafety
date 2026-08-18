#!/usr/bin/env node
// Verifies that VITE_SUPABASE_URL was inlined into the built client bundle.
// Exits with non-zero status to BLOCK publish/deploy if the env var is missing
// from the generated client bundle, which would otherwise produce a
// blank-screen production site.
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const IS_VERCEL_BUILD = process.env.VERCEL === "1";
const IS_GITHUB_PAGES_BUILD =
  process.env.GITHUB_PAGES === "true" ||
  process.env.npm_lifecycle_event === "build:github-pages";
const DIST_CANDIDATES = IS_VERCEL_BUILD
  ? [".vercel/output/static"]
  : IS_GITHUB_PAGES_BUILD
    ? ["dist/github-pages/client"]
    : ["dist/client", ".output/public"];
const DIST = DIST_CANDIDATES.find(existsSync);
const REQUIRED_MARKERS = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];
const EXPECTED_PROJECT_REF = "porgyoqngtshxdxuwaft";
const EXPECTED_SUPABASE_URL = `https://${EXPECTED_PROJECT_REF}.supabase.co`;

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
const observedProjectRefs = new Set();
const supabaseUrlRegex = /https:\/\/([a-z0-9]+)\.supabase\.co/gi;

for (const f of files) {
  const content = readFileSync(f, "utf8");
  for (const match of content.matchAll(supabaseUrlRegex)) {
    observedProjectRefs.add(match[1]);
  }
  for (const marker of REQUIRED_MARKERS) {
    if (found.has(marker)) continue;
    // Vite replaces import.meta.env.VITE_* with the literal string value.
    // We check for the presence of a supabase.co URL (VITE_SUPABASE_URL)
    // and a JWT-shaped literal (VITE_SUPABASE_PUBLISHABLE_KEY).
    if (marker === "VITE_SUPABASE_URL" && content.includes(EXPECTED_SUPABASE_URL)) {
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

const unexpectedProjectRefs = [...observedProjectRefs].filter(
  (projectRef) => projectRef !== EXPECTED_PROJECT_REF,
);
if (unexpectedProjectRefs.length > 0) {
  console.error(
    `\n[verify-build-env] ERROR — unexpected Supabase project ref(s) in ${DIST}:\n  - ${unexpectedProjectRefs.join(
      "\n  - ",
    )}\n\nBuild blocked: expected only ${EXPECTED_PROJECT_REF}.\n`,
  );
  process.exit(1);
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
