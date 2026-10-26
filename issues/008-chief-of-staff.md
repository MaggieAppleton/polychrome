# The chief of staff

Status: idea

One agent, `agent/polychrome/chief`, is the default place I talk to in Polychrome.

- **Default, not the only option.** The composer goes to the chief unless I pick another agent to talk to directly.
- **Its staff.** The chief is told that the other agents (builder, reviewers, researchers) are its staff.
- **It delegates, never does.** The chief does no work itself: no code, no research, no prototypes. It turns what I say into issues, decides who should do what, starts missions or messages its staff, and brings results back to me.
- **Brings me things.** Its asks are the attention queue, grouped by subject (see VISION.md).

## Built from Fractal parts

- a named agent working in this repo
- standing instructions in `CHIEF.md`, pointed to from `CLAUDE.md`, because Fractal agent constraints only apply inside missions
- memory from its handoff document plus `issues/`, `VISION.md` and decisions
- asks for the queue, missions and messages for delegation, and a schedule to tend the queue overnight

## Open questions

- How does it stay a delegator? Instructions alone may not hold. Restricting its tools or what it may write could enforce it.
- Which staff are always running, and which does it start as needed?
