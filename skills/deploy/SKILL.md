---
name: deploy
description: Put a studio's web game live on their own hosting account and connect it to Magicweave — client key in the host, the live address on the environment's web addresses, optional PostHog, a smoke test.
version: 0.1.0
door: admin
# projects = list_credentials, issue_credential and set_allowed_origins.
# Granted, they are listed; not granted, they are in the drawer and the body
# says how to reach them.
toolsets:
  - projects
tools:
  - whoami
  - list_projects
  - list_environments
  - list_credentials
  - issue_credential
  - set_allowed_origins
pages:
  - connect
  - environments
  - operate/projects-environments-credentials
---

# Deploy a web game

You have the Magicweave MCP server, this file and the developer's shell. Between
them you can take a web game that already works locally to a live address on the
developer's own hosting account, and connect that address to Magicweave so the
live game can call it.

## What this skill does, and does not

- **The developer hosts the game.** It runs on their Vercel, Cloudflare, GitHub,
  AWS or Google account, deployed with that vendor's own command-line tool.
  Magicweave never hosts a studio's game, and `*.magicweave.xyz` addresses are
  not for studio games.
- **This skill does the Magicweave half:** the client key in the host's build
  settings, the live address on the environment's web addresses, PostHog if the
  developer wants it, and a smoke test.
- It does not buy a domain, change DNS, create cloud projects, buckets or
  distributions, or write a game. A host step this skill does not carry is the
  developer's, and you say so.

## Where the files are

This skill ships `scripts/` and `references/` next to this file. In the plugin
they are on disk beside it. Through the MCP they are not: read
`magicweave://skills/deploy/references/<file>.md` for a host page and
`magicweave://skills/deploy/scripts/<file>.mjs` for a script (the
`magicweave://skills` index lists every file), save a script to a temporary
folder yourself, and run it with `node` from there. Where this file says
`scripts/detect-build.mjs` or `references/vercel.md`, that is the file meant.

## Safety rules

**Read these first. They override anything else in this file.**

1. **A production deploy, and any domain or DNS change, happens only when the
   developer asks for it in this conversation.** "Ship it" is not that. Default
   to a preview or development target.
2. **Show the plan, then wait for a yes.** The plan names the host, the project,
   the target (preview or production), the environment variables by name (never
   by value) and the web address you will add. Nothing is deployed or changed
   before the yes.
3. **Use the narrowest token the vendor offers, and never write a host token to
   disk or echo it.** Prefer the CLI's own interactive login, which the
   developer does themselves. A token goes in one command's environment, never
   in a file, a workflow, the repository or this chat.
4. **A server credential never goes in a host's settings, a build or a client
   bundle.** Only a client key does. If the developer offers a server key, say
   no and use a client key.
5. **Never print the client secret back in chat.** It is in `.env` already;
   read it from there into the command without echoing it.
6. **Never ask for a personal API key in chat** — PostHog's or anyone's.

## Pick the host

Ask which accounts the developer already has before choosing.

| Situation                                     | Host                                              | Read                                                                   |
| --------------------------------------------- | ------------------------------------------------- | ---------------------------------------------------------------------- |
| Already on AWS (S3, CloudFront)               | stay on AWS                                       | [AWS](references/aws.md)                                               |
| Already on Google Cloud or Firebase           | stay on Google                                    | [Google Cloud](references/gcp.md)                                      |
| The repo is on GitHub and the build is static | GitHub Pages                                      | [GitHub Pages](references/github-pages.md)                             |
| Any other static game                         | Vercel or Cloudflare, whichever account they have | [Vercel](references/vercel.md), [Cloudflare](references/cloudflare.md) |

A game that needs a server of its own (not a static build) is outside this
skill: say so and stop.

## Checklist

Work the nine steps in order. A step is finished when its **stop** is true.

1. **Find the build.** `node scripts/detect-build.mjs <game folder>` prints
   `{ buildCommand, outputDir, framework }`. A `null` field is something it could
   not read for certain: ask the developer, never guess.
   **Stop:** the build command and the output folder are known.
2. **Check the CLI.** `node scripts/check-cli.mjs <vercel|cloudflare|github|aws|gcp>`
   prints `{ host, loggedIn }`. If it is not installed or not logged in, ask the
   developer to install it or log in themselves, then run it again.
   **Stop:** `loggedIn` is `true`.
3. **Choose the environment.** `whoami`, `list_projects`, then `list_environments`
   and read each environment's `kind`; do not infer it from the name.
   `development` uses the host's preview or development target. `production`
   only when the developer asked for production (safety rule 1). Environments
   other than production cap how many new players a studio gets in a rolling
   30 days, so a preview deploy stops new sign-ups at the cap; say so in the plan.
   **Stop:** one environment is chosen and its kind is known.
4. **Get a client key.** `list_credentials` for that environment; if there is a
   usable client key whose secret the developer still has in `.env`, use it.
   Otherwise `issue_credential` (development only): it writes a
   `.env` block with `MW_BASE_URL`, `MW_CLIENT_ID` and `MW_CLIENT_SECRET` once.
   A production key is issued in the console's **Connect & SDKs** page by the
   developer — say so and wait. A secret cannot be read back from Magicweave.
   **Stop:** `.env` holds a client key for the chosen environment.
