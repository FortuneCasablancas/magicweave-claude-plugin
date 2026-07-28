# Magicweave plugin

Build and run game economies on [Magicweave](https://magicweave.xyz) from Claude Code.

The plugin bundles the live Magicweave MCP connector (`https://mcp.magicweave.xyz/mcp`, OAuth
email + OTP) and adds guided workflows on top of it.

## Skills

| Skill | Invoke | What it does |
| :--- | :--- | :--- |
| build | `/magicweave:build <concept>` | Concept → spec → validate → author → verify → ship (build harness). |
| maintain | `/magicweave:maintain <change>` | Discover → impact-scan → classify → apply in testing → verify → promote (maintenance harness). |
| guardrails | `/magicweave:guardrails` | The hard rules; read before any backend work. |

All three are also model-invoked automatically when a task matches.

## Subagents

- **magicweave-economy-architect** — designs the `EconomySpec` (design-only; validates and
  simulates, never writes).
- **magicweave-definitions-author** — creates + reads back definitions in dependency order;
  applies safe edits/migrations (the only hat that mutates).
- **magicweave-verifier** — drives the closed game loop and the rejection matrix.

## Requirements

- The `magicweave` MCP server (bundled here) connected — you sign in on first tool call.
- A Magicweave project + credentials, created once in [the console](https://console.magicweave.xyz).

The full platform reference is available in-session via the `get_doc("llms")` tool.
