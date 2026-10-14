---
name: build
description: "Make a playable game real on Magicweave: connect it, pick a setup, wire the SDK in place of the plain numbers, check the economy and ship to development. Use when a person with a playable game asks for real coins, scores across devices or a board others can see, or already has a game."
version: 0.1.0
door: admin
# The toolsets whose tools this skill uses. Granted, they are listed;
# not granted, they are in the drawer and the body says how to reach them.
# Writing and shipping the draft is core — every session lists it.
# operate = list_traces, phase 5's "prove it fires" tool.
toolsets:
  - projects
  - operate
tools:
  - get_doc
  - whoami
  - list_projects
  - list_environments
  - create_project_setup
  - set_allowed_origins
  - recommend_blueprints
  - read_blueprint
  - apply_blueprint
  - list_draft_documents
  - read_draft_document
  - write_currency
  - write_stat
  - write_event_type
  - write_rule
  - write_leaderboard
  - write_item
  - write_listing
  - write_shop
  - write_draft_document
  - lint_draft
  - simulate_economy
  - diff_draft
  - publish_release
  - move_release
  - try_event
  - list_traces
pages:
  - concepts/the-document-tree
  - concepts/drafts-and-releases
  - concepts/events-and-rules
  - operate/lint-and-simulate
  - operate/projects-environments-credentials
  - auth/tiers-and-scopes
  - connect
  - tools
---

# Make it real

You have the Magicweave MCP server and this file. Between them you can take a
game the person can already play, with coins and scores as plain numbers, to a
game served by Magicweave in the development environment: connected, set up,
wired in place of those numbers, checked, and shipped. Nothing a real player can
see is touched.

Build something the person can play first. Don't create a project, apply a setup or
write any definitions until they've played it or asked for the backend. If they
already have a game, go straight to connecting it.

Make it real when the person asks for something the local file cannot give: scores
saved across devices, a board other people can see, or real coins. Not before.

Work the phases below in order. A phase is finished when its **stop** condition is
true; do not start the next before then. Two phases are gates, things only a
person does, and the skill waits rather than working around one.

**Door: admin.** Phase 1 (`create_project_setup`, `project:write`) and phase 7
(`move_release`, `release:activate`) need scopes only the admin tier holds.
Started at the write door this skill stops at phase 7 and says so; at the read
door it stops at phase 2.

**Drawer tools.** `list_traces` (phase 5) is an `operate` tool. If it is not in
`tools/list`, `find_tools` with the task finds it and `run_read_tool` runs it,
with the same arguments a direct call takes. Only a tool `find_tools` cannot
find either means the wrong door — say so and stop (`auth/tiers-and-scopes`).

## Phases

| #   | Phase          | Tool / gate                                                                                                                   | Input                                                            | Stop                                                                        |
| --- | -------------- | ----------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------- |
| 0   | Gate           | an organisation exists (console)                                                                                              | —                                                                | `whoami` returns an org                                                     |
| 1   | Connect        | `whoami`, `list_projects`; if none, `create_project_setup` (admin door); `set_allowed_origins` for a web game's dev origin    | project name, a development environment name                     | a project id, a development environment id and a client key in `.env`       |
| 2   | Choose a setup | `recommend_blueprints` with `existing_game: true` → `read_blueprint` → `apply_blueprint` (dry run) → `apply_blueprint`        | the game as it is now; then the chosen key                       | the draft holds the setup's documents; the dry run and the write agreed     |
| 3   | Write the rest | `write_currency` `write_stat` `write_event_type` `write_rule` `write_leaderboard` `write_item` `write_listing` `write_shop` … | one document per call, keys named once                           | every document the game needs exists in the draft                           |
| 4   | Wire the game  | the SDK, in the game's own code                                                                                               | each plain number in the game                                    | every plain number is read from Magicweave and the game still plays         |
| 5   | Check          | `lint_draft`, `diff_draft`, `try_event` for every event, `list_traces`                                                        | project id, the development environment, a sample payload each   | lint is clean, the diff is what you meant, every event pays or is explained |
| 6   | Economy check  | `simulate_economy`, once, before `publish_release`                                                                            | project id; personas and days for the simulator                  | the simulation shows no currency printing money                             |
| 7   | Ship to dev    | `publish_release` → `move_release`                                                                                            | version, notes; a `pinned_release` environment, never production | the `pinned_release` environment serves the new release                     |
| 8   | Gate           | promotion to production is a person's click                                                                                   | —                                                                | the skill ends with dev live and the production step described              |

