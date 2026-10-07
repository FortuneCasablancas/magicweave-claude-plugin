#!/usr/bin/env node
// Finds how a web game is built: the command and the folder the build writes.
// Prints JSON { buildCommand, outputDir, framework }; a field it cannot read
// for certain is null, never guessed.
//
//   node detect-build.mjs [dir]
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const VITE_CONFIGS = ["ts", "mts", "cts", "js", "mjs", "cjs"].map(
  (ext) => `vite.config.${ext}`,
);

const RUNNERS = [
  ["pnpm-lock.yaml", "pnpm run build"],
  ["yarn.lock", "yarn build"],
  ["bun.lock", "bun run build"],
  ["bun.lockb", "bun run build"],
  ["package-lock.json", "npm run build"],
];

function readText(file) {
  try {
    return readFileSync(file, "utf8");
  } catch {
    return null;
  }
}

function readJson(file) {
  const text = readText(file);
  if (text === null) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

/**
 * The `build.outDir` a Vite config sets: a string when it is a plain literal,
 * `undefined` when the config does not set one, `null` when it sets one this
 * script cannot read without running the config.
 */
export function viteOutDir(source) {
  const key = /\boutDir\s*:\s*/.exec(source);
  if (!key) return undefined;
  const rest = source.slice(key.index + key[0].length);
  const literal = /^(["'`])([^"'`$\\\n]+)\1\s*[,}\n]/.exec(rest);
  return literal ? literal[2] : null;
}

function hasExpo(pkg, dir) {
  const app = readJson(path.join(dir, "app.json"));
  if (app && typeof app === "object" && "expo" in app) return true;
  const deps = { ...pkg?.dependencies, ...pkg?.devDependencies };
  return "expo" in deps;
}

/** What `dir` builds with and into. Pure apart from reading the directory. */
export function detectBuild(dir = ".") {
  const root = path.resolve(dir);
  const pkg = readJson(path.join(root, "package.json"));
  const out = { buildCommand: null, outputDir: null, framework: null };
  if (!pkg) return out;

  if (typeof pkg.scripts?.build === "string") {
    const runner = RUNNERS.find(([lock]) => existsSync(path.join(root, lock)));
    out.buildCommand = runner ? runner[1] : "npm run build";
  }

  const viteConfig = VITE_CONFIGS.find((name) => existsSync(path.join(root, name)));
  if (viteConfig) {
    out.framework = "vite";
    const outDir = viteOutDir(readText(path.join(root, viteConfig)) ?? "");
    out.outputDir = outDir === undefined ? "dist" : outDir;
    return out;
  }
  if (hasExpo(pkg, root)) out.framework = "expo";
  return out;
}

function main() {
  const result = detectBuild(process.argv[2] ?? ".");
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exit(result.buildCommand && result.outputDir ? 0 : 1);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main();
