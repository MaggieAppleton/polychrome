# Round 1: grammar and layers

Open in a browser, in this order:

1. `layers.html`: the layer model, and a prototype that plays overview → raise → focus → talk → attention arrives → glance → step back.
2. `index.html`: the nouns and their shapes.
3. `verbs.html`: the verbs, each moving on its own patch of ground.

Stills of each are in `screenshots/`. `../references/NOTES.md` has notes on Linear, Arc UI, Interface Craft and Dot.

## Choices worth questioning

- **Two shapes.** Discs are agents and everything else is rectangular paper. It's the cheapest way to tell an actor from an object, and it frees colour for round 3.
- **One accent, only for attention.** If orange appears anywhere, it means something needs you. That rule has to survive the rainbow brand.
- **The log keeps history.** Decided items stay in the same column below a line, as records. This makes decisions traceable without a separate place to look.
- **The conversation sits beside the sheet, not over it.** A peek panel covers; a conversation makes room. That's the only exception to panels covering.
- **The slip.** Attention during focus moves once, shows no words and waits. The reference for this is Dot, where the agent reaches out rather than badging, but kept quieter.
- **Ground is warm grey, not white.** Paper only reads as paper on something darker. Linear does the same with its three layers of near-black.

## Shared parts

`../shared/` holds the tokens (`base.css`), the nouns as CSS (`parts.css`), icons and the spring helper, so rounds 2 and 3 build on the same material.

## Maggie's feedback, 2026-10-27

The grammar is right to build on. Keep the single orange accent, the slip and the motion as a baseline.

- **Focus:** only urgent things break through, as the slip. How urgency is decided is issue 012.
- **Agents:** discs stay, but they should feel alive (issue 013).
- **Accent:** orange keeps meaning "this needs you". The rainbow goes elsewhere.
- **Log:** recent decisions stay visible for undo and review, roughly five to ten of them. Older ones fade to an archive.
- **Conversation:** beside the sheet is right.
- **Set aside:** Polychrome decides when it comes back. A split button lets you choose a time instead (issue 014).
