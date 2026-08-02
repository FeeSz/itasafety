// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, cloudflare (build-only),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... } }) if needed.
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { mcpPlugin } from "@lovable.dev/mcp-js/stacks/tanstack/vite";
import type { Plugin } from "vite";

const GITHUB_PAGES_BASE = "/itasafety/";

const SENSITIVE_PUBLIC_FILE_NAMES = new Set([
  ".env",
  ".env.local",
  ".env.development",
  ".env.production",
  ".env.test",
  ".dev.vars",
  ".gitignore",
  "wrangler.jsonc",
  "package.json",
  "package-lock.json",
  "bun.lock",
  "bunfig.toml",
  "tsconfig.json",
  "eslint.config.js",
]);

function shouldSkipPublicEntry(relativePath: string): boolean {
  const normalized = relativePath.replace(/\\/g, "/");
  const segments = normalized.split("/");

  if (
    segments.some((segment) =>
      [
        ".git",
        ".github",
        ".wrangler",
        ".tanstack",
        ".lovable",
        "node_modules",
        "dist",
        ".vscode",
      ].includes(segment),
    )
  ) {
    return true;
  }

  const basename = path.basename(normalized);
  if (basename.startsWith(".")) return true;
  if (SENSITIVE_PUBLIC_FILE_NAMES.has(basename)) return true;
  return /^(?:\.env|\.dev\.vars)(?:\..+)?$/i.test(basename);
}

function copySafePublicFiles(sourceDir: string, targetDir: string, baseDir = sourceDir): void {
  if (!fs.existsSync(sourceDir)) return;

  fs.mkdirSync(targetDir, { recursive: true });

  for (const entry of fs.readdirSync(sourceDir, { withFileTypes: true })) {
    const entrySourcePath = path.join(sourceDir, entry.name);
    const relativePath = path.relative(baseDir, entrySourcePath).replace(/\\/g, "/");

    if (entry.isDirectory()) {
      if (shouldSkipPublicEntry(relativePath)) continue;
      copySafePublicFiles(entrySourcePath, path.join(targetDir, entry.name), baseDir);
      continue;
    }

    if (shouldSkipPublicEntry(relativePath)) continue;
    fs.copyFileSync(entrySourcePath, path.join(targetDir, entry.name));
  }
}

function safePublicBuildPlugin(): Plugin {
  let rootDir = "";
  let outDirName = "dist";

  return {
    name: "safe-public-build-plugin",
    apply: "build",
    config() {
      return { build: { copyPublicDir: false } };
    },
    configResolved(config) {
      rootDir = config.root;
      outDirName = config.build.outDir;
    },
    writeBundle() {
      if (!rootDir) return;

      const publicDir = path.resolve(rootDir, "public");
      const outDir = path.resolve(rootDir, outDirName);
      const clientOutDir = path.join(outDir, "client");
      copySafePublicFiles(publicDir, clientOutDir);
    },
  };
}

const isGithubPagesBuild =
  process.env.GITHUB_PAGES === "true" || process.argv.includes("github-pages");

// Guarantee the public Supabase variables are inlined into the client bundle even
// when the build runs in an environment that only exposes them via .env or the
// non-prefixed server names. Missing values here produce a blank production site.
function readEnvFileVars(): Record<string, string> {
  const out: Record<string, string> = {};
  for (const file of [".env.local", ".env"]) {
    const full = path.resolve(process.cwd(), file);
    if (!fs.existsSync(full)) continue;
    for (const line of fs.readFileSync(full, "utf8").split(/\r?\n/)) {
      const match = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/.exec(line);
      if (!match) continue;
      const [, key, rawValue] = match;
      if (out[key]) continue;
      out[key] = rawValue.replace(/^['"]|['"]$/g, "");
    }
  }
  return out;
}

const envFileVars = readEnvFileVars();
function resolvePublicEnv(name: string, fallback: string): string | undefined {
  return (
    process.env[name] ||
    envFileVars[name] ||
    process.env[fallback] ||
    envFileVars[fallback] ||
    undefined
  );
}

const publicSupabaseDefines: Record<string, string> = {};
for (const [viteName, serverName] of [
  ["VITE_SUPABASE_URL", "SUPABASE_URL"],
  ["VITE_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_PUBLISHABLE_KEY"],
  ["VITE_SUPABASE_PROJECT_ID", "SUPABASE_PROJECT_ID"],
] as const) {
  const value = resolvePublicEnv(viteName, serverName);
  if (value) {
    publicSupabaseDefines[`import.meta.env.${viteName}`] = JSON.stringify(value);
  }
}

const githubPagesViteConfig = isGithubPagesBuild
  ? {
      base: GITHUB_PAGES_BASE,
      build: {
        outDir: "dist/github-pages",
      },
      define: {
        ...publicSupabaseDefines,
        "import.meta.env.VITE_SITE_URL": JSON.stringify("https://feesz.github.io/itasafety"),
        "import.meta.env.SITE_URL": JSON.stringify("https://feesz.github.io/itasafety"),
      },
    }
  : { define: publicSupabaseDefines };

// Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
// @cloudflare/vite-plugin builds from this — wrangler.jsonc main alone is insufficient.
export default defineConfig({
  nitro: isGithubPagesBuild ? false : undefined,
  plugins: [safePublicBuildPlugin()],
  vite: githubPagesViteConfig,

  tanstackStart: {
    router: {
      basepath: isGithubPagesBuild ? GITHUB_PAGES_BASE : "/",
    },
    server: { entry: "server" },
    spa: isGithubPagesBuild
      ? {
          enabled: true,
          maskPath: "/",
          prerender: {
            outputPath: "/_shell",
            crawlLinks: false,
          },
        }
      : undefined,
    prerender: isGithubPagesBuild
      ? {
          enabled: true,
          failOnError: false,
        }
      : undefined,
  },
});
