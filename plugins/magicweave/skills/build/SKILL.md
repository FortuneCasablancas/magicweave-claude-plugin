---
name: build
description: Build a new game economy on Magicweave — currencies, stats, a game-loop manifest, leaderboards, or a spin wheel — from a concept, end to end. Use when the user wants to create, author, scaffold, or ship a new game or economy on Magicweave (the MCP server named "magicweave" must be connected).
---

# Build a Magicweave game economy

Drive a game from concept to a live, verified economy using the Magicweave MCP tools. The
game brief is in `$ARGUMENTS` (if empty, ask the user for the core loop first).

## Before you start — read the source of truth

This skill is an orchestration checklist. The authoritative detail lives in the server, so
**do not work from memory**:

1. Call `get_doc("llms")` and read **section 7 (build harness)** and the **GUARDRAILS** block.
   The Magicweave `build_a_game` MCP prompt is a shorter version of the same pipeline.
2. Re-read the `guardrails` skill's hard rules. The classic hallucinations (inventing
   endpoints, writing a balance/score directly, renaming an immutable key) fail silently later.

## The pipeline (phases are gates — do them in order)

Delegate the heavy phases to the bundled subagents; you own the gates and the running spec.

- **Phase 0 · Foundation (human gate).** A project + credentials are created by a human in the
  console (`console.magicweave.xyz`) — there is no create-project tool. Confirm the user has a
  project and that `list_orgs` / `list_projects` return it before any authoring.
- **Phase 1 · Design the spec.** Delegate to the **magicweave-economy-architect** subagent:
  it designs one `EconomySpec` (currencies, stats, the manifest step-graph with condition sets
  + outcomes, leaderboards, wheel segments) and names every key once. Design only — no writes.
- **Phase 2 · Validate.** Call `validate_spec` on the whole spec and fix every finding before
  creating anything. Then `simulate_economy` to sanity-check earn/sink rates, wheel EV, and
  days-to-cap.
- **Phase 3 · Author + read back.** Delegate to **magicweave-definitions-author**: it creates
  definitions in dependency order (currencies + stats → manifests + leaderboards → segments →
  wheels) and reads each back to confirm it matches the spec. Prefer `apply_spec` (one-shot,
  dependency-ordered, rollback) or `build_game` (AI, when enabled) for the whole spec at once.
  **Propose the spec and get the user's confirmation before any create/update.**
- **Phase 4 · Verify.** Delegate to **magicweave-verifier**: drive the closed game loop
  (`enter` → `record`) and walk the rejection matrix (`invalid_step`,
  `no_matching_conditions`, `session_already_active`, idempotent replay).
- **Phase 5 · Ship.** The release/environment tools are hidden by default — call
  `manage_toolsets("enable", toolset="release")` first. Author + verify in a **testing**
  environment, then publish and promote the release to **production** last.

## Rules this skill enforces

- Never invent an endpoint, tool, field, or shape. If it is not in `get_doc("llms")`, it does
  not exist — stop and tell the user what is missing.
- Balances, stats, and scores are read-only from the client; the only writer is a game or wheel
  outcome (`record`). There is no "submit score" tool.
- Definition keys are immutable — a rename is create-new + migrate + delete-old.
- Always propose before you mutate; never run a `create_*`/`update_*`/`delete_*` without the
  user's explicit go-ahead.
