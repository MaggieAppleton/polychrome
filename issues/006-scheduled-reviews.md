# Scheduled and triggered reviews

Status: idea

What should run on its own:

- **On every merge to `main`:** the quality mission from QUALITY.md, started by a post-merge git hook.
- **Weekly:** a security sweep of the whole repo.
- **Daily:** a design and QA review with screenshots. The reviewer uses the app like a person would and looks for two things:
  - regressions: anything that got worse since the last review
  - opportunities: rough edges, interactions that don't feel nice, and anything that doesn't match my design philosophy

Findings land in `issues/` as `idea`, so nothing gets built without me.

## Needs me first

The daily design review depends on a written brief: my preferences for interfaces and interactions, specific enough for a reviewer to check against. That's a real piece of writing I need to sit down and do. `maggie-design` and campsite-design are a starting point, not the whole thing.

## Open questions

- Should the design reviewer compare against the previous day's screenshots?
- How many findings per day before it becomes noise? Maybe a cap, or the top three.
- Which time of day, so it's ready when I start work?
