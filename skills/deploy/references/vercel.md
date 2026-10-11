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
| development                 | `preview` (and `development` for `vercel dev`) |
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

Use the names the game reads (checklist step 5): `EXPO_PUBLIC_MW_*` for an Expo
web build, or whatever `import.meta.env.` names the source uses. On a new
project, run each line for both `preview` and `production`: the first deployment
of a new project is production, and a build without them ships without a key.
Otherwise use `production` instead of `preview` only for a production deploy the
developer asked for. `--force`
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

## Deployment protection

Vercel's default Deployment Protection puts preview and generated deployment
URLs behind a Vercel login, so players cannot open them (`poll-live.mjs`
reports `protected`). The address players can use is the production domain,
`<project>.vercel.app`, unless the developer turns protection off for previews
in the project's settings. Say so in the plan.

## Live address

The URL `vercel deploy` printed is unique to that one deployment, so every
preview deploy prints a new one. Do not add it to the Magicweave environment's
web addresses: the list holds 32 exact addresses and would fill with dead
entries. Add a stable address instead (checklist step 7): the project's
production domain, its branch address (`<project>-git-<branch>-<team>.vercel.app`,
which Vercel keeps pointing at the branch's latest deployment), or a custom
domain the developer names. Read the address from the project's Domains page or
the deployment's `vercel inspect` output, quote it, and if unsure ask the
developer. When you replace an address you added earlier, remove it from the list.

## Rollback

Not covered by the sources below. Read Vercel's own documentation before
promising one.

## Sources

- https://vercel.com/docs/cli/deploy
- https://vercel.com/docs/cli/env
- https://vercel.com/docs/cli/whoami
- https://vercel.com/docs/deployments/generated-urls
- https://vercel.com/docs/deployment-protection
