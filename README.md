# Magicweave plugin for Claude Code

Build and run game backends on [Magicweave](https://www.magicweave.xyz) — currencies, stats,
rules, leaderboards, and the rest of a game's economy — from Claude Code.

This repository is both a **plugin marketplace** and the **Magicweave plugin** it distributes
(the plugin lives at the repo root, so the repo is directly installable as a plugin too).
The plugin bundles the live Magicweave MCP server (`https://mcp.magicweave.xyz/mcp`) and four
skills that walk Claude through the work as checklists.

## Install

```
/plugin marketplace add FortuneCasablancas/magicweave-claude-plugin
/plugin install magicweave@magicweave
```

On first use the bundled MCP server prompts you to sign in once (OAuth, email + OTP) — no manual
config. A blank organization is enough: `/magicweave:build` creates the project and environment
through the server's `create_project_setup` tool.

## What you get

- **`/magicweave:build`** — Build a new Magicweave game economy, concept to live in a development environment — currencies, stats, rules, leaderboards, checked and shipped in order.
- **`/magicweave:edit`** — Change a live Magicweave game without breaking the people playing it — read the current state first, check impact, then publish and promote environment by environment.
- **`/magicweave:migrate`** — Bring a launched game onto Magicweave — inventory its existing backend, map it onto the document tree, and carry its players across.
- **`/magicweave:deploy`** — Put a studio's web game live on their own hosting account and connect it to Magicweave — client key in the host, the live address on the environment's web addresses, optional PostHog, a smoke test.
  Hosting stays on your own Vercel, Cloudflare, GitHub Pages, AWS or Google Cloud account; the skill uses their CLIs and asks before anything touches production or DNS.

Try it:

```
/magicweave:build a 6-guess word game with a daily leaderboard
```

## Develop locally

```
claude --plugin-dir .
claude plugin validate .
```

`/reload-plugins` picks up edits without a restart.

## Layout

```
.claude-plugin/
  plugin.json                       # plugin manifest (plugin lives at repo root)
  marketplace.json                  # marketplace catalog (source: "./")
.mcp.json                           # remote MCP server (OAuth on enable)
skills/{build,edit,migrate,deploy}/   # synced from mirage packages/mcp/skills
```

## License

MIT — see [LICENSE](./LICENSE).
