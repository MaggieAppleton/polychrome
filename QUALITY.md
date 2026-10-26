# What done means in Polychrome

Every build mission ends with the quality mission. Work reaches `main` only when all of this holds.

## Checks

- `pnpm typecheck` passes.
- `pnpm test` passes.
- `pnpm build` passes.

## Reviews

Each reviewer reads the diff since `main` and either signs off or returns findings. Findings go back to the builder, and review runs again.

Two code reviewers, each a separate agent running the built-in code-review skill:

- **Architecture and quality.** Is this the right shape? Is the code good, clear and no bigger than it needs to be?
- **Security.** Credentials stay out of the repo and the browser, the gateway admits only this machine, nothing is published.

One design reviewer, when files under `src/` that render UI changed:

- **Design.** Applies `maggie-design` and `campsite-design`. No dot separators, no coloured left borders or bars, as few type sizes as possible.

## Merge

The merge is local to `main`, with no pull request. It needs both checks and all reviews clean.
