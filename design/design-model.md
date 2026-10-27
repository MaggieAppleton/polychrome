# Design Model: Polychrome

Draft 2, 2026-10-27, after round 2's review gate. Builds on round 1 (`design/01-grammar/`) and DESIGN.md. Screens are in `design/02-surfaces/`.

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
- Purpose: turn what you say into work for others.
- State: what you've said, the items it made, who it gave them to.
- Actions: talk to. System: log an idea, delegate, bring back.
- Operational principle: if you say "I want scheduled reviews", the chief makes an idea item, finds who could prepare it, and brings it back when its time comes.
- Lifetime: permanent. On screen it's an agent (a disc) and is the default for every conversation.

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
- Operational principle: if a mission writes a survey, you open it from the mission, and approving it lets the mission continue.
- Lifetime: permanent.

**Thinking space**
- Purpose: give one hard question its own interface.
- State: sheets laid out (comparisons, diagrams, jigs), conversation, question.
- Actions: open, arrange, draw, decide. System: prepare.
- Operational principle: if a decision needs more than a comparison, a researcher prepares a space with the evidence laid out, and you decide from inside it.
- Lifetime: task; archived when decided.

**Change**
- Purpose: tell you what the factory changed, including fixes made without asking.
- State: what changed, which mission, which agent, when it merged.
- Actions: open, peek. System: record.
- Operational principle: if a quality agent fixes a focus ring without asking, a change appears in the overview marked "Without asking", so nothing happens unseen.
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

**Find** applies to everything. It's a verb, summoned from anywhere, never a place. "Explore" is retired as a name.

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
| Conversation, with a sheet open | 1, docked | peer: pushes the sheet aside | right edge | session | overlay sheet from the bottom |
| Conversation, on the bare ground | 0, raised (a sheet) | expands from the chief's control | that control | task | full screen |
| Stack: bar (places, chief, find) | functional layer | floats; content passes beneath | bottom edge | session; sinks in focus | bottom tab bar |
| Rail: rail | 1, docked | peer: pushes content | left edge | permanent; stays in focus | bottom tab bar |
| Rail: breadcrumb | 1, part of the content area | belongs to the open sheet | top of content | task | back button only |
| Table: minimap, where label, chief | functional layer | floats; visible only while moving | bottom right and top left | session | hidden; places become a bottom tab bar |
| Peek (agent, mission) | 3, overlay | serving: covers and casts a shadow | right edge | task | bottom sheet |
| Menus, split button options | 4, tethered | belongs to its trigger | grows from trigger | moment | bottom sheet |
| Slip (urgent attention) | 6, ephemeral | above all, never steals focus | bottom edge | until dealt with | same |
| Tooltip | 7 | tethered | its trigger | while hovered | none |

A correction to round 1: the conversation is docked, so it should have no shadow, only a seam. Round 1 gave it the panel's shadow.

**Sheet in focus.** A sheet in focus is the object of interest raised off the ground, not a modal. The ground behind it is inert, and pressing it puts the sheet back (the same as Esc). Only the top sheet is active. In Stack, sheets beneath it are its history, shown as edges, not open layers. So "one transient layer at a time" holds: transient layers are popovers and menus, never sheets.

**z-index** comes only from the `--z-*` tokens in `design/shared/base.css`.

### Navigation: three directions

The directions differ in where places live and what "deeper" means, not in styling.

**A. Rail.** A narrow docked rail on the left (tier 1, pushes) holds the places, Attention and Overview, plus find and the chief. Deeper means a sheet replaces the content to the right of the rail. In focus the rail stays. In Rail, the conversation always docks, even on the bare ground: that is part of this direction. It's familiar and Linear-like, and costs a permanent strip of chrome.

**B. Stack.** No chrome on the ground. Going deeper lays a new sheet on top. The previous one stays visible as an edge on the left, like paper on a pile, and stepping back slides the top sheet off to the right. The place you are is the pile itself. A small floating bar (functional layer) holds only the composer to the chief and find.

