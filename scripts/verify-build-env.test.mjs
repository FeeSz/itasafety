import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const SCRIPT = resolve(dirname(fileURLToPath(import.meta.url)), "verify-build-env.mjs");
const EXPECTED_REF = "porgyoqngtshxdxuwaft";
const EXPECTED_URL = `https://${EXPECTED_REF}.supabase.co`;
const MODERN_KEY = `sb_publishable_${"a".repeat(24)}`;

function jwtFor(ref) {
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ role: "anon", ref, iss: "supabase" })}.${"s".repeat(32)}`;
}

function runVerifier(bundle) {
  const root = mkdtempSync(join(tmpdir(), "itasafety-build-env-"));
  const dist = join(root, ".output", "public");
  mkdirSync(dist, { recursive: true });
  writeFileSync(join(dist, "app.js"), bundle);

  try {
    return spawnSync(process.execPath, [SCRIPT], {
      cwd: root,
      encoding: "utf8",
    });
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

test("accepts the canonical URL with a modern publishable key", () => {
  const result = runVerifier(`${EXPECTED_URL}\n${MODERN_KEY}`);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /verify-build-env.*OK/);
});

test("accepts a legacy anon JWT only when its ref is canonical", () => {
  const result = runVerifier(`${EXPECTED_URL}\n${jwtFor(EXPECTED_REF)}`);
  assert.equal(result.status, 0, result.stderr);
});

test("rejects a legacy anon JWT from another Supabase project", () => {
  const wrongRef = "wrongprojectref00000";
  const token = jwtFor(wrongRef);
  const result = runVerifier(`${EXPECTED_URL}\n${token}`);

  assert.equal(result.status, 1);
  assert.match(result.stderr, new RegExp(wrongRef));
  assert.doesNotMatch(`${result.stdout}${result.stderr}`, new RegExp(token));
});

test("rejects a divergent anon JWT even when a modern key is also present", () => {
  const wrongRef = "wrongprojectref00000";
  const result = runVerifier(`${EXPECTED_URL}\n${MODERN_KEY}\n${jwtFor(wrongRef)}`);

  assert.equal(result.status, 1);
  assert.match(result.stderr, new RegExp(wrongRef));
});

test("rejects a Supabase URL from another project", () => {
  const result = runVerifier(
    `https://wrongprojectref00000.supabase.co\n${MODERN_KEY}`,
  );

  assert.equal(result.status, 1);
  assert.match(result.stderr, /wrongprojectref00000/);
});