Never: a blank tree before `recommend_blueprints` has been asked; `move_release`
to an environment of kind production; a write outside the draft; a stand-in `mw`
object left in the game.

## Phase 0 — the organisation gate

An organisation is created by a person in the console. There is no tool for it.
Call `whoami`; if it comes back with no organisation, say this and wait:

No organisation yet? Keep building the game. The console step is needed only to make
it real: https://console.magicweave.xyz (one minute, then come back).

- **Tools:** `whoami`. **Read first:** `auth/tiers-and-scopes`.
- **Stop:** `whoami` names at least one organisation.
- **Gate:** a person creates the organisation.

## Phase 1 — connect

Find out who you are acting as and whether the game already has a project. Only
create one if there is none: a second project for the same game splits its
players and its releases in half.

- **Tools:** `whoami`; `list_projects` (optionally `org`); if there is no
  project, `create_project_setup` with `org`, `name` and a lowercase `slug`,
  which makes the project, a running development environment and a client
  credential in one call, and returns the secret once as a `.env` block. Then
  `list_environments` with `project` for the development environment's slug and
  its `resolution_mode`; its Setup section says which of the five first-loop
  steps are done and names the next one. For a web game, `set_allowed_origins`
  with the development origin (the address the dev server prints, such as
  `http://localhost:5173`), preview first, then confirm; it replaces the whole list,
  so read the current one with `list_environments` and add to it. When
  `list_projects` finds a project that already exists no secret comes back, so
  `issue_credential` gets a client key for it. **Read first:**
  `operate/projects-environments-credentials`.
- **Stop:** you can name the project slug and the development environment slug,
  and the game's `.env` holds the client key.
- **Gate:** none, but `create_project_setup` needs the admin door.

Two keys, and which goes where:

The client key goes in the game. The server key stays on your own server and never
goes in a game.

Write the `.env` block to `.env` once and `.env.example` without the secret. The
names stay exactly `MW_BASE_URL`, `MW_CLIENT_ID`, `MW_CLIENT_SECRET`; a web game
reads them as `VITE_MW_*` and a React Native game as `EXPO_PUBLIC_MW_*`. The client
key is loaded from `.env` at build time. That result is the only copy; a lost one is
replaced with `rotate_credential`. In `latest_draft` mode a draft write is live in
that environment the moment you make it; in `pinned_release` nothing moves until
phase 7.

## Phase 2 — choose a setup

The game exists now, so ask the library what shape it is. It knows twenty-odd whole
working mechanics and tells you which questions about the game actually change the
answer. Never start from a blank document tree.

- **Tools, in this order:**
  1. `recommend_blueprints` with `brief` — what the game does, in the person's
     words and from the code you can read — and `existing_game: true`. If the
     brief is thin it answers with at most two plain questions instead of a ranking. With
     `existing_game: true` it never asks: it ranks, or answers `no-fit`.
  2. A playable game with a thin brief is not a reason to ask anything: read the
     game and rank. On `no-fit`, tell the person and write the documents in
     phase 3 from the game itself.
  3. `read_blueprint` with the winning `blueprint` key, and with each
     recommended loop's key. It writes nothing; it shows the design note, the
     knobs and every document the setup would write.
  4. `apply_blueprint` with `project` and `key` and **no** `confirm` — the dry
     run. Read the plan, then call it again with `confirm: true`.
- **Read first:** `concepts/the-document-tree`.
- **Stop:** the draft holds the setup's documents and the dry run's plan
  matches what the confirmed write reported.
- **Gate:** if the dry run reports a conflict — a path already there with
  different content — stop and show the person both versions. Only pass
  `overwrite` with the paths they named. Never overwrite to make a plan go
  through. Apply the shape first, then its loops; applying the same setup
  twice writes nothing the second time, so a re-run is safe.

