# Cloudflare

Use when the developer has a Cloudflare account and the game is a static build.
The game is a Worker that serves the build folder as static assets. Vite reads
`VITE_` variables when it builds, so build locally with them set, then deploy.

## Log in

`node scripts/check-cli.mjs cloudflare` runs `npx wrangler whoami --json`, which
exits non-zero when not signed in. The developer signs in with
`npx wrangler login` (a browser sign-in). For automation Wrangler reads
`CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from the environment: use a
token only if the developer supplies one, scoped to what a deploy needs, set for
that one command and never written to a file.

## Targets

A Worker has no preview target in the sources below, so keep a separate Worker
per Magicweave environment by giving each its own `name`: `<game>-dev` for
development or testing, `<game>` for production (only when the developer asked).
`name` in `wrangler.jsonc` decides which Worker a deploy updates.

## Configure the static-assets Worker

Create `wrangler.jsonc` beside the build, if the game has none:

```jsonc
{
  "name": "neon-drift-dev",
  "compatibility_date": "2026-10-01",
  "assets": { "directory": "./dist" },
}
```

Set `directory` to the output folder `scripts/detect-build.mjs` found and
`compatibility_date` to today's date.

## Build with the variables set

Read `.env` into the build's own environment, without echoing it. Replace the
build command with the one `detect-build.mjs` printed:

```sh
set -a; . ./.env; set +a
VITE_MW_BASE_URL="$MW_BASE_URL" \
VITE_MW_CLIENT_ID="$MW_CLIENT_ID" \
VITE_MW_CLIENT_SECRET="$MW_CLIENT_SECRET" \
pnpm run build
```

Use `EXPO_PUBLIC_MW_*` names for an Expo web build.

## Deploy

```sh
npx wrangler deploy
```

The Worker named in `wrangler.jsonc` is the target.

## Live address

Read it from the lines `wrangler deploy` prints; do not build it from a pattern.
Add its origin to the Magicweave environment's web addresses (checklist step 7).
A custom domain is a DNS change: only when the developer asks.

## Rollback

Not covered by the sources below. Read Cloudflare's own documentation before
promising one.

## Sources

- https://developers.cloudflare.com/workers/static-assets/
- https://developers.cloudflare.com/workers/wrangler/commands/general/
- https://developers.cloudflare.com/workers/wrangler/system-environment-variables/
