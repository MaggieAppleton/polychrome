# Polychrome: design

Draft 2, 2026-10-27, after Maggie's feedback on round 1 (grammar and layers). Written from Maggie's brief in the design-surfaces mission and what the wireframes in `design/01-grammar/` taught us. Expect it to change after each round.

## Principles beyond Polychrome

These are how Maggie designs any interface. They aren't specific to this product.

1. **Interfaces are physical material.** Paper on a table: a base layer, sheets and cards on it, panels that slide in from an edge. Every surface has a height, and height decides its shadow, hairline and motion. Nothing floats without a reason.
2. **Motion obeys physics.** Things move with springs, not durations. They come from somewhere and go back the way they came. A card that opens into a sheet is the same piece of paper, just larger. Motion is for continuity and state, never decoration. Respect reduced motion.
3. **Learn by doing, not by reading.** No instructional text: no "click here", no "hover to view". A control's shape and placement say what it does, and tooltips carry secondary labels.
4. **Minimal and progressive.** Show the least that's needed. Reveal more as a person goes deeper. Components start small and grow.
5. **Icons over words.** Prefer icon buttons. Use a text button only for a primary or secondary action whose label tells you what happens next ("Choose markdown-it").
6. **Calm, not silent.** What needs a person should be unmistakable without being loud. It moves once and then stays still, and it uses the one colour on screen. It never pulses, never makes a sound and never uses red badges.
7. **Few type sizes.** Base about 14px, metadata 12-13px, on a fluid Utopia scale. Hierarchy comes from weight and tone, not size.
8. **Quiet surfaces.** Soft shadows, hairline borders at 7-10% black, radius 6-16px by element size. Inter. Light mode first, dark mode treated properly when it comes.
9. **Never:** dot separators between pieces of information, coloured left borders or bars, features on screen before they work.

## Polychrome

### The material

Five layers, each higher off the table than the last. See `design/01-grammar/layers.html`.

| Layer | What sits there | Shadow | Hairline | Spring |
|---|---|---|---|---|
| Ground | The table. Warm grey, never white. Holds no content of its own. | none | none | none |
| Sheet | What you're working on: a mission, a document, a thinking space. One in focus at a time. | lift 3 | 8% | paper |
| Card | Attention items, missions in a list. Rests on the ground or a sheet. | lift 2 | 10% | card |
| Panel | Conversation, peek. Anchored to the edge it slid in from. | lift 4 | 10% | paper |
| Popover | Menus, tooltips. Highest and shortest-lived. | lift 4 | 10% | flick |

A thing is as high as it is temporary.

### Two shapes

**Discs are agents.** They're the only round things, so an actor can be told from an object at a glance. **Rectangles are everything agents act on.** An agent's state shows as motion: an arc circles a working agent, a still ring in the accent marks one waiting on you, and an idle agent fades. The grey discs are placeholders. Agents should feel alive, perhaps as rainbow forms drawn with shaders (issue 013).

### Nouns

See `design/01-grammar/index.html`.

- **Agent**: a disc with a letter.
- **Mission**: a card with a step track, one bar per step, so progress and "stuck on you" read before the title.
- **Attention item**: a card with a type glyph. There are five types: decision, review, finding, idea and problem. Each item shows the thing itself (options, a preview), so it can be understood without opening it.
- **Subject**: items on one subject rest on each other as a pile. Grouping by subject (VISION.md) becomes physical.
- **Attention log**: one column. Open piles on top, a hairline, then recent decisions. It's a log, not an inbox, so nothing disappears. The last five to ten decisions stay on screen, where they can be undone or looked at again. Older ones fade into an archive you can open.
- **Decision record**: what an item becomes once decided. It's smaller and flatter, with a seal, and keeps the choice, the reasons and a link to the mission it started.
- **Conversation**: a tall panel beside the thing it's about. It goes to the chief of staff by default. No bubbles.
- **Document**: a portrait sheet with wide margins and no toolbar.
- **Thinking space**: a patch of open ground for one question, where agents lay out comparisons, diagrams and jigs, with a conversation docked at the edge.

### Verbs

See `design/01-grammar/verbs.html`.

- **Raise**: an agent puts an item down on the log. It settles like paper, and the items below make room.
- **Gather**: a new item on a waiting subject slides under that pile.
- **Open**: the card grows into its sheet from where it was. Everything else steps back.
- **Decide**: the option presses down, and the card shrinks into a decision record that drops into the history.
- **Set aside**: "I don't have to think about this right now." The card tips off the bottom edge into a later pile. By default, Polychrome decides when it returns. A split button's triangle offers tomorrow, next week or later for when you want to choose (issue 014).
- **Say**: what you tell the chief of staff lifts out of the conversation as an idea card and moves to the log.
- **Peek**: a panel slides in from an edge over the current view, and slides back the same way.

### Attention and focus

- **The overview is the ground**, with the attention log on it and missions in motion beside it.
- **Focus is one sheet on an empty table.** Opening an item zooms it into a sheet, and the log and missions slide off. Controls appear only while the pointer moves.
- **Talking happens beside the sheet.** The conversation pushes the sheet aside rather than covering it.
- **Only urgent attention reaches you in focus.** An ordinary question waits until you step back. Urgent means an urgent problem, or an agent stuck on you for a long time. How urgency is decided is open (issue 012).
- **Urgent attention is a slip.** A sliver of card slides up from under the bottom edge, showing only a glyph and a count. It moves once and then stays still. Bring the pointer near and it rises far enough to read. When you step back, it settles into the log as an ordinary item.

### Motion

Three springs, defined in `design/shared/spring.js`:

- **paper**: for sheets and panels. Settles without overshoot.
- **card**: has a small, felt overshoot.
- **flick**: for presses and toggles.

Every animation uses one of them, so everything feels like the same material.

### Colour

There's one accent, a warm orange-red, and it means only "this needs you": an unseen item's glyph, a ring on a waiting agent, a step waiting on you, the slip. This stays true after the brand arrives. The rainbow lives elsewhere, and where is round 3's question.