The recommender covers what Magicweave supports. If the person asks for a wheel
or a box:

No new wheels or boxes. Existing ones keep serving. The nearest things we do support
are a streak, a daily sign-in rule, a pity draw and a shop.

A children's game gets the same setup minus anything that pays out or sells:

A children's game needs no purchases and no ads: stars, a best score and a board still
work, and nothing in Magicweave pays real money to a player.

## Phase 3 — write the rest

The setup gets you the working core. What is left is what makes this game theirs:
an extra currency, a stat the board ranks, a rule for their own event, a shop
listing. Use the typed writer for the kind — it knows the document's shape, so a
mistake comes back as a field name rather than a YAML error.

- **Tools, by kind:** `write_currency` (`economy/currencies/`), `write_item`
  (`economy/items/`), `write_shop` and `write_listing` (`economy/shops/`),
  `write_stat` (`progression/stats/`), `write_leaderboard`
  (`progression/leaderboards/`), `write_event_type` (`rules/event-types/`),
  `write_rule` (`rules/rules/`) — one document per call.
  `write_draft_document` is the escape hatch and nothing more: use it only for
  a kind with no typed writer (an ad placement, a game manifest),
  passing `path` and the whole `content`. **Read first:**
  `concepts/events-and-rules`.
- **Stop:** every currency, stat, event type, rule, board, item and listing the
  game needs exists in the draft. `list_draft_documents` to confirm;
  `read_draft_document` before changing anything already there.

Name a key once: `coins` is the currency key, the string every rule pays in and
the string the client sends — decide it in phase 2 and never spell it a second
way. Keys are immutable, so a rename is an add, a migration and a remove. Every
write replaces the whole document — no patch, no merge — so read it first.

## Phase 4 — wire the game

Now the plain numbers go. Find each one in the marked section of the game and
replace it with the SDK, one at a time. After every change the game must still run
and play: that is how you know which change broke it. Field names come from
`packages/sdk/src/game.gen.ts`; never guess them.

```
import { connect } from "@magicweave/sdk";
const mw = await connect({ baseUrl, clientId, clientSecret,
                           signIn: { provider: "guest", identifier } });
await mw.wallet()                       // Balance[]  — fields: currency_key, balance
await mw.stats()                        // Stat[]
await mw.report({ event_id, type, data })   // the only way a game earns anything
await mw.leaderboard(key, { limit })
await mw.startSession(...) / mw.finishSession(id, outcome) / mw.abandonSession(id)
await mw.shops() / mw.shopListings(shop) / mw.buy(shop, listing, purchaseId)
await mw.items() / mw.consume(...) / mw.equip(...)
await mw.streaks() / mw.charge(...) / mw.refund(entryId)
```

- There is no call that adds coins. The game reports an event; rules on the server pay.
- Rewards often land a moment later: read the wallet again.
- `connect()` is async and needs the client key, a base URL and a sign-in.
- `@magicweave/sdk/server` (`connectServer`, `confirm()`) is the server key's half and
  is never imported into a game.

Read the base URL and the client key from the build's environment variables, and keep the
plain-number fallback out: a game that quietly shows local numbers when it cannot
reach Magicweave hides the failure. Show the failure instead.

- **Tools:** the game's own files; `get_doc` with `slug: "connect"` for the
  connection steps. **Read first:** `connect`.
- **Stop:** no plain number is left in the game, and it plays against the
  development environment.

## Phase 5 — check

Every check here writes nothing. `lint_draft` catches the shapes a publish would
also refuse, plus the whole-draft questions no single document can ask. `diff_draft`
shows what would change in the development environment. `try_event` sends each event
through the real evaluator. `list_traces` shows what the game itself sent.

- **Tools:** `lint_draft` with `project`, re-run after each fix until clean.
  `diff_draft` with `project` and `environment` (the development one); `prefix`
  narrows it to one module, e.g. `economy/currencies/`. `try_event` with
  `project`, the development `environment`, the event `type` and a realistic
  `data` payload, once for every event type the setup and your own documents
  declare. Where something is refused, or the game has already been run against
  dev, `list_traces` shows the real evaluations and their reason slugs.
  **Read first:** `concepts/events-and-rules`, `concepts/drafts-and-releases`.
