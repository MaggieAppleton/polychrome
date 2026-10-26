# Older conversation history

Status: in-mission (polychrome/older-history)

A conversation shows only the newest page the live follow delivers, often just the last few minutes of a busy agent. There's no way to scroll back further.

Fractal supports it: the timeline has an older-page cursor (`readOlder`/`applyOlderPage` in the TypeScript client, `docs/clients/build-your-own.md`). Open question: load on scroll, or an explicit "Earlier" control at the top.
