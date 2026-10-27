# Round 2: surfaces and navigation

Open in a browser:

1. `index.html`: the six surfaces at rest (Attention, Overview, Mission, Conversation, Thinking space, Find).
2. `stack.html`, `rail.html` and `table.html`: the three navigation directions. They're live, so open cards, press Esc and switch places. Add `#tour` to the URL to watch each play its transitions by itself.

Stills are in `screenshots/`. The model behind this round is `../design-model.md`.

## The three directions

They differ in where places live and what "deeper" means, not in styling.

| | Stack | Rail | Table |
|---|---|---|---|
| Places | Side by side on one long table. The table slides under a floating bar. | In a docked rail on the left, one above another. The content slides vertically. | Regions of one world. The camera flies between them. |
| Deeper | A new sheet is laid on top, grown from what you opened. Lower sheets step back to the left as visible edges. | The sheet replaces what's under it, and a breadcrumb holds the way back. | The camera moves toward the card while it grows into a sheet: you travel to it. |
| Back | The top sheet shrinks back into its origin. | Fades back, or press a breadcrumb. | The camera pulls back out. |
| Find | A sheet grown from the bar's find button. | A sheet grown from the rail's find button. | Zoom out to see everything, and matches stay lit where they live. |
| Chrome in focus | None. The bar sinks away and returns when the pointer nears the bottom edge (or you swipe up). | The rail stays. | None. The minimap shows only while you move. |
| Conversation | On the bare table, a sheet grown from the chief's disc. With a sheet open, it docks beside it. | Always docks on the right and pushes the content narrower. | Same as Stack. |

## What I'd choose

**Stack, with Table's way of finding.**

- **Stack makes depth physical and costs no chrome.** You can always see how deep you are, because the edges of the sheets below show. Back always reverses the motion that brought you in. In focus, the screen is only the sheet.
- **Rail is the safe, familiar option.** Its costs are a permanent strip of chrome and a flat "replace" model, so depth lives in a breadcrumb instead of in space. It's what Linear does, and it would make Polychrome feel like Linear.
- **Table's best idea is find.** Zooming out to see everything, with matches lit in place, is the most physical find of the three. As a whole, though, Table disorients. The world's layout is arbitrary (why is the archive to the left?), zoom is hard to control precisely on a trackpad, and a large world is costly to render.
- **The hybrid.** Stack for places and depth. Pinch out, or press `-`, to step back from the table and see everything with matches lit. That's find.

## shadcn/ui

Build on its primitives, not its look:

- **Use** its accessible behaviour, which comes from Radix: Popover, DropdownMenu (for the set-aside split button), Tooltip, Dialog and Command (for find), plus the copy-in component model. It's all source in our repo, so it can be restyled freely.
- **Don't use** its default visual style. It's flat, with uniform borders and radius tokens. Our material needs elevation tokens, a warm ground and hairlines tied to height, so we'd replace its styling with `design/shared/base.css` tokens.
- **Write our own** for the nouns: cards, piles, the step track, the slip and the stack. Write the motion with `motion/react` springs that match `spring.js`. shadcn has nothing for paper, piles or springs.

Shortcuts in all three: `1` and `2` for places (`3` in Table), `/` find, `c` the chief, Esc back.

## Review gate

The interface-grammar review gate first came back Not ready, with 9 blocking findings. Fixed:

- The conversation now docks beside an open sheet in every direction.
- Find is one verb everywhere.
- A sheet in focus is defined: it's raised, not a modal.
- New surfaces have tiers, and z-index comes only from tokens.
- Focus rings, tooltips with shortcuts, and keyboard shortcuts are added.
- Exits mirror entries, and docking can be reversed mid-flight.
- There's a needs-you mark on Attention.
- Round shapes are kept for agents.
- The decorative tilt, redundant text and jargon are gone.
- The model now has its behaviour table, encoding map and ledger.

Deferred, as listed in the model's section 6: decide and set aside on these surfaces, narrow-screen drawings, and drag gestures.

## Changes to round 1

- **The docked conversation has no shadow.** It pushes the content aside, so it's a peer of what it sits beside and gets only a seam.
- **Seals, counts and markers are rounded squares.** Round now means only an agent.
- **"Finding" is a flag, not a magnifier.** The magnifier now means only find. One icon, one meaning.
- **Timestamps use a darker grey.** The faintest grey failed contrast for readable text. It's now kept for placeholders.
