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
