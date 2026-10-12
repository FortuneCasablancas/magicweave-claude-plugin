# Changelog

All notable changes to the Magicweave plugin are documented here. Versions follow
[semantic versioning](https://semver.org); the version lives in
`.claude-plugin/plugin.json`.

## 2.0.0 — 2026-10-07

- Skills re-synced from mirage `packages/mcp/skills`: `build` rewritten for V2; `edit` and
  `migrate` added.
- `deploy` skill added, with per-host references (Vercel, Cloudflare, GitHub Pages, AWS, Google Cloud) and scripts.
- Release order: the `deploy` skill needs the `set_allowed_origins` MCP tool and the updated docs pages, so
  2.0.0 ships only after the mirage MCP release that includes them.
- `maintain` removed (renamed `edit`).
- `guardrails` and the three subagents (`magicweave-economy-architect`,
  `magicweave-definitions-author`, `magicweave-verifier`) removed; they taught v1 tools that no
  longer exist, and the V2 skills carry their own guards.
- Validate workflow fixed: the second step now validates `.claude-plugin/plugin.json` instead
  of a `plugins/magicweave` path that no longer exists.
- `RELEASING.md` points at mirage `packages/mcp` and adds the skills sync step.

## 1.0.1 — 2026-07-28

- Flatten the plugin to the repo root (plugin manifest at `.claude-plugin/plugin.json`,
  components at root) so the repo is directly installable and accepted by the plugin
  directory; `marketplace.json` now uses `source: "./"`. No behavior change.
- Point homepage/author URLs at `www.magicweave.xyz` (apex now 301-redirects to www).

## 1.0.0 — 2026-07-28

First public release.

- **Bundled MCP connector** — the live Magicweave server (`https://mcp.magicweave.xyz/mcp`,
  streamable HTTP) ships in `.mcp.json`; Claude Code runs the OAuth sign-in on first use, so
  connecting is one click with no manual config.
- **Skills** — `/magicweave:build` (build a game economy, §7 harness),
  `/magicweave:maintain` (safely edit a live game, §8 harness), and `/magicweave:guardrails`
  (the hard rules, read before any backend work). Each stays lean and delegates to
  `get_doc("llms")` rather than inlining the platform brief.
- **Subagents** — `magicweave-economy-architect` (design the spec, read-only),
  `magicweave-definitions-author` (author + verify definitions), and `magicweave-verifier`
  (play the closed loop + rejection matrix), mapping to the build harness role hats.
- **CI** — `claude plugin validate` runs on every push against both the marketplace and the
  plugin.
