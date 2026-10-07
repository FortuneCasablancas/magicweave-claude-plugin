---
name: migrate
description: Bring a launched game onto Magicweave — inventory its existing backend, map it onto the document tree, and carry its players across.
version: 0.2.0
door: admin
# The toolsets whose tools this skill uses. Granted, they are listed;
# not granted, they are in the drawer and the body says how to reach them.
# Writing and shipping the draft, and create_project_setup, are core.
# migrate = draft_from_inventory, import_players, list_sign_in_providers,
# find_player — this skill's own job. operate = list_traces (phase 7).
toolsets:
  - projects
  - migrate
  - operate
tools:
  - whoami
  - list_projects
  - list_environments
  - create_project_setup
  - recommend_blueprints
  - draft_from_inventory
  - apply_blueprint
  - write_currency
  - write_stat
  - write_event_type
  - write_leaderboard
  - write_item
  - write_listing
  - write_shop
  - write_rule
  - read_draft_document
  - write_draft_document
  - lint_draft
  - simulate_economy
  - diff_draft
  - list_sign_in_providers
  - get_doc
  - import_players
  - find_player
  - try_event
  - list_traces
  - publish_release
  - move_release
pages:
  - concepts/the-document-tree
  - concepts/environments-and-credentials
  - reference/document-kinds
  - operate/importing-players
  - operate/players
  - operate/lint-and-simulate
  - operate/debugging-a-request
  - operate/projects-environments-credentials
  - auth/signing-in
---

# Migrate a launched game

A game that already has players is not a blank project: it has keys its client
hard-codes, balances its players earned, and a store listing that cannot come
down for a weekend. So this skill never starts by designing. It starts by
writing down what the game already is, and every later phase is a function of
that.

**Door: admin** — `create_project_setup`, `import_players` and `move_release`
need scopes only the admin tier holds. A write-door session can do phases 3 and
4, and hands 2, 6 and 8 to an admin-door session or a person.

**Drawer tools.** `draft_from_inventory`, `list_sign_in_providers`,
`find_player` and `import_players` are `migrate` tools, and `list_traces` is an
`operate` tool. Any that is not in `tools/list` is in the drawer: `find_tools`
with the task or the toolset name finds it, `run_read_tool` runs the four reads
and `run_write_tool` runs `import_players`, with the same arguments a direct
call takes.

**Never**, in any phase:

- **Fetch a repository or a URL from this server.** It has no tool that can, and
  that is deliberate. The host reads the code — see phase 1.
- **Import into an environment of kind `production`** without the admin door
  _and_ a person saying so. The endpoint refuses it twice over; do not look for
  a third way.
- **Write a client recipe for a platform with no v2 SDK.** Say "not yet" — a
  plausible recipe for an engine with no SDK is worse than none, because
  somebody will try it.

## Phase 1 — Inventory. No tool.

Read the game's code and fill in the inventory below. **This server never
fetches a repository** — the reading is the host's, two ways:

- **In Claude Code**, file tools against a local checkout: find the save/load
  module, the event or analytics calls, the store/IAP wiring, the sign-in call
  and the leaderboard submit. Grep for keys, not concepts —
  `localStorage.setItem`, `collection(`, `PlayFabClientAPI`, `.from("`,
  `purchases.` — then read the files those land in.
- **On claude.ai**, the GitHub connector against a connected repository: the
  same five places, found by search rather than grep.

