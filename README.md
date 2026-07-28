# Magicweave plugin for Claude Code

Build, simulate, and ship game economies on [Magicweave](https://magicweave.xyz) — currencies,
stats, game loops, leaderboards, and spin wheels — end to end, from Claude Code.

This repository is both a **plugin marketplace** and the **Magicweave plugin** it distributes.
The plugin bundles the live Magicweave MCP connector (`https://mcp.magicweave.xyz/mcp`) plus
skills and subagents that drive the platform's build and maintenance harnesses, so you go from
a game concept to a live, verified economy without reading docs.

## Install

```
/plugin marketplace add FortuneCasablancas/magicweave-claude-plugin
/plugin install magicweave@magicweave
```

On first use the bundled MCP server prompts you to sign in (OAuth, email + OTP) — no manual
config. You'll also need a Magicweave project + credentials, created once in the console at
[console.magicweave.xyz](https://console.magicweave.xyz).

## What you get

- **`/magicweave:build`** — build a new game economy from a concept, phase by phase.
- **`/magicweave:maintain`** — safely edit, tune, or audit a live game (impact-scan first).
- **`/magicweave:guardrails`** — the hard rules Claude reads before any backend work.
- **Subagents** — `magicweave-economy-architect` (design the spec), `magicweave-definitions-author`
  (author + verify definitions), `magicweave-verifier` (play the loop + rejection matrix).

Try it:

```
/magicweave:build a 6-guess word game with a daily leaderboard
```

## Develop locally

```
claude --plugin-dir ./plugins/magicweave
claude plugin validate .
claude plugin validate ./plugins/magicweave
```

`/reload-plugins` picks up edits without a restart.

## Layout

```
.claude-plugin/marketplace.json     # marketplace catalog
plugins/magicweave/                 # the plugin
  .claude-plugin/plugin.json        # manifest
  .mcp.json                         # remote MCP server (OAuth on enable)
  skills/{build,maintain,guardrails}/SKILL.md
  agents/magicweave-{economy-architect,definitions-author,verifier}.md
```

## License

MIT — see [LICENSE](./LICENSE).
