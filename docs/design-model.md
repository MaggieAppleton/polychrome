# Design Model: Polychrome

Draft 1, 2026-10-27, written before round 2 (surfaces and navigation). Builds on round 1 (`design/01-grammar/`) and DESIGN.md. Layers 1 to 3 only; screens come after.

## 0. Brief

- **Who:** Maggie first, then anyone running their own software factory on Fractal.
- **Audience:** Fluent. Icon-only controls; exploration is expected.
- **Posture:** sovereign. It's open for hours, so chrome stays quiet and minimal.
- **Devices:** a laptop first. A phone is for glancing and deciding small things, not deep work.
- **Context of use:** coming back to the laptop with free attention, at any time of day.

Purposes:

1. Know what needs me now, one subject at a time.
2. Decide one thing with everything I need in front of me.
3. Get a half-formed idea out of my head without working it out.
4. See what the factory has done and is doing.
5. Trace why something was decided, and undo it if needed.
6. Find anything again: a decision, a document, a mission, an agent.
7. Talk with one agent about its work.

## 1. Concepts

**Attention item**
- Purpose: bring a person one thing only they can give.
- State: type (decision, review, finding, idea, problem), subject, who raised it, urgency, what to show.
- Actions: open, decide, set aside, reply. System: raise, gather, return.
- Operational principle: if an agent needs a choice, it raises an item showing the options; when you pick one, the mission continues.
- Lifetime: task.

**Subject**
- Purpose: keep related items together so context loads once.
- State: name, items.
- Actions: open (takes its items one by one). System: gather.
- Operational principle: if three interface items wait, opening one brings the other two next.
- Lifetime: task.

**Decision**
- Purpose: keep what was chosen and why, so it can be traced or undone.
- State: choice, reasons, item it came from, mission it started, time.
- Actions: open, undo. System: file, archive.
- Operational principle: if you choose markdown-it, a decision records it and starts the build.
- Lifetime: permanent.

**Mission**
- Purpose: get a piece of work done by agents, step by step.
- State: steps and their state, agents, gates, results.
- Actions: open, peek, pause, stop. System: start, advance, finish.
- Operational principle: if a decision is made, a mission builds it and reports back when it merges.
- Lifetime: task to permanent (as history).

**Agent**
- Purpose: act on your behalf.
- State: name, role, what it's doing, what it waits on.
- Actions: peek, talk to. System: work, wait, raise.
- Operational principle: if you peek at a waiting agent, you see what it needs from you.
- Lifetime: session to permanent.

**Chief of staff**
- An agent with one extra purpose: turn what you say into items and delegate it. This is the default conversation partner, not a separate concept on screen.

**Conversation**
- Purpose: think aloud with one agent.
- State: messages, agent, what it's about.
- Actions: say, reply, open, close. System: lift an idea out.
- Operational principle: if you tell the chief an idea, it becomes an item that waits for its time.
- Lifetime: session; history is permanent.

**Document**
- Purpose: hold written work: a plan, research or a spec.
- State: content, author, linked items.
- Actions: open, read, comment, approve.
- Lifetime: permanent.

**Thinking space**
- Purpose: give one hard question its own interface.
- State: sheets laid out (comparisons, diagrams, jigs), conversation, question.
- Actions: open, arrange, draw, decide. System: prepare.
- Lifetime: task; archived when decided.

**Change**
- Purpose: tell you what the factory changed, including fixes made without asking.
- State: what changed, which mission, which agent, when it merged.
- Actions: open, peek. System: record.
- Lifetime: permanent.

Names to check with Maggie: the **attention log** is called the "attention queue" in VISION.md. **Thinking space** and **document** might be one concept, since both are sheets in focus.

## 2. Object–action matrix

| Object \ Action | open | peek | decide | set aside | say | undo | find |
|---|---|---|---|---|---|---|---|
| Attention item | yes | yes | yes | yes | reply | | yes |
| Subject | yes | | | yes | | | yes |
| Decision | yes | yes | | | | yes | yes |
| Mission | yes | yes | | | | | yes |
| Agent | yes | yes | | | yes | | yes |
| Conversation | yes | | | | yes | | yes |
| Document | yes | yes | approve | | comment | | yes |
| Thinking space | yes | | yes | yes | yes | | yes |
| Change | yes | yes | | | | revert? | yes |

Intentional gaps:

- Missions aren't decided; their gates are, and a gate arrives as an attention item.
- Agents aren't set aside; their items are.

Open: should a change be revertable from Polychrome, or only through a new decision?

**Find** applies to everything. It is the hidden concept behind "Explore": one place to reach any object.

Attribute ranking:

| Object | Glanceable | On demand | Rare |
|---|---|---|---|
| Attention item | type glyph, title, who | the thing itself (options, preview) | full history |
| Mission | step track, title, waiting on you | agents, current step | logs |
| Agent | state | current work | transcript |

## 3. Spatial model

| Surface | Tier | Attachment | Origin | Persistence | Narrow screen |
|---|---|---|---|---|---|
| Ground: overview, log, missions | 0 | is the world | none | permanent | single column, log first |
| Sheet in focus (item, document, thinking space, mission) | 0, raised | expands in place from its card | its card | task | full screen |
| Navigation | depends on direction (see below) | | | session | |
| Conversation | 1, docked | peer: pushes the sheet aside | right edge | session | overlay sheet from the bottom |
| Peek (agent, mission) | 3, overlay | serving: covers and casts a shadow | right edge | task | bottom sheet |
| Menus, split button options | 4, tethered | belongs to its trigger | grows from trigger | moment | bottom sheet |
| Slip (urgent attention) | 6, ephemeral | above all, never steals focus | bottom edge | until dealt with | same |
| Tooltip | 7 | tethered | its trigger | while hovered | none |

A correction to round 1: the conversation is docked, so it should have no shadow, only a seam. Round 1 gave it the panel's shadow.

### Navigation: three directions

The directions differ in where places live and what "deeper" means, not in styling.

**A. Rail.** A narrow docked rail on the left (tier 1, pushes) holds the places: Attention, Overview, Explore. Deeper means a sheet opens over the ground to the right of the rail. In focus, the rail slides away left. It's familiar and Linear-like, and costs a permanent strip of chrome.

**B. Stack.** No chrome on the ground. Going deeper lays a new sheet on top. The previous one stays visible as an edge on the left, like paper on a pile, and stepping back slides the top sheet off to the right. The place you are is the pile itself. A small floating bar (functional layer) holds only the composer to the chief and find.

**C. Table.** One continuous table that you zoom. Zoomed out, you see everything: all missions, the log and the archive. Zooming into a pile or card grows it into focus. Explore is zooming out. Where you are is a zoom level, shown by a tiny breadcrumb that appears only while you move.

Leaning before building: B. It makes "deeper" physical with no permanent chrome, and it matches the paper material. A stays as the safe comparison.
