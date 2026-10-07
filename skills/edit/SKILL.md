---
name: edit
description: Change a live Magicweave game without breaking the people playing it — read the current state first, check impact, then publish and promote environment by environment.
version: 0.1.0
door: write
# The toolsets whose tools this skill uses. Granted, they are listed;
# not granted, they are in the drawer and the body says how to reach them.
# Writing the draft (write_currency/write_stat/write_rule/
# write_draft_document/write_player_document/delete_draft_document) and
# shipping it (publish_release/move_release) is core. operate = every
# player/economy/leaderboard/debugging read plus adjust_balance — this
# skill's own phase-1/2 reads and its live-game levers. migrate =
# import_players (the backfill fallback, phase 6). Admin-tier tools here are
# reachable once the write-door session hands off to an admin-door one at
# phase 5, per this skill's own "Door:" line above.
toolsets:
  - operate
  - migrate
tools:
  - read_draft_document
  - list_draft_documents
  - list_releases
  - list_environments
  - read_player
  - list_player_saves
  - read_player_save
  - list_player_documents
  - read_player_document
  - read_blueprint
  - diff_draft
  - diff_releases
  - scan_references
  - rules_activity
  - economy_health
  - currency_movement
  - write_currency
  - write_stat
  - write_rule
  - write_draft_document
  - write_player_document
  - import_players
  - delete_draft_document
  - lint_draft
  - simulate_economy
  - publish_release
  - move_release
  - try_event
  - list_traces
  - read_trace
  - adjust_balance
pages:
  - concepts/drafts-and-releases
  - concepts/the-document-tree
  - concepts/events-and-rules
  - operate/debugging-a-request
  - operate/economy-health
  - operate/players
  - concepts/environments-and-credentials
  - operate/lint-and-simulate
---

# Edit a live game

Somebody is playing this game right now. A change reaches them the moment an
environment is pointed at a new release — not before, and not gradually. So:
read what is there, learn who would see it, change it, prove it, ship it one
environment at a time.

**Door: write for phases 1–4; admin from phase 5** (`move_release` and
`adjust_balance` need admin scopes). A write-door session ends after publishing
and hands the promotion to a person or an admin-door session.

**Drawer tools.** The player, economy and trace reads — `read_player`,
`list_player_saves`, `read_player_save`, `list_player_documents`,
`read_player_document`, `rules_activity`, `economy_health`,
`currency_movement`, `list_traces`, `read_trace` — and `adjust_balance` are
`operate` tools; `import_players` is a `migrate` tool. Any that is not in
`tools/list` is in the drawer: `find_tools` with the task finds it,
`run_read_tool` runs a read, and `run_write_tool` runs `adjust_balance` or
`import_players`, with the same arguments a direct call takes.

`write_player_document`, `adjust_balance` and `import_players` change nothing
without `confirm: true`: call once without it, read the preview, then again
with it.

## Phases

| #   | Phase          | Tool / gate                                                                                                                                                                                        | Input                            | Stop                                                                     |
| --- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------ |
| 1   | Read first     | `read_draft_document`, `list_releases`, which environment serves which release; for a player fix `read_player_save` / `read_player_document`; `read_blueprint` for the canonical shape of the loop | the document path; the player id | the current state is quoted back before any change is proposed           |
| 2   | Impact         | `diff_draft` against every environment that would see it; `scan_references` for a rename or delete; `rules_activity`                                                                               | the environments; the rule key   | how often the rule fires today is known, and who would see the change    |
| 3   | Change         | the typed writer for the kind; keys are immutable, a rename is add + migrate + remove                                                                                                              | the new document                 | the draft differs from every serving release in exactly the intended way |
| 4   | Check          | `lint_draft`; `simulate_economy` before and after                                                                                                                                                  | —                                | lint clean; the after-simulation is explained against the before         |
| 5   | Publish to dev | `publish_release` → `move_release` (dev); `try_event`; `list_traces`; `economy_health`                                                                                                             | —                                | the change behaves as intended on dev                                    |
| 6   | Promote        | `move_release` environment by environment; production refused unless the admin door and a person says so                                                                                           | —                                | each environment confirmed before the next                               |
| 7   | Rollback       | `move_release` to the previous number; never a hot edit                                                                                                                                            | —                                | documented in the skill as the only rollback                             |

### 1 — Read first

Read `concepts/drafts-and-releases` first, and `operate/players` for a player
fix. Nothing is written in this phase. Find the document with
`list_draft_documents` (`prefix`, e.g. `economy/currencies/`), then read it
whole with `read_draft_document` (`project`, `path`): a write replaces the whole
document — it does not merge — so anything not read here is a setting about to
be dropped silently.

Then learn which release each environment serves: `list_environments` and
`list_releases` (`project`). An environment in `latest_draft` mode serves the
draft itself, so a draft write is already live there — the most expensive
surprise here, and it is answered before writing.

For a player fix, read the player with `read_player` (`project`, `environment`,
`player`), then `list_player_saves` / `read_player_save` (`slot`), or
`list_player_documents` / `read_player_document` (`collection`, `document`).
`read_player_document` returns a **version**; carry it, unchanged, onto the
write in phase 3. Saves are read-only — a broken save is repaired by the game or
not at all.

Where a whole loop changes (a streak, a daily, a shop), read the canonical shape
too — `read_blueprint` (`blueprint`) — so the edit is measured against a
known-good version of that mechanic, not against memory.

**Stop:** the current state is quoted back — the document, the release each
environment serves, and the player's version where there is one.

### 2 — Impact

Read `operate/economy-health` first. Run `diff_draft` (`project`, `environment`,
`prefix`) **once per environment** that could see this change — not just the one
being aimed at, because an environment in `latest_draft` mode is already serving
it. The diff names the document, the field and both values.

