# Releasing

**The one rule:** bump `version` in
[`.claude-plugin/plugin.json`](.claude-plugin/plugin.json)
on **every** release. Claude Code caches installed plugins by version string — if you push
changes without bumping it, existing installs keep the old cached copy and never update.

## Cut a release

1. Make your changes and run `claude plugin validate .` (must pass).
2. Bump `version` in `plugin.json` (semver: MAJOR breaking, MINOR feature, PATCH fix).
3. Add a matching entry at the top of [`CHANGELOG.md`](CHANGELOG.md).
4. Commit and push to `main`. CI re-validates on push.

That's it. The community-directory listing re-pins to the new commit SHA automatically, and
users pick up the new version on their next `/plugin marketplace update` / auto-update.

No build step, no deploy — the plugin is static files served from this git repo. The only
runtime component is the MCP server at `https://mcp.magicweave.xyz/mcp`, which lives in the
`magicweave-fastmcp` repo and is released separately.
