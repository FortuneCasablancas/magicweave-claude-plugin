#!/usr/bin/env node
// Waits for a deployed game's address to go live: DNS answers, the
// certificate is valid and the page responds 2xx or 3xx. Prints one line per
// attempt, exits 0 when it is live and 1 when the timeout runs out.
//
//   node poll-live.mjs <https-url> [--timeout 600]
import { setTimeout as sleepFor } from "node:timers/promises";
import dns from "node:dns/promises";
import https from "node:https";
import { pathToFileURL } from "node:url";

/** @typedef {{ resolve4(host: string): Promise<string[]>, resolve6(host: string): Promise<string[]> }} Resolver */

const START_DELAY_MS = 2_000;
const MAX_DELAY_MS = 30_000;

const NO_ADDRESS = new Set([
  "ENOTFOUND",
  "ENODATA",
  "ESERVFAIL",
  "ETIMEOUT",
  "ECONNREFUSED",
  "EAI_AGAIN",
]);
const CERT_CODE =
  /^(CERT_|ERR_TLS_|ERR_SSL_|DEPTH_ZERO|UNABLE_TO_|SELF_SIGNED|HOSTNAME_MISMATCH)/;

/**
 * Does `host` resolve to an IPv4 or IPv6 address?
 * @param {string} host
 * @param {Resolver} [resolver]
 */
export async function resolves(host, resolver = dns) {
  for (const lookup of [() => resolver.resolve4(host), () => resolver.resolve6(host)]) {
    try {
      if ((await lookup()).length > 0) return true;
    } catch (error) {
      if (!NO_ADDRESS.has(error?.code)) throw error;
    }
  }
  return false;
}

/** One HTTPS GET, redirects not followed. Resolves `{ status }` or rejects with the socket/TLS error. */
export function httpsGet(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: 10_000 }, (res) => {
      res.resume();
      resolve({ status: res.statusCode ?? 0 });
    });
    req.on("timeout", () =>
      req.destroy(Object.assign(new Error("timed out"), { code: "ETIMEDOUT" })),
    );
    req.on("error", reject);
  });
}

/**
 * One attempt: where the address is on its way to live.
 * @param {string} url
 * @param {{ resolver?: Resolver, request?: typeof httpsGet }} [deps]
 */
export async function probe(url, { resolver = dns, request = httpsGet } = {}) {
  const host = new URL(url).hostname;
  if (!(await resolves(host, resolver)))
    return { state: "dns", message: `DNS: ${host} does not resolve yet` };
  try {
    const { status } = await request(url);
    if (status >= 200 && status < 400)
      return { state: "live", status, message: `live: ${String(status)}` };
    return {
      state: "http",
      status,
      message: `answered ${String(status)}, waiting for the deploy`,
    };
  } catch (error) {
    if (CERT_CODE.test(error?.code ?? ""))
      return { state: "certificate", message: "certificate not ready" };
    return { state: "connect", message: `no connection yet (${error?.code ?? "error"})` };
  }
}

/**
 * Polls `url` until it is live or `timeoutSec` has passed, backing off from 2 s
 * to 30 s. `sleep`, `now`, `resolver` and `request` are injectable for tests.
 * @param {string} url
 * @param {{ timeoutSec?: number, resolver?: Resolver, request?: typeof httpsGet, sleep?: (ms: number) => Promise<unknown>, now?: () => number, log?: (line: string) => void }} [options]
 */
export async function pollLive(url, options = {}) {
  const {
    timeoutSec = 600,
    resolver,
    request,
    sleep = sleepFor,
    now = Date.now,
    log = () => {},
  } = options;
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") throw new Error("poll-live checks https addresses only");
  const started = now();
  let delay = START_DELAY_MS;
  for (let attempt = 1; ; attempt += 1) {
    const result = await probe(url, { resolver, request });
    const elapsed = Math.round((now() - started) / 1000);
    log(`attempt ${String(attempt)} (${String(elapsed)}s): ${result.message}`);
    if (result.state === "live") return { ok: true, status: result.status, attempts: attempt };
    if (now() - started + delay > timeoutSec * 1000) {
      return { ok: false, attempts: attempt, last: result.message };
    }
    await sleep(delay);
    delay = Math.min(delay * 2, MAX_DELAY_MS);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const at = args.indexOf("--timeout");
  const timeoutSec = at === -1 ? 600 : Number(args[at + 1]);
  const url = args.find((arg, i) => !arg.startsWith("--") && !(at !== -1 && i === at + 1));
  if (!url || !Number.isFinite(timeoutSec) || timeoutSec <= 0) {
    process.stderr.write("usage: node poll-live.mjs <https-url> [--timeout seconds]\n");
    process.exit(2);
  }
  try {
    const result = await pollLive(url, {
      timeoutSec,
      log: (line) => process.stdout.write(`${line}\n`),
    });
    process.exit(result.ok ? 0 : 1);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(2);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
