---
name: build
description: Build a new Magicweave game economy, concept to live in a development environment — currencies, stats, rules, leaderboards, checked and shipped in order.
version: 0.1.0
door: admin
# The toolsets whose tools this skill uses. Granted, they are listed;
# not granted, they are in the drawer and the body says how to reach them.
# Writing and shipping the draft is core — every session lists it.
# operate = list_traces, phase 7's "prove it fires" tool.
toolsets:
  - projects
  - operate
tools:
  - whoami
  - list_projects
  - list_environments
  - create_project_setup
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
  - tools
---

# Build a new game

You have the Magicweave MCP server and this file. Between them you can take a
studio from "we want a runner that pays coins for distance" to a working
economy serving their development environment, without writing a rule by hand
and without touching anything a real player can see.

Work the eight phases below in order. A phase is finished when its **stop**
condition is true; do not start the next before then. Two phases are gates —
things only a person does — and the skill waits rather than working around one.

**Door: admin.** Phase 1 (`create_project_setup`, `project:write`) and phase 6
(`move_release`, `release:activate`) need scopes only the admin tier holds.
Started at the write door this skill stops at phase 6 and says so; at the read
door it stops at phase 2.

**Drawer tools.** `list_traces` (phase 7) is an `operate` tool. If it is not in
`tools/list`, `find_tools` with the task finds it and `run_read_tool` runs it,
with the same arguments a direct call takes. Only a tool `find_tools` cannot
find either means the wrong door — say so and stop (`auth/tiers-and-scopes`).

## Phases

| #   | Phase          | Tool / gate                                                                                                                                                                              | Input                                                            | Stop                                                                             |
| --- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| 0   | Gate           | an organisation exists (console, billing)                                                                                                                                                | —                                                                | `whoami` returns an org                                                          |
| 1   | Orient         | `whoami`, `list_projects`; if none, `create_project_setup` (admin door)                                                                                                                  | project name, a development environment name                     | a project id and a development environment id are known                          |
| 2   | Choose a shape | `recommend_blueprints` → answer its questions → `recommend_blueprints` again → `read_blueprint` → `apply_blueprint` (dry run) → `apply_blueprint`                                        | the brief; then the chosen key                                   | the draft holds the blueprint's documents; the dry run and the write agreed      |
| 3   | Write the rest | `write_currency` `write_stat` `write_event_type` `write_rule` `write_leaderboard` `write_item` `write_listing` `write_shop` …; `write_draft_document` only for a kind with no typed tool | one document per call, keys named once                           | every document the concept needs exists in the draft                             |
| 4   | Check          | `lint_draft` until clean; `simulate_economy` until earn/sink and days-to-cap are acceptable                                                                                              | project id; personas and days for the simulator                  | lint reports no finding; the simulation shows no currency printing money         |
| 5   | See the change | `diff_draft`                                                                                                                                                                             | the development environment                                      | the diff lists exactly the intended documents                                    |
| 6   | Ship to dev    | `publish_release` → `move_release`                                                                                                                                                       | version, notes; a `pinned_release` environment, never production | the `pinned_release` environment serves the new release                          |
| 7   | Prove it fires | `try_event` for every event the blueprint declares; `list_traces` for rejections                                                                                                         | event name and a sample payload each                             | every event produced the reward its rule promises, or the rejection is explained |
| 8   | Gate           | promotion to production is a person's click                                                                                                                                              | —                                                                | the skill ends with the dev environment live and the production step described   |

Never: a blank tree before `recommend_blueprints` has been asked; `move_release`
to an environment of kind production; a write outside the draft.

## Phase 0 — the organisation gate

An organisation is created by a person in the console, with billing attached.
There is no tool for it. Call `whoami`; if it comes back with no organisation,
stop and tell the studio to create one, then pick up at phase 1.

- **Tools:** `whoami`. **Read first:** `auth/tiers-and-scopes`.
- **Stop:** `whoami` names at least one organisation.
- **Gate:** a person creates the organisation.

## Phase 1 — orient