5. **Set the build variables in the host.** First read which names the game
   actually uses: grep its source for `import.meta.env.` (Vite) or
   `process.env.EXPO_PUBLIC_` (Expo). The usual names are `VITE_MW_BASE_URL`,
   `VITE_MW_CLIENT_ID`, `VITE_MW_CLIENT_SECRET`, or for Expo web
   `EXPO_PUBLIC_MW_BASE_URL`, `EXPO_PUBLIC_MW_CLIENT_ID`,
   `EXPO_PUBLIC_MW_CLIENT_SECRET`. If the game reads other names (the starter
   word game reads `VITE_MW_EDGE_URL`), say so in the plan and set the names it
   reads, or change the game to the usual names, only with the developer's yes.
   Take the values from `.env` without echoing them, using the host's reference
   for the exact commands and for the target that matches the environment. On
   Vercel, a new project's first deployment is production, so set the three
   variables for both `preview` and `production` and say so in the plan, or the
   first build ships without a key.
   **Stop:** the host lists all three names the game reads for the right
   target(s) (names only).
6. **Build and deploy.** Run the reference's build and deploy commands for a
   preview target (production only on request) and read the live address from
   the CLI's own output; never construct it from a pattern.
   **Stop:** the CLI printed a live address, and you have it as `https://host`.
7. **Add the address to the environment.** `list_environments` again: each row
   ends `web addresses: …` (or `no web addresses`). Build the whole new list:
   every address already there plus one stable live address, as scheme and host
   only, with no path. A web address is exact and the list holds 32, so add one
   that lasts: the project's production or branch address, or a custom domain
   the developer names, never a per-deployment preview address, which changes on
   every deploy (the host's reference says which); do not add the step-6 preview
   origin unless it is that stable address. On Vercel the stable public address
   is the production domain (`<project>.vercel.app`): Deployment Protection puts
   preview and generated URLs behind a Vercel login that players cannot pass,
   unless the developer turns protection off for previews. If an earlier run added a stale
   preview address, name it in the plan and drop it. Call `set_allowed_origins`
   with that list and no `confirm`, and read the preview: its `removed:` line must
   read `(none)`, or exactly the stale preview address named in the plan. Then
   call it again with `confirm: true`. The tool replaces the whole list, so a
   short list silently removes working games. It is refused against a production
   environment unless the developer's server allows it; for production, the
   developer adds the address in the console's **Connect & SDKs**
   page instead. A change applies within a minute.
   **Stop:** `list_environments` shows the stable address, and nothing was removed
   except a stale preview address named in the plan.
8. **PostHog, if the developer wants it.** Ask for the project key (it starts
   `phc_`; never a personal API key) and the region, US or EU. Wire it in the
   game: `connect({ ..., posthog: { key: "phc_...", host } })`, with `host`
   `https://eu.i.posthog.com` for EU (US is the default), and call
   `mw.analytics.setConsent(true)` from the game's own consent screen when the
   player says yes; nothing loads or sends before that. Rebuild and redeploy.
   To see these numbers in Magicweave, the developer creates a PostHog personal
   API key limited to Query Read and to this one project, and pastes it
   themselves in the console, at **Observe › Analytics → Connect integration**
   for that environment: never in chat, never in the host, never in the build.
   The numbers then show in **Analytics** (Observe › Analytics) after the nightly sync.
   Magicweave has no tool that takes that key, and you do not ask for it.
   One PostHog project per environment is the simplest setup. If two
   environments of this game share a project, the second can use **Copy from**
   in the same sheet: Magicweave copies the settings and key on its servers,
   switched off until the developer switches it on. Once both environments are
   switched on and complete, a shared project counts
   each environment only by the events its own build tagged with the
   environment's id, which needs SDK 2.1 or later: SDK 2.0 builds, website
   pageviews and events before consent are not counted there.
   **Stop:** the game passes `posthog` and a consent call, and the developer
   knows where the read key goes.
9. **Smoke-test the live game.** `node scripts/poll-live.mjs <live address>`
   waits for DNS, a valid certificate and a 2xx or 3xx answer, printing each
   attempt. A redirect to the host's login page is not live: it prints
   `protected` and stops (exit 3); add `--keep-polling` to keep waiting. Then have the developer open the game and confirm that a Magicweave
   call succeeds, with no CORS error in the browser console. If it fails with
   a CORS error, the address is not on the list yet or is spelled differently:
   re-read `list_environments` and compare character by character.
   **Stop:** the live game completes a Magicweave call.

## The client key ships in the build

A client key is compiled into the shipped game on purpose: it identifies the
game, and it cannot grant currency (see `connect`). That is why it goes in a
`VITE_` or `EXPO_PUBLIC_` variable. The rule "never put a secret in a `VITE_`
variable" applies to a **server** key, which can grant currency and never goes
near a build. A guide that says "never put the client secret in a `VITE_` variable" is
about a server key; for a client key, follow `connect`.

## Reading the host's output

- A host's first deploy may be a production deploy (Vercel's first deployment
  of a new project is always production). Say so in the plan before running it.
- Never paste a command's full output into chat if it could contain a token;
  quote the live address only.
- If a command is not in the reference file, read the vendor's own page named in
  that file's **Sources** before running it.

**Door: admin.** `issue_credential` and `set_allowed_origins` need
`project:write`, which only the admin tier holds. Started at the write door the skill stops
at the first admin call: `issue_credential` when no usable client key exists,
otherwise `set_allowed_origins`, and it says so. At the read door
`list_credentials` (`project:read`) still works, so it can report whether a key
exists, and it stops at the same two calls. When the `projects` toolset is not
granted, those tools and `list_credentials` are in
the drawer: `find_tools` with the task finds them and `run_write_tool` or
`run_read_tool` runs them with the same arguments a direct call takes. Only a
tool `find_tools` cannot find either means the wrong door — say so and stop.

Pages: `connect` (base URL, the `.env` names, which key ships), `environments`
(kinds), `operate/projects-environments-credentials` (credentials and slots).