For a rename or a delete, also run `scan_references` (`project`, `kind`, `key`)
over the working draft. `exists` comes back separately from the reference
list on purpose: zero references on a key that exists means the removal is
clean, and zero on a key that does not exist means the key was misspelled —
`did_you_mean` names the near miss. Either way, read `exists` before the count.

Then measure the rule: `rules_activity` (`project`, `environment`, exactly one
of `rule` or `event_type`, `since`). A rule firing ten thousand times a day is a
different change from one firing twice, and its refusals are the only record of
a reward that fired and paid nothing.

For a currency, add `economy_health` (`project`, `environment`, `since`) — what
it granted, what players spent, the net, and `concentration`: the one reward
responsible for over half of what it gives out. `currency_movement` is that in
depth.

**Stop:** how often it fires today is a number, and every environment that would
see the change has been named.

### 3 — Change

Read `concepts/the-document-tree` first. Use the typed writer for the kind —
`write_currency`, `write_stat`, `write_rule` and their siblings — and
`write_draft_document` (`project`, `path`, `content`) only for a kind with no
typed writer. One document per call; the platform validates on write and refuses
with the reason.

For a player document, `write_player_document` takes `expected_version` — the
version `read_player_document` returned. Present it unchanged: that is how a
write from the live game is refused rather than quietly overwritten.

**Keys are immutable. There is no rename.** A document's key is its path, so
renaming a stat `score` to `best_score` is three steps in one draft:

1. **Add.** Write the new document at the new path
   (`progression/stats/best_score.yaml`) with the same shape and the new key.
2. **Migrate.** Write the migration as a rule document under `rules/rules/` —
   a rule whose `when` is the event that already sets the old stat, writing
   the new key too. It is part of the release, auditable, and shipped by the
   same promotion as the rename, not a script somebody runs by hand.
3. **Remove.** `delete_draft_document` on the old path — but only once
   `scan_references` on the old key comes back with an empty list (rules,
   shop listings, game manifests, leaderboards) **and** the values have been
   backfilled.

**A migration rule does not move anybody's stored value.** It fires when a
player next triggers the event, and a `where` clause cannot read a stat's
stored value, so it recomputes rather than copies: players who come back get
the new key filled in, and players who never come back keep the old one
forever. That is why step 3 waits. A true backfill is a person's job — export
the old values and `import_players` them against the new key — and until it
has run, say so plainly and leave the old document in place.

**Stop:** the draft differs from every serving release in exactly the intended
way, and nothing else.

### 4 — Check

Read `operate/lint-and-simulate` first. Run `lint_draft` (planned) until it is
clean: it catches whole-draft mistakes no one document's validator asks about —
a currency with a source and no sink, a rule naming an event type nothing
declares, two documents claiming one key.

Run `simulate_economy` (planned) **twice** — the draft before the change, and
after — then write one paragraph on the difference: which currency moved, how
far, whether days-to-cap got shorter or longer. A number that moved and cannot
be explained is a change nobody understands yet.

**Stop:** lint reports nothing; the after-simulation is explained.

### 5 — Publish to dev

`publish_release` (`project`, `version`, `notes`) freezes the draft and gives it
a number. **This makes nothing live.** Then `move_release` (`project`,
`environment`, `action: "activated"`, `release`, `note`) — dev only.

Prove it there — `operate/debugging-a-request` is the page to have open:
`try_event` (`project`, `environment`, `type`, `data`) for every event the
change touches; `list_traces` and `read_trace` (`trace_id`) for anything
refused; `economy_health` again for the currency.

**Stop:** the change behaves on dev as the phase-4 simulation said it would.

### 6 — Promote

Read `concepts/environments-and-credentials` first. One environment at a time,
confirmed before the next: `move_release` with `action: "promoted"` and
`from_environment` — whatever is live below moves up, so a release number read
off the wrong screen cannot travel by mistake.

**Gate: production is a person.** A production environment is refused unless the
session holds the admin door _and_ a person has said so here. The skill does not
work around it: it prints the exact `move_release` call that would promote to
production, says who must approve it, and stops.

**Stop:** each environment confirmed before the next; production either approved
by a person or left as a written instruction.

### 7 — Rollback

Read `concepts/drafts-and-releases` again. Rollback is `move_release` with
`action: "rolled_back"` and the previous release number — immediate, audited,
and the whole of it; `diff_releases` (`from`, `to`) says what going back
undoes.

Never repair a live environment by editing the draft: a hot edit reaches players
with nothing diffed, nothing linted and nothing to roll back to. Go back to the
release that worked, then fix the draft and re-enter at phase 1.

## Never

- A write before phase 1's read — reading afterwards cannot un-drop a setting.
- A player-document write without the version `read_player_document` returned,
  or production without a person, whatever the door.
- `adjust_balance` without a stated reason in `note`, or without the tool's own
  idempotency key — one call per correction, never a blind retry: a retry not
  recognised as the same request grants twice.
- A rename done as a rename. It is add, migrate, remove.
- Skipping `lint_draft` because the change is small: size is not the risk, what
  references the key is.
- A delete or rename without `scan_references` on the key first — a key that
  reads as unused because the question was misspelled is the exact trap
  `did_you_mean` exists to catch.

## When to stop and ask

Stop, say what was found, and wait for a person when:

- the change would reach production, or a `latest_draft` environment serving
  real players;
- `rules_activity` shows the rule firing far more than expected;
- the after-simulation differs from the before in a way no sentence explains;
- `lint_draft` reports a finding that needs a second change to fix, or a fix
  would take currency out of a wallet (`adjust_balance`, `direction: "debit"`);
- the request is a rename and something still names the old key, or there is no
  development environment to ship to first.
