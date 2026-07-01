import fs from "node:fs";
import path from "node:path";

const publicDir = path.resolve("dist/github-pages/client");
const shellPath = path.join(publicDir, "_shell.html");
const fallbackPath = path.join(publicDir, "404.html");
const noJekyllPath = path.join(publicDir, ".nojekyll");

if (!fs.existsSync(shellPath)) {
  throw new Error(`GitHub Pages SPA shell not found: ${shellPath}`);
}

fs.copyFileSync(shellPath, fallbackPath);
fs.writeFileSync(noJekyllPath, "");

console.log(`Created ${path.relative(process.cwd(), fallbackPath)}`);
console.log(`Created ${path.relative(process.cwd(), noJekyllPath)}`);