Find out who you are acting as and whether the game already has a project. Only
create one if there is none — a second project for the same game splits its
players and its releases in half.

- **Tools:** `whoami`; `list_projects` (optionally `org`); if there is no
  project, `create_project_setup` with `org`, `name` and a lowercase `slug`,
  which makes the project, a running development environment and a client
  credential in one call, and returns the secret once as a `.env` block. Then `list_environments` with `project` for the development
  environment's slug and its `resolution_mode`; its Setup section says which of
  the five first-loop steps are done and names the next one. Check setup with it
  rather than guessing. **Read first:**
  `operate/projects-environments-credentials`.
- **Stop:** you can name the project slug and the development environment slug.
- **Gate:** none, but `create_project_setup` needs the admin door. Write its
  `.env` block to `.env` once and `.env.example` without the secret, and never
  repeat the secret to the studio or put it in code — that result is the only
  copy; a lost one is replaced with `rotate_credential`.
  In `latest_draft` mode a draft write is live in that environment the moment
  you make it; in `pinned_release` nothing moves until phase 6.

## Phase 2 — choose a shape

Never start from a blank document tree. Ask the library what shape this game is
first: it knows twenty-odd whole working mechanics, and it will tell you which
questions about the brief actually change the answer.

- **Tools, in this order:**
  1. `recommend_blueprints` with `brief` — the studio's own words. If the
     brief is thin it answers with ranked questions instead of a ranking.
  2. Ask the studio those questions, in the order given, then call
     `recommend_blueprints` again with the answers as the structured fields
     (`genre`, `session_minutes`, `players`, `skill_vs_luck`, `monetisation`,
     `retention_hooks`) — those override what the free text guessed.
  3. `read_blueprint` with the winning `blueprint` key, and with each
     recommended loop's key. It writes nothing; it shows the design note, the
     knobs and every document the blueprint would write.
  4. `apply_blueprint` with `project` and `key` and **no** `confirm` — the dry
     run. Read the plan, then call it again with `confirm: true`.
- **Read first:** `concepts/the-document-tree`.
- **Stop:** the draft holds the blueprint's documents and the dry run's plan
  matches what the confirmed write reported.
- **Gate:** if the dry run reports a conflict — a path already there with
  different content — stop and show the studio both versions. Only pass
  `overwrite` with the paths they named. Never overwrite to make a plan go
  through. Apply the shape first, then its loops; applying the same blueprint
  twice writes nothing the second time, so a re-run is safe.

## Phase 3 — write the rest

The blueprint gets you the working core. What is left is what makes this game
theirs: an extra currency, a stat the board ranks, a rule for their own event, a
shop listing. Use the typed writer for the kind — it knows the document's shape,
so a mistake comes back as a field name rather than a YAML error.

- **Tools, by kind:** `write_currency` (`economy/currencies/`), `write_item`
  (`economy/items/`), `write_shop` and `write_listing` (`economy/shops/`),
  `write_stat` (`progression/stats/`), `write_leaderboard`
  (`progression/leaderboards/`), `write_event_type` (`rules/event-types/`),
  `write_rule` (`rules/rules/`) — one document per call.
  `write_draft_document` is the escape hatch and nothing more: use it only for
  a kind with no typed writer (an ad placement, an asset, a game manifest),
  passing `path` and the whole `content`. **Read first:**
  `concepts/events-and-rules`.
- **Stop:** every currency, stat, event type, rule, board, item and listing the
  concept needs exists in the draft. `list_draft_documents` to confirm;
  `read_draft_document` before changing anything already there.

Name a key once: `coins` is the currency key, the string every rule pays in and
the string the client sends — decide it in phase 2 and never spell it a second
way. Keys are immutable, so a rename is an add, a migration and a remove. Every
write replaces the whole document — no patch, no merge — so read it first.

## Phase 4 — check

Two checks, in this order, both over the draft and neither writing anything.
`lint_draft` catches the shapes a publish would also refuse plus the whole-draft
questions no single document can ask. `simulate_economy` runs the real rule
engine over made-up players for a month and reports where the money went.

