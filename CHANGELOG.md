# Changelog

All notable changes to the Magicweave plugin are documented here. Versions follow
[semantic versioning](https://semver.org); the version lives in
`plugins/magicweave/.claude-plugin/plugin.json`.

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