The inventory, bucket by bucket (`draft_from_inventory`'s own schema):

| bucket            | fields                                                                                       |
| ----------------- | -------------------------------------------------------------------------------------------- |
| `game`            | `name`, `genre?`, `platform?`, `session_minutes?`                                            |
| `currencies[]`    | `key`, `display`, `kind` (`soft`/`hard`), `start`, `cap?`, `where_today`                     |
| `progression`     | `stats[]` (`key`, `type`: `count`/`max`/`min`/`latest`, `where_today`), `levels?`            |
| `leaderboards[]`  | `key`, `stat`, `period` (`daily`/`weekly`/`monthly`/`all-time`), `leagues?`, `where_today`   |
| `shop.listings[]` | `key`, `item`, `price` — either `{currency, amount}` or `{real, amount}`                     |
| `daily_rewards?`  | `day`, `currency`, `amount`                                                                  |
| `saves[]`         | `slot`, `shape` (field to `number`/`string`/`bool`/`object`/`array`/`binary`), `where_today` |
| `sign_in`         | `providers[]` (whatever the game calls them today), `where_today`                            |
| `events[]`        | `key` (dotted, e.g. `run.ended`), `fields[]`, `when`                                         |
| `ads?`            | `key`, `display`, `network`, `where_today`                                                   |

`where_today` is `localstorage`, `own-server`, `firebase`, `playfab`,
`supabase` or `other` — the field the migration turns on, since phase 6 can
export from a backend and never from a player's own browser.

**Stop:** every bucket is filled or explicitly empty, and every key is the
game's own spelling. Do not rename anything here — a rename is a second
migration, and this is the first.

## Phase 2 — Gate: scope and a project.

Ask the studio what actually moves, and get an answer before writing anything —
**everything**, **leaderboards only**, **economy only**. A partial migration is
a legitimate destination, not a failure.

Then `whoami` and `list_projects`. If there is no project,
`create_project_setup` (admin door) — a project, a development environment and
a client credential in one call, with the secret returned once as a `.env`
block to write to `.env` and never repeat.
See `operate/projects-environments-credentials`.

**Stop:** a scope in the studio's own words, a project id, and a development
environment id. **Gate:** the studio chose the scope. You did not.

## Phase 3 — Map.

`recommend_blueprints` with the inventory: the studio's own sentence as
`brief`, the inventory object as `inventory`. If it comes back asking
questions, answer them from the inventory and call again — a provisional
ranking is not an answer.

Then `draft_from_inventory` with the same inventory: back come the nearest
**shape**, the **draft documents** carrying the game's own keys and numbers,
and a **report** of everything v2 has no document for. Read that report to the
studio line by line — a level curve, a binary save field, a provider that does
not exist, a real-money price. Every line is somebody's decision, not a detail
to smooth over.

**Stop:** a shape key, a document list, an answer to every report line.

## Phase 4 — Write and check.

1. `apply_blueprint` on the shape — dry run, then `confirm: true`. It brings
   the **rules**: a balanced economy, with its own event types and payouts.
2. The typed writers bring the **identifiers**, one document per call, from
   phase 3's draft: `write_currency`, `write_stat`, `write_event_type`,
   `write_leaderboard`, `write_item`, `write_listing`, `write_shop`.
   `write_draft_document` only for a kind with no typed tool (`ads/placements/`
   today). Where the blueprint and the draft both write a path,
   `read_draft_document` first and keep the game's own key — the shipped client
   already hard-codes that string, and a rename here is a second migration.
3. `lint_draft` until it reports nothing.
4. `simulate_economy` **with the game's current rates as the baseline** — read
   the earn and spend rates out of the code or the studio's analytics, and
   compare. A migration that quietly doubles what a session pays is a
   live-economy change nobody asked for (`operate/lint-and-simulate`).
5. `diff_draft` against the development environment: the list must be exactly
   the documents you meant.

**Stop:** lint clean, and the simulation's earn/sink within the baseline's
shape — or a written reason it differs, and the studio agreeing to it.

## Phase 5 — Rewrite the client, against `@magicweave/sdk`.

The host edits the code; the tools answer what each old call becomes.
Per-source recipe pages (`get_doc("migrate/from-firebase")` and the other
`migrate/*` pages in `list_docs`) carry the detail; the mapping, in short:

- **Sign-in → `Session`.** Call `list_sign_in_providers` **first**, before
  promising anything: it says which providers this environment actually has
  live. `connect({ …, signIn })` returns a `MagicweaveClient`; `Session` holds
  the token and refreshes it. A Firebase or PlayFab identity is not carried
  over as itself — the player signs in with `google`, `apple`, `email` or
  `guest`, and the old id becomes the `provider_subject` phase 6 keys on. See
  `auth/signing-in`.
- **State writes → events.** There is no grant call anywhere in the SDK, on
  purpose: a shipped build carries the same credential for every copy of the
  game, so a build that could name an amount could name any amount. Every
  `setBalance`, `addCoins` or `incrementScore` becomes
  `client.report({ event_id, type, data })` — `type` is the dotted event name,
  `event_id` is the game's own id for it, generated once and reused on every
  retry so a reward is never paid twice — and a rule decides what it is worth.
  Read `wallet()` back if the UI needs the number.
- **Shop → shops.** `client.shops()`, `client.shopListings(shop)`,
  `client.buy(shop, listing, purchaseId)` — the listing is the price _and_ the
  grant, and the client computes neither.
- **Saves → documents.** `readSave`/`writeSave` for a slot the game already
  thinks of as a save file; `documents`/`putDocument` for anything it queries
  by field. Both are JSON — a binary blob has to be encoded first, which
  phase 3's report will already have named.
- **High scores → a ranked stat.** There is no submit-score call: a board whose
  `stat` names a stat submits automatically every time a rule writes it, which
  is what keeps a player's profile and the board showing the same number.

**Stop:** the game builds, signs in against the development environment, and
every write in it goes through one of the five paths above. **Never** invent a
sixth. If the platform has no v2 SDK — Unity, Godot, Unreal today — stop here
and say so; the documents from phase 4 are still correct and still useful.

## Phase 6 — Bring the players.

Export from the old store, then `import_players` **dry run first** — without
`confirm`, which changes nothing — then for real with `confirm: true`. Rows are keyed by `provider_subject` — **the game's own player id**, not
a new one — which is also what makes a re-run find the same row. Balances are
targets, not deltas; a row that would breach a currency's `maximum` is refused
with a reason rather than clamped. At most 500 rows a request; chunk with the
same `import_id`. See `operate/importing-players`.

Read the report — `created`/`updated`/`unchanged`/`refused` per row — then run
it again: every row should come back `unchanged`. Spot-check with `find_player`
on a `provider_subject` you recognise.

**When the old store cannot export** — everything lived in `localStorage`, or
the backend is gone — there is nothing to import, and inventing rows would be
worse than admitting it. Write the fallback instead: a **claim-on-first-sign-in**
rule. The client reads whatever it still has locally, sends it once as a single
`migration.claimed` event carrying the old totals, and one rule per bucket
pays it: `when: migration.claimed`, `within: { period: month, max_times: 1 }`
so it can only pay once, and a `then.currency` (or `then.stat`) whose amount is
a `curve` over the claimed field with `max` set. The clamp is not optional — an
event from a shipped build is a claim, not a fact, and a rule paying uncapped
value from one is refused at publish. Anyone who cleared their browser starts
fresh, and the skill says that to the studio plainly rather than after the
fact.

**Gate:** `list_environments` says which environment is which kind — check,
never assume from a name. Production needs a person, the admin door _and_
`allow_production` in the body: three keys held by three different acts, and
never all three from here.

## Phase 7 — Prove it.

Run the rewritten client against the development environment. Then `try_event`
for every event type the game now sends — the blueprint's and the inventory's
both — with a payload the real client would send, and `list_traces` for
anything rejected: read the reason rather than guess at it
(`operate/debugging-a-request`).

**Stop:** every event paid what its rule promises, or the rejection is
explained and accepted.

## Phase 8 — Ship, and the gates after it.

`publish_release` freezes the draft; `move_release` points the **development**
environment at it. Then stop and write down, for the person who will do it:

1. Promote to testing, then production, one environment at a time, confirming
   each before the next — a person's click each time.
2. The store release: the rewritten client reaches players through the App
   Store, Play or a web deploy, and until it does both backends are live at
   once. Say which is authoritative for balances during that window.
3. The rollback: `move_release` back to the previous number, never a hot edit.

**Stop:** development is serving the new release, and the production and
store-release steps exist in writing, for a person, outside this session.
