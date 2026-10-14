---
name: start
description: "Start a game from a one-line idea: a playable version first, with coins and scores as plain numbers, before any Magicweave backend. Use when someone describes a game they want to make, build or prototype, even vaguely."
version: 0.1.0
door: write
toolsets: []
tools:
  - get_doc
  - list_docs
pages:
  - start
---

# Start a game

Build something the person can play first. Don't create a project, apply a setup or
write any definitions until they've played it or asked for the backend. If they
already have a game, go straight to connecting it.

Until Magicweave is connected, show coins and scores as plain numbers in the game.
Don't write rules, limits or rewards in game code: Magicweave decides those once it's
connected.

Read the start page first: `get_doc` with `slug: "start"`.

This skill ends with a game the person has played. Connecting it to Magicweave is a
separate step, `skill_build` (Make it real), and it only begins when they ask for it.

| #   | Phase         | What you do                                              | Stop                          |
| --- | ------------- | -------------------------------------------------------- | ----------------------------- |
| 0   | Ask           | at most two questions, only if the idea leaves them open | you know what the player does |
| 1   | The game card | one paragraph the person can correct                     | the person has not objected   |
| 2   | Build         | one small project with plain numbers                     | it runs                       |
| 3   | Play and tune | run it, hand it over, adjust                             | the person has played it      |
| 4   | The trigger   | say when it becomes real, and hand over                  | the person decides            |

## Phase 0 — ask at most two questions

Ask only what the idea leaves open, and only these two:

- What does the player do, in one sentence?
- Alone, or with other people?

If the idea already answers them, ask nothing and start. Default everything else
(length of a round, art style, controls, how it ends) and say the defaults in a line
so the person can change one. A question about money, a backend, an account or a
project name is not asked here.

## Phase 1 — the game card

Write one paragraph, before any code:

- the loop: what the player does, what ends a round, why they go again;
- the plain numbers the game shows: coins, score, best, stars, streak, whatever the
  idea calls for;
- the engine. Web with Vite by default. React Native with Expo if they say phone or
  app. Magicweave has an SDK for web games and React Native games. Nothing else today.
  If they ask for anything else, say that, then offer to build the web version.

Then go straight on. The card is a statement of what you are about to build, not a
sign-off step.

No shell, such as claude.ai? Build it as an artifact the person can play in the chat,
and say that going live needs a coding agent.

## Phase 2 — build the playable version

One small project that runs with one command. Keep the numbers in one clearly marked
section that Magicweave replaces later:

```ts
// plain numbers — replaced by Magicweave when the game is made real
let coins = 0;
let score = 0;
let best = 0;
```

**Do not write a stand-in `mw` object, and do not write local rules, limits or
rewards.** No daily cap, no "coins per run" table, no streak bonus, no price list.
Every one of ten simulated agents that faked them got them wrong, and the wrong
numbers then had to be found and pulled out of the game. A number the game shows is
fine. A number the game decides is not.

Does the person already have a game? Skip this phase and phase 3, and hand over to
`skill_build` (Make it real).

## Phase 3 — run it, hand it over, play and tune

Run the game. Tell the person the one command or the one address, and what to try
first. Then play and tune with them: the numbers on screen, the feel of it, the
difficulty. Change what they ask for. Each change stays playable.

## Phase 4 — the trigger

Make it real when the person asks for something the local file cannot give: scores
saved across devices, a board other people can see, or real coins. Not before.

When they ask, hand over to `skill_build` (Make it real).

No organisation yet? Keep building the game. The console step is needed only to make
it real: https://console.magicweave.xyz (one minute, then come back).

If they ask what Magicweave would add, say it in a sentence and offer, without
starting it: scores that survive a new device, a board, coins a rule on the server
pays. Then carry on with the game.

## Never, in this skill

- `create_project_setup`, `recommend_blueprints`, `apply_blueprint`, `read_blueprint`.
- Any `write_*` tool, `publish_release` or `move_release`.
- Asking for an organisation, a project name or a key.
- A fake `mw`, or any rule, limit or reward in game code.

## What a good result looks like

- A game the person has played within minutes of describing it.
- Every coin and score on screen is a plain number in one marked section.
- No project, setup or definition was created, and the person knows what comes next and what it needs.
