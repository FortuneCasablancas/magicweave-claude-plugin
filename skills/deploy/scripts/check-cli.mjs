#!/usr/bin/env node
// Asks a host's CLI whether the developer is logged in, with the one command
// each vendor documents for it. Prints JSON { host, loggedIn, account? } and
// exits 0 when logged in, 1 when not. It never prints a token: only the
// account name a login-check answers with.
//
//   node check-cli.mjs <vercel|cloudflare|github|aws|gcp>
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

const accountFromText = (stdout) => stdout.trim().split(/\r?\n/)[0] || undefined;

function accountFromAwsJson(stdout) {
  try {
    const parsed = JSON.parse(stdout);
    return typeof parsed?.Account === "string" ? parsed.Account : undefined;
  } catch {
    return undefined;
  }
}

/** The documented login check per host. `account` reads the check's own output. */
export const CHECKS = {
  vercel: { command: "vercel", args: ["whoami"], account: accountFromText },
  cloudflare: { command: "npx", args: ["wrangler", "whoami", "--json"] },
  github: { command: "gh", args: ["auth", "status"] },
  aws: { command: "aws", args: ["sts", "get-caller-identity"], account: accountFromAwsJson },
  gcp: {
    command: "gcloud",
    args: ["auth", "list", "--filter=status:ACTIVE", "--format=value(account)"],
    account: accountFromText,
    needsOutput: true,
  },
};

/** Runs a command to completion. Resolves `{ code, stdout }`, or `{ code: null, missing: true }` when the program is not installed. */
export function spawnRunner(command, args) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "ignore"] });
    let stdout = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.on("error", (error) =>
      resolve({ code: null, stdout: "", missing: error.code === "ENOENT" }),
    );
    child.on("close", (code) => resolve({ code, stdout }));
  });
}

/** `{ host, loggedIn, account?, reason? }` for one host, using `run` to execute the check. */
export async function checkCli(host, run = spawnRunner) {
  const check = CHECKS[host];
  if (!check)
    throw new Error(`unknown host "${host}"; one of ${Object.keys(CHECKS).join(", ")}`);
  const result = await run(check.command, check.args);
  if (result.missing) return { host, loggedIn: false, reason: "cli-not-installed" };
  const answered = result.code === 0 && (!check.needsOutput || result.stdout.trim() !== "");
  if (!answered) return { host, loggedIn: false, reason: "not-logged-in" };
  const account = check.account?.(result.stdout);
  return account ? { host, loggedIn: true, account } : { host, loggedIn: true };
}

async function main() {
  try {
    const result = await checkCli(process.argv[2] ?? "");
    process.stdout.write(`${JSON.stringify(result)}\n`);
    process.exit(result.loggedIn ? 0 : 1);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(2);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