- **Tools:** `lint_draft` with `project`, re-run after each fix until clean.
  Then `simulate_economy` with `project`, `days` (30 is the useful default)
  and the personas the studio described. **Read first:**
  `operate/lint-and-simulate`.
- **Stop:** lint reports no finding, and the simulation looks right.

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

Fix by changing the draft and running both again. The simulator models no wheel,
no gacha and no real players — every balance opens at the currency's starting
balance, so it says what a _fresh_ population would do.

## Phase 5 — see the change

Before anything is frozen, look at what would change in the development
environment. This is the dry run for the whole draft.

- **Tools:** `diff_draft` with `project` and `environment` (the development
  one); `prefix` narrows it to one module, e.g. `economy/currencies/`.
  **Read first:** `concepts/drafts-and-releases`.
- **Stop:** the diff lists exactly the documents you meant to add or change,
  and nothing else.
- **Gate:** if the diff contains something you did not write, stop and ask —
  someone else has been in this draft.

## Phase 6 — ship to the development environment

Publishing freezes the draft as a numbered, immutable release. That makes
nothing live: pointing an environment at it is the separate, separately audited
act, and in this skill it never points at production.

- **Tools:** `publish_release` with `project`, a `version` and `notes` saying
  why. Then `move_release` with `project`, `environment` (a **`pinned_release`**
  environment — see the gate), `action: "activated"` and the release number. **Read first:**
  `concepts/drafts-and-releases`.
- **Stop:** the release is published, and the `pinned_release` environment —
  never the `latest_draft` development one — serves its number.
- **Gate:** `move_release` to any environment of kind production is refused
  here — see phase 8. The development environment `create_project_setup` makes
  is in `latest_draft` mode: it serves the working draft live, has no release
  pointer, and refuses `move_release`, so do not point it at a release — say so
  and skip the move. To serve the release somewhere, `create_environment` one
  in `pinned_release` mode, named what the studio calls it (staging, say), and
  `move_release` that one to the new release number.

## Phase 7 — prove it fires

A rule that lints clean can still never match. Send each event through the real
evaluator and read what it decided.

- **Tools:** `try_event` with `project`, the development `environment`, the
  event `type` and a realistic `data` payload — once for every event type the
  blueprint and your own documents declare. Nothing is written and no balance
  moves. Where something is refused, or the game has already been run against
  dev, `list_traces` shows the real evaluations and their reason slugs.
  **Read first:** `concepts/events-and-rules`.
- **Stop:** every declared event either paid what its rule promises, or you can
  explain the refusal — a daily limit already reached, a `where` clause the
  payload does not satisfy, an event type nothing watches. A "no event type
  declares this" answer means the event-type document is missing, not that the
  rule is wrong — go back to phase 3.

## Phase 8 — the production gate

Production is a person's decision and a person's click. Do not move a release
into an environment of kind production, do not ask for a token that would let
you, and do not offer to do it later. Finish by handing the studio, in plain
words: the release number live in development, what it contains, what the
simulation said, and the steps a person takes in the console to promote it.

## What a good result looks like

- One project, one development environment, serving a numbered release.
- A draft that came from a blueprint the studio agreed to, plus their own
  documents on top — not a tree you invented.
- `lint_draft` clean; a simulation where every currency has a sink, a session
  earns around 100 soft currency, and days-to-cap is weeks not hours.
- Every declared event tried, with its outcome explained.
- Production untouched, and the promotion written down for a person.

## When to stop and ask

- `whoami` returns no organisation.
- `recommend_blueprints` came back with questions — ask them, do not guess.
- A dry run reports a conflict with a document already in the draft, or
  `diff_draft` shows a change you did not make.
- The studio asks for production, a hot edit of a live environment, a
  credential's secret read back, or a repository fetched — the server never
  fetches a URL, a secret is returned once when it is issued and never read
  back, and production belongs to a person.
- Lint will not go clean, or the simulation says a currency prints money and the
  fix would change the game's design rather than a number.