**C. Table.** One continuous table that you zoom. Zoomed out, you see everything: all missions, the log and the archive. Zooming into a pile or card grows it into focus. Find is zooming out: "Everything" is a zoom level, not a place. Where you are is a zoom level, shown by a tiny breadcrumb that appears only while you move.

Leaning before building: B. It makes "deeper" physical with no permanent chrome, and it matches the paper material. A stays as the safe comparison.

**Decided in round 2:** Rail keeps the rail visible in focus. That's its honest cost, and why it isn't the recommendation.

## 4. Behaviour

| Element | Rest | Approach | Hover / focus | Press | Expanded | Exit | Touch |
|---|---|---|---|---|---|---|---|
| Card that opens | lift 2 | | rises 1px to lift 3; focus ring | | grows into its sheet from its own bounds | shrinks back into the card | tap |
| Sheet in focus | lift 3 | back control appears while the pointer moves | | | | returns to its origin | edge swipe right = back |
| Stack bar | lift 2, bottom centre | rises back in focus when the pointer nears the bottom edge | tooltip with name and shortcut | scale 0.94 | | sinks below the edge in focus | swipe up from the bottom edge |
| Place control | icon; current has a fill | | tooltip | the fill slides to it (card spring) | | | tap |
| Rail and its controls | docked, seam | | tooltip to the right | the fill slides to it | | stays in focus | bottom tab bar |
| Rail breadcrumb | hidden at a home | appears with the first sheet | each part is a button | goes back to that depth | | fades | back button |
| Table minimap, where label, chief | hidden | shown while the pointer moves | tooltip | flies the camera | | hidden and unreachable when still | places become a bottom tab bar |
| Docked conversation | off-screen right | | | | slides in and pushes the sheet narrower | slides back out; reversible mid-flight | bottom sheet |

Shortcuts: `1` and `2` (and `3` in Table) for places, `/` for find, `c` for the chief, Esc for back. Every card that opens is focusable and opens with Enter or Space. Drag is deferred (section 6), so there's no drag column yet.

## 5. Surface

Encoding map:

| Variable | Meaning |
|---|---|
| Orange accent | Needs you. Nothing else. |
| Round | An agent. Seals, counts and markers are rounded squares. |
| Shadow | Height above the ground, from the lift tokens only. |
| Hairline seam | Docked: a peer of what it sits beside. |
| Weight 600 | Titles of sheets. Weight 500 marks names and the current item. |
| Glyphs | One per attention type. The magnifier means only find. |

Primary text button per surface: "Choose markdown-it" in the thinking space. Everything else is an icon.

Justification ledger, for elements added in round 2:

| Element | Expresses | What fails without it |
|---|---|---|
| Edges of lower sheets (Stack) | depth: how far in you are | you lose your place and back feels like a guess |
| Needs-you mark on Attention | items are waiting while you're elsewhere | purpose 1 fails from the overview |
| "Without asking" on changes | agents acted unasked | VISION.md's "fixes they made without asking me" is invisible |
| Recent decisions fading below the log | recency and undo-ability | you can't take back what you just decided |
| Minimap (Table) | where you are in a world larger than the screen | you can't navigate the world |
| Where label (Table) | the name of where the camera is | zoom levels have no name |
| Stack bar | places, the chief and find, from anywhere | no way between places or to the chief |
| Rail breadcrumb | the way back from a replaced sheet | Rail has no visible depth without it |
| Docked conversation | talking about the thing in front of you | you have to leave the sheet to ask about it |

## 6. Deferred

- Prototype decide and set aside on these surfaces. Round 1 shows both.
- The slip is in round 1 and not repeated here.
- Narrow screens are stated per surface above, not drawn.
- Dragging the table between places (Stack) and pinch-drag (Table).
- The full agent symbol (issue 013).

## 7. Open questions for Maggie

1. A thinking space and a document: one concept (a sheet you think in) or two?
2. A change: revertable from Polychrome, or only through a new decision?
3. Is a stack of sheets right for depth, or should deeper always replace, as in Rail?
