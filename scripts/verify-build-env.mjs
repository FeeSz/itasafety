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
    : [".output/public"];
const DIST = DIST_CANDIDATES.find(existsSync);
const REQUIRED_MARKERS = ["VITE_SUPABASE_URL", "VITE_SUPABASE_PUBLISHABLE_KEY"];
const EXPECTED_PROJECT_REF = "porgyoqngtshxdxuwaft";
const EXPECTED_SUPABASE_URL = `https://${EXPECTED_PROJECT_REF}.supabase.co`;
const JWT_REGEX =
  /eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g;
const MODERN_PUBLISHABLE_KEY_REGEX = /sb_publishable_[A-Za-z0-9_-]{20,}/;
const SUPABASE_ISSUER_REGEX =
  /^https:\/\/([a-z0-9]+)\.supabase\.co\/auth\/v1\/?$/i;

function decodeJwtPayload(token) {
  try {
    return JSON.parse(Buffer.from(token.split(".")[1], "base64url").toString("utf8"));
  } catch {
    return null;
  }
}

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

  if (MODERN_PUBLISHABLE_KEY_REGEX.test(content)) {
    found.add("VITE_SUPABASE_PUBLISHABLE_KEY");
  }

  for (const match of content.matchAll(JWT_REGEX)) {
    const payload = decodeJwtPayload(match[0]);
    if (!payload || payload.role !== "anon") continue;

    const projectRef =
      typeof payload.ref === "string"
        ? payload.ref
        : typeof payload.iss === "string"
          ? payload.iss.match(SUPABASE_ISSUER_REGEX)?.[1]
          : undefined;

    if (!projectRef) continue;
    observedProjectRefs.add(projectRef);
    if (projectRef === EXPECTED_PROJECT_REF) {
      found.add("VITE_SUPABASE_PUBLISHABLE_KEY");
    }
  }

  for (const marker of REQUIRED_MARKERS) {
    if (found.has(marker)) continue;
    // Vite replaces import.meta.env.VITE_* with the literal string value.
    // We check for the presence of a supabase.co URL (VITE_SUPABASE_URL)
    // and validate publishable keys above. Legacy JWT keys must identify the
    // canonical project through their `ref` claim or Supabase Auth issuer.
    if (marker === "VITE_SUPABASE_URL" && content.includes(EXPECTED_SUPABASE_URL)) {
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
