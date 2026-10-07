# Magicweave plugin

Build and run game backends on [Magicweave](https://www.magicweave.xyz) from Claude Code.

The plugin bundles the live Magicweave MCP server (`https://mcp.magicweave.xyz/mcp`, OAuth
email + OTP — sign in once) and adds three skills on top of it. The skills are checklists:
they tell Claude what to read, what to write and what to check before it ships, and the server
does the work.

## Skills

| Skill | Invoke | What it does |
| :--- | :--- | :--- |
| build | `/magicweave:build <concept>` | Build a new Magicweave game economy, concept to live in a development environment — currencies, stats, rules, leaderboards, checked and shipped in order. |
| edit | `/magicweave:edit <change>` | Change a live Magicweave game without breaking the people playing it — read the current state first, check impact, then publish and promote environment by environment. |
| migrate | `/magicweave:migrate` | Bring a launched game onto Magicweave — inventory its existing backend, map it onto the document tree, and carry its players across. |

All three are also model-invoked automatically when a task matches.

## Requirements

- The `magicweave` MCP server (bundled here) connected — you sign in on first tool call.
- A Magicweave organization. `/magicweave:build` creates the project and environment with
  `create_project_setup`; the [console](https://console.magicweave.xyz) shows the result.
