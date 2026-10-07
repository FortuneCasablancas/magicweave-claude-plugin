# Releasing

**The one rule:** bump `version` in
[`.claude-plugin/plugin.json`](.claude-plugin/plugin.json)
on **every** release. Claude Code caches installed plugins by version string — if you push
changes without bumping it, existing installs keep the old cached copy and never update.

## Cut a release

1. Skills come from mirage: run `pnpm --filter @magicweave/mcp skills:check` with
   `MW_PLUGIN_REPO` pointing at this checkout, then `skills:sync` if it reports drift. Never
   hand-edit anything under `skills/`: the sync owns each skill's `SKILL.md`, `references/*` and
   `scripts/*`. This step covers `deploy` only with the sync from mirage `p6/s4-skill-files-support`
   or later; an older sync reports "in sync" and silently skips it.
2. Release order: the `deploy` skill uses the `set_allowed_origins` MCP tool and cites docs pages
   (`connect`, `environments`, `operate/projects-environments-credentials`) that exist only after the
   mirage MCP and docs changes reach prod. Release the plugin only after that mirage release;
   otherwise `/magicweave:deploy` tells Claude to call a tool that does not exist.
3. Run `claude plugin validate .` (must pass).
4. Bump `version` in `plugin.json` (semver: MAJOR breaking, MINOR feature, PATCH fix).
5. Add a matching entry at the top of [`CHANGELOG.md`](CHANGELOG.md).
6. Commit and push to `main`. CI re-validates on push.

That's it. The community-directory listing re-pins to the new commit SHA automatically, and
users pick up the new version on their next `/plugin marketplace update` / auto-update.

No build step, no deploy — the plugin is static files served from this git repo. The only
runtime component is the MCP server at `https://mcp.magicweave.xyz/mcp`, which lives in mirage
`packages/mcp` and is released separately.
