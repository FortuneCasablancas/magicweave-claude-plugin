---
name: guardrails
description: The Magicweave hard rules and guardrails. Read before any Magicweave backend work — authoring definitions, wiring a game loop, or editing a live economy — to avoid the classic hallucinations. Use whenever a task touches the Magicweave API, MCP tools, currencies, stats, game manifests, leaderboards, or spin wheels.
---

# Magicweave guardrails

Read this before writing any Magicweave code or calling any authoring tool. For the full
brief, call `get_doc("llms")` — these are the invariants that fail silently if broken.

## Do not invent
- Do not invent endpoints, tools, paths, request fields, or response shapes. If a call is not
  written in `get_doc("llms")`, it does not exist. When unsure, fetch the doc — never guess.
- If a capability you want is not there, it is not supported. Stop and tell the user what is
  missing; do not fabricate a workaround.

## Read-only from the client
- Currencies, stats, and leaderboards are **read-only** from the client. There is no endpoint
  or tool to POST a balance, a stat value, or a score.
- The **only** writer is a game or wheel **outcome** (`record` etc.). "Submit a score" = update
  the ranked stat via an outcome. There is no `/leaderboards/submit` and no stats write.
- There is **no create API for definitions** on the client. Currencies, stats, manifests,
  leaderboards, and wheels are authored via the MCP `create_*` tools (or the console) — never
  fabricated client-side.

## Immutable keys, safe edits
- Definition keys (stat key, currency key, …) are **immutable** after creation. A "rename" is
  create-new + migrate references + delete-old — never an in-place rename.
- Before editing anything live: discover current state and `impact_scan` references **first**.
  Get explicit human sign-off before destructive or economy-altering changes.

## Correctness traps
- Fresh `idempotency_key` per distinct game write; reuse a key **only** to retry that exact
  request.
- Not every failure is an HTTP error: `record` can return 200 with
  `{"status":"rejected","reason":...}`. Branch on `status`, not just HTTP code.
- Ledger sign trap: wallet history `amount` is signed; currency history `amount` is unsigned
  with a `transaction_type`. Same field name, opposite meaning — don't share one parser.
- Personal-best is a client-side convention (there is no keep-higher op): guard and only write
  when the run beats the cached best.
- Wheel segment probabilities must total 100% or spins error.

## The one human gate
- Creating a project + credentials happens in the console (`console.magicweave.xyz`) — no
  agent can do it. Treat console-only steps as instructions to emit for the human, then read
  the results back over the tools.
