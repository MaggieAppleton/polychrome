# Build the reusable quality mission

Status: ready

QUALITY.md says what done means. It still needs turning into machinery:

1. Publish a reusable mission, `polychrome/quality`:
   - typecheck, test and build checks
   - two code-review agents running the built-in code-review skill, one on architecture and quality and one on security
   - a design reviewer when UI changed
   - findings go back to the builder
   - local merge to `main`
2. End every build mission with `uses-mission` pointing at it. Fractal's mission docs describe this under "Produced and used missions".
3. Add a post-merge git hook that starts it, and a hook that refuses commits to `main` made outside the merge step.

The conversation slice (`polychrome/slice-1`) started before this existed, so it has no quality step. Run the quality mission on it once it's built.
