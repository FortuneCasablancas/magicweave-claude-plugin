# Magicweave plugin

Build and run game backends on [Magicweave](https://www.magicweave.xyz) from Claude Code.

The plugin bundles the live Magicweave MCP server (`https://mcp.magicweave.xyz/mcp`, OAuth
email + OTP — sign in once) and adds five skills on top of it. The skills are checklists:
they tell Claude what to read, what to write and what to check before it ships, and the server
does the work.

## Skills

| Skill | Invoke | What it does |
| :--- | :--- | :--- |
| start | `/magicweave:start <idea>` | Start a game from a one-line idea: a playable version first, with coins and scores as plain numbers, before any Magicweave backend. |
| build | `/magicweave:build <concept>` | Make a playable game real on Magicweave: connect it, pick a setup, wire the SDK in place of the plain numbers, check the economy and ship to development. |
| edit | `/magicweave:edit <change>` | Change a live Magicweave game without breaking the people playing it — read the current state first, check impact, then publish and promote environment by environment. |
| migrate | `/magicweave:migrate` | Bring a launched game onto Magicweave — inventory its existing backend, map it onto the document tree, and carry its players across. |
| deploy | `/magicweave:deploy` | Put a studio's web game live on their own hosting account and connect it to Magicweave — client key in the host, the live address on the environment's web addresses, optional PostHog, a smoke test. Hosting stays on your own Vercel, Cloudflare, GitHub Pages, AWS or Google Cloud account; the skill uses their CLIs and asks before anything touches production or DNS. |

All five are also model-invoked automatically when a task matches.

## Requirements

- The `magicweave` MCP server (bundled here) connected — you sign in on first tool call.
- A Magicweave organization. `/magicweave:build` creates the project and environment with
  `create_project_setup`, once the game is playable; the [console](https://console.magicweave.xyz) shows the result.
