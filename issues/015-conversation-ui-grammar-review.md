# Apply the interface-grammar review to the conversation UI

Status: idea

An interface-grammar review of the current conversation client is in `docs/design-model.md`: the implied model, 23 findings from grammar down to surface, and a better model. The biggest:

- **Grammar:** the person who sends has four names ("Input", "You", then their own name once delivered). The sidebar is a flat agent list with no state, so it doesn't serve the project grouping and attention purpose in VISION.md. Work rows promise tool calls but expand only thinking.
- **Space:** the composer has a shadow but never overlaps content. Transient status and failures live in the permanent header.
- **Motion:** the composer has no focus signifier, and the expand marker shows only on hover, so touch can't find it. Older rows arrive with no cue.
- **Surface:** bold and the two lightest greys each carry several meanings. The lightest grey is about 2.4:1 contrast. The not-granted sentence is instructional.

Several of these depend on the design-surfaces mission (grammar, layer model, navigation), so wait for its first two rounds before building. Overlaps issues 011 and 012.
