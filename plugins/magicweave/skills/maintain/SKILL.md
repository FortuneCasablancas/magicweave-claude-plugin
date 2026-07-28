---
name: maintain
description: Safely edit, tune, or audit a live Magicweave game — change an economy, add or adjust a leaderboard, retune a spin wheel, or trace what references a definition. Use when the user wants to modify, migrate, rebalance, or review an existing Magicweave game rather than build a new one.
---

# Edit a live Magicweave game

Change a game that already exists (and may have live players) without breaking it. The
requested change is in `$ARGUMENTS`.

## Before you touch anything

1. Call `get_doc("llms")` and read **section 8 (maintenance harness)** and the GUARDRAILS
   block. The `edit_a_live_game` MCP prompt is the short form.
2. Never edit blind — the live config *is* the spec now. Discovery and impact-scan come first.

## The edit loop (gates are blocking)

- **Discover.** Read current state with `list_*` / `get_*`. Take an `export_definitions`
  snapshot first if you want a rollback point.
- **Impact-scan.** Call `impact_scan` on the currency / stat / segment you intend to change or
  delete, to see its blast radius — which manifests, leaderboards, and wheels reference it.
  **Run this before any `update_*` or `delete_*`, every time.**
- **Classify.**
  - *Additive* (a new key/segment/step, or tuning a value nothing references and no live run
    reads) → safe to proceed.
  - *Breaking / destructive* (deleting a referenced definition, renaming an immutable key,
    changing outcomes or entry-costs on a live economy, repointing or soft-resetting a shared
    stat) → **STOP. Surface the blast radius + a migration plan and get explicit human
    sign-off before any mutation.** Prefer additive: add a new key and cut over.
- **Apply** the smallest change, additive-first, in a **testing** environment. For a migration:
  create the new definition → repoint every reference → verify → only then delete the old one.
  Delegate authoring to **magicweave-definitions-author**.
- **Verify.** Delegate to **magicweave-verifier**: read the changed definition back, re-run the
  closed loop, and re-check the invariants this edit could break (wheel segment probabilities
  still total 100; the leaderboard still resolves its stat; no dangling reference; no stranded
  session).
- **Promote.** Enable the release toolset (`manage_toolsets("enable", toolset="release")`),
  publish, and promote testing → production only after a green verify. Definition changes are
  pull-only — players pick them up on their next fetch.

## Rules this skill enforces

- Keys are immutable; a rename is create-new + migrate + delete-old, never in place.
- Deleting a referenced definition orphans every manifest condition/outcome, leaderboard, or
  wheel segment that named it. Impact-scan first.
- Never mutate production directly — edit and verify in a testing environment, then promote.
- Propose before you mutate; breaking changes require explicit user sign-off.