- **Stop:** lint reports no finding; the diff lists exactly the documents you
  meant to add or change; every declared event either paid what its rule
  promises, or you can explain the refusal — a daily limit already reached, a
  `where` clause the payload does not satisfy, an event type nothing watches. A
  "no event type declares this" answer means the event-type document is missing,
  not that the rule is wrong; go back to phase 3.
- **Gate:** if the diff contains something you did not write, stop and ask —
  someone else has been in this draft.

## Phase 6 — the economy check, before going live

`simulate_economy` is required, once, here, after the checks above and before
`publish_release`. It runs the real rule engine over made-up players for a month
and reports where the money went.

- **Tools:** `simulate_economy` with `project`, `days` (30 is the useful default)
  and the personas the person described. **Read first:** `operate/lint-and-simulate`.
- **Stop:** the simulation looks right.

**What "right" means.** The anchor: a normal session earns about 100 soft
currency, and every payout is capped. Read the report for three things.

- **Earn against sink.** Every currency that is earned must also be spent — an
  entry cost, a listing price, a spend rule. A currency with a source and no
  sink is the `money-printer` finding: a design bug, not a lint nit.
- **Days to cap.** A soft currency should take weeks, not a day, to reach its
  `maximum`. A `days_to_cap` of one or two means the payout is too high or the
  cap too low.
- **The ceiling on a lie.** Every rule on a game-reported event needs a daily
  limit, because a modified client can send that event as often as it likes.
  Only an event the platform itself states (`trust: confirmed`, like a
  confirmed ad view) can safely pay without one.

Fix by changing the draft and running lint and the simulation again. The simulator
models no wheel, no gacha and no real players — every balance opens at the
currency's starting balance, so it says what a _fresh_ population would do.

## Phase 7 — ship to the development environment

Publishing freezes the draft as a numbered, immutable release. That makes
nothing live: pointing an environment at it is the separate, separately audited
act, and in this skill it never points at production.

- **Tools:** `publish_release` with `project`, a `version` and `notes` saying
  why. Then `move_release` with `project`, `environment` (a **`pinned_release`**
  environment — see the gate), `action: "activated"` and the release number.
  **Read first:** `concepts/drafts-and-releases`.
- **Stop:** the release is published, and the `pinned_release` environment —
  never the `latest_draft` development one — serves its number.
- **Gate:** `move_release` to any environment of kind production is refused
  here — see phase 8. The development environment `create_project_setup` makes
  is in `latest_draft` mode: it serves the working draft live, has no release
  pointer, and refuses `move_release`, so do not point it at a release — say so
  and skip the move. To serve the release somewhere, `create_environment` one
  in `pinned_release` mode, named what the person calls it (staging, say), and
  `move_release` that one to the new release number.

## Phase 8 — the production gate

Production is a person's decision and a person's click. Do not move a release
into an environment of kind production, do not ask for a token that would let
you, and do not offer to do it later. Finish by handing the person, in plain
words: the release number live in development, what it contains, what the
simulation said, and the steps a person takes in the console to promote it.

## What a good result looks like

- One project, one development environment, serving a numbered release.
- A game that reads its coins and scores from Magicweave, plays, and has no
  plain number or stand-in `mw` left in it.
- A draft that came from a setup the person agreed to, plus their own documents
  on top — not a tree you invented.
- `lint_draft` clean; a simulation where every currency has a sink, a session
  earns around 100 soft currency, and days-to-cap is weeks not hours.
- Every declared event tried, with its outcome explained.
- Production untouched, and the promotion written down for a person.

## When to stop and ask

- `whoami` returns no organisation.
- A dry run reports a conflict with a document already in the draft, or
  `diff_draft` shows a change you did not make.
- The person asks for production, a hot edit of a live environment, a
  credential's secret read back, or a repository fetched — the server never
  fetches a URL, a secret is returned once when it is issued and never read
  back, and production belongs to a person.
- Lint will not go clean, or the simulation says a currency prints money and the
  fix would change the game's design rather than a number.
