# Vercel

Use when the developer has a Vercel account and the game is a static build.
The build variables live in the Vercel project, per target.

## Log in

`node scripts/check-cli.mjs vercel` runs `vercel whoami`. If it fails, the
developer signs in to the Vercel CLI themselves. A token, if they insist on one,
goes on the command as `--token`, with `--scope` for a team; never in a file.

## Targets

Vercel names three environments: `development`, `preview`, `production`.

| Magicweave environment kind | Vercel target                                  |
| --------------------------- | ---------------------------------------------- |
| development, testing        | `preview` (and `development` for `vercel dev`) |
| production                  | `production`, only when the developer asked    |

## Set the build variables

`vercel env add [name] [environment]` reads the value from standard input.
Pipe it from `.env` so it never appears in the command line, shell history or
this chat (the vendor warns that `echo` piping saves the value in bash history):

```sh
grep '^MW_BASE_URL=' .env | cut -d= -f2- | vercel env add VITE_MW_BASE_URL preview
grep '^MW_CLIENT_ID=' .env | cut -d= -f2- | vercel env add VITE_MW_CLIENT_ID preview
grep '^MW_CLIENT_SECRET=' .env | cut -d= -f2- | vercel env add VITE_MW_CLIENT_SECRET preview
```

Use `EXPO_PUBLIC_MW_*` names for an Expo web build, and `production` instead of
`preview` only for a production deploy the developer asked for. `--force`
overwrites an existing variable; `vercel env update` and `vercel env rm` change
or remove one. By default Vercel stores Production and Preview values as type
`secret`. That is fine here. These values are compiled into the public bundle
either way, so `--no-sensitive` or `--type config` are also acceptable for a
client key.

Check what landed, names only: `vercel env ls preview`.

## Build and deploy

```sh
vercel deploy --yes            # a preview deployment
vercel deploy --prod --yes     # production: only when the developer asked
```

`vercel deploy` prints the deployment URL on standard output; that is the live
address. **The first deployment of a new Vercel project is always production**,
even without `--prod`: put that in the plan before running it for a project that
has never been deployed. `--target=<environment>` picks a target by name.

## Live address

The URL `vercel deploy` printed. Add its origin (`https://` and host) to the
Magicweave environment's web addresses (checklist step 7). Quote the URL the command printed; if the developer
wants a different address, ask them for it.

## Rollback

Not covered by the sources below. Read Vercel's own documentation before
promising one.

## Sources

- https://vercel.com/docs/cli/deploy
- https://vercel.com/docs/cli/env
- https://vercel.com/docs/cli/whoami
