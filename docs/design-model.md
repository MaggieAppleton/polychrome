# Design Model: Polychrome conversation client (review mode)

Reviewed from src/App.tsx, src/Conversation.tsx, src/styles.css, src/thread.ts, VISION.md and docs/screenshots/*.png. Part A is the model the screen implies today. Part B is findings, highest layer first. Part C is the better model as a diff.

## Part A. The implied model

### 0. Brief (inferred)
- Who: Maggie, reading what one agent has said and done, and replying.
- Posture: sovereign. Full-height, quiet chrome, one 680px reading column. The chrome budget is right.
- Purposes the screen serves: 1. see what an agent has said and done; 2. reply to it; 3. switch to another agent.
- Purposes in VISION.md the screen does not serve yet: know which agent needs me, and see work grouped by project.

### 1. Concepts as they appear
- Agent: a named seat in the sidebar. Only state shown is "selected". No working, waiting or failed state.
- Conversation: one agent's thread. Contains messages, work and dividers.
- Message: text from a sender. Labelled by an author line. Four names for the sender: the agent's name, a person's name, "Input", "You" (and "System").
- Work: one run of tool calls and thinking between messages. Shown as a tally ("Bash, Edit ×2"). Expands only if thinking exists, and then shows the thinking, not the calls.
- Divider: "Conversation compacted". An implementation word.
- Status: Connecting, Working, or a read-back error. One slot in the header.
- Composer: send grant on, a textarea and "Send". Grant off, a sentence with a terminal command.
- Older history: loads silently on scroll. No visible state while loading or at the true start.

### 2. Object-action matrix

| Object \ Action | select | read | expand | send | retry |
|---|---|---|---|---|---|
| Agent | yes | no | no | no | no |
| Message | no | yes | no | no | no |
| Work | no | yes | yes (thinking only, sometimes) | no | no |
| Pending message | no | yes | no | no | no (failed send has no resend) |
| Older history | no | auto | no | no | scroll away and back |

Gaps: no stop or interrupt while the agent is Working; no resend on a failed send; Work rows that look identical differ in whether they open.

### 3. Spatial model

| Surface | Tier | Attachment | Origin | Persistence | Note |
|---|---|---|---|---|---|
| Thread | 0 | base | n/a | permanent | messages, work, dividers |
| Sidebar | 1 | docked, seam border-right (styles.css:62) | left edge | session | pushes content, no shadow. Correct. |
| Header with status | 1 | docked, seam border-bottom (styles.css:93) | top edge | session | holds a moment-level status |
| Composer | 1 (docked) but styled as tier 2 | sits in the column, shadow and ring (styles.css:14, 146) | bottom | session | lifted look, nothing passes beneath it |
| Blocked notice | 0 | replaces the whole app (App.tsx:65) | none | until fixed | bare paragraph |

```
  composer      ▔▔▔▔▔▔▔▔▔▔   shadow, but docked in practice
  sidebar  ▕▔▔▏  header ▔▔▔▔▔▔▔▔▔▔▔▔▔  (seams only)
  thread   ▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁▁
```

There is one shadow token and no scale. No overlays, floats or modals exist. Correct for the posture.

### 4. Behaviour (implied)

| Element | Rest | Hover/focus | Press | Other |
|---|---|---|---|---|
| Agent row | grey text | bg-tertiary; focus ring | none | selected = bg + weight 500 + dark text |
| Expandable work row | quaternary text | text darkens, "›" fades in over 120ms | toggles, instant | "⌄" when open |
| Non-expandable work row | quaternary text | none | none | looks the same at rest as expandable |
| Textarea | no visible focus (styles.css:156) | none | none | Enter sends |
| Send | dark fill | none | none | disabled = 0.3 opacity |
| Thread | scroll | none | none | near top loads older; stays at bottom if at bottom |

Direct manipulation: none. Sidebar width is fixed at 220px. Only motion is the 120ms marker fade; no reduced-motion handling needed yet, but none exists.

### 5. Surface: visual-variable mapping as implied

| Variable | Meanings it carries today | Verdict |
|---|---|---|
| Bold 600 | author line, header title, bold inside agent prose (styles.css:95, 108, 116) | three meanings |
| Weight 500 | selected agent, Send | two meanings |
| text-secondary | user author, agent rows at rest | two meanings |
| text-tertiary | system messages, pending message, status, notices, hovered work row | five meanings |
| text-quaternary | work rows, dividers, placeholder, agent prefix | four meanings, and low contrast (about 2.4:1 on #fcfcfc) |
| Red | failed count, failed send, read-back error | one meaning, good |
| Accent blue | links, focus ring | fine |
| Shadow | composer only | claims elevation for a docked surface |
| 0.5px border | docked seams (two strengths: border-primary and border-secondary), table cells, composer ring | seam strength differs between sidebar and header |
| Background tint | sidebar surface, selected row, hover row, code blocks | hover and selected are identical |

Justification gaps: author line on every message; "No messages yet."; the divider's centring; the tooltip on agent rows.

---

## Part B. Findings (highest layer first)

### Layer 1. Grammar

1. **One sender, four names.** Conversation.tsx:17 gives "Input" for an unsigned user message and the person's name when signed; Conversation.tsx:143 shows "You" for the pending copy. When the send lands, the author line flips from "You" to "maggieappleton" and the row changes under the reader. "Input" is also a system noun, not a word a person would use. Fix: one rule. Messages from the person at this device read "You" whether pending or delivered; other people read their name; the open agent's own messages carry no label (see 9); unsigned user mail reads "Mail" or the sender id, never "Input".
2. **The sidebar has the wrong object and a flat structure.** VISION.md says attention goes by project, then subject. App.tsx:70-76 lists agents flat, and the project prefix is the part that gets truncated and dimmed (styles.css:76). The agent noun also has no state, so the sidebar cannot say which seat needs attention, which is the product's purpose. Fix: group rows by project prefix with a heading for each (the one case rule 8 allows headings: two groups must be told apart); show per-agent state at rest through text tone (working = text-secondary, failed = danger, idle = quaternary) on the row, with no dot or bar.
3. **Work is a noun with no object behind it.** Conversation.tsx:37-52 expands only the thinking; tool calls, the bulk of the work, are reduced to a tally and cannot be opened. A row that says "Bash ×3" promises the three commands. Fix: expand to show each call (name, input, result, failed state) beneath the thinking; every Work row is then expandable, which also removes the identical-looking yet inert rows (Conversation.tsx:44).
4. **"Conversation compacted" is an implementation word** (thread.ts:72-73, Conversation.tsx:55). A user would say earlier messages were summarised. Fix: "Earlier messages summarised" and style it as a seam (a hairline with text), the one place a divider shape is justified.
5. **Status mixes two concepts.** "Working" is the agent's state; "Connecting" is the client's; the read-back error is a history failure (Conversation.tsx:125-127). One slot, three nouns, and "Working" collides in sound with the Work row. Fix: keep the slot but name the agent's state "Running" (or move it onto the sidebar row per finding 2), and keep client and history problems in a separate transient voice (see 6).
6. **Sparse verbs.** No stop or interrupt while the agent is running; no resend on a failed send (Conversation.tsx:145 shows an error, then nothing). Fix: failed pending message gets a "Retry" action in place of the error text's dead end; add an icon-only stop on the composer while running. Ask Maggie first (see questions).

### Layer 2. Space

7. **Composer lifts but is docked.** styles.css:136-147 gives it a shadow and ring on a plain surface that never overlaps content: the thread ends above it, so nothing passes beneath. Rule: shadow means "above" only; this is a tier 1 docked surface. Fix: drop the shadow and keep a 0.5px seam, or let the thread scroll beneath a translucent composer so the lift is true. Prefer the first (smaller). Also removes the only use of `--shadow`.
8. **Transient status lives in permanent chrome.** The read-back failure is a moment-level message sitting in the docked header (Conversation.tsx:124-127), kept there so holding position cannot push it out of view. It is a tier 6 message in a tier 1 slot, and "Connecting" does the same. Fix: acceptable to keep one status slot, but state in the model that the slot is the ephemeral tier for the whole app, give failures a retry affordance (click the status to retry, with keyboard path), and stop requiring "scroll away and back" to retry (Conversation.tsx:72, 82).
9. **No spatial record of history.** Older history prepends silently (Conversation.tsx:80-86); there is no signal while it loads and none at the true start. Fix: while loading, the status slot shows "Loading earlier"; at the start, a hairline marks the first message. Anchoring is already correct (Conversation.tsx:94-100).
10. **Posture is stated nowhere and the blocked state discards the shell.** App.tsx:65 replaces the entire app with a bare paragraph at the top-left. Fix: keep sidebar and header, put the sentence where the composer would be, so the same thing lives in the same place (rule 8 of space.md). Same for not-granted (Conversation.tsx:149), which already does this. Good, keep.

### Layer 3. Material and motion

11. **Textarea has no focus signifier.** styles.css:156 removes the outline and nothing replaces it on the container. Keyboard users cannot tell where typing goes. Fix: `.composer:focus-within { box-shadow: 0 0 0 1.5px var(--accent) }`, or a darker seam.
12. **Expandable rows are undiscoverable on touch.** The "›" marker exists only on hover and focus (styles.css:127-129). On touch there is no hover. Fix: `@media (hover: none)` shows the marker at rest at low opacity; with finding 3 every Work row has one, so the marker can become a permanent quiet signifier.
13. **Open and close are instant; new rows appear from nowhere.** `<details>` has no height transition and new rows pop in. Fix: animate the open height and fade new rows (transform and opacity, under 150ms, interruptible), growing from the summary; wrap in `prefers-reduced-motion`. Keep sends instant.
14. **New messages while reading back are invisible.** When the reader is not at the bottom, new rows arrive off screen (Conversation.tsx:93-100) with no cue. Fix: the status slot shows "New below" and clicking it jumps down (also reachable by keyboard); no extra floating button.
15. **Send and agent rows lack press states, Send lacks hover** (styles.css:164-173, 65-80). Fix: define rest, hover, focus, press once for both. Hover and selected on agent rows are identical (styles.css:78-79); make hover a lighter tint than selected.
16. **Fixed 220px sidebar.** Spatial attribute with no manipulation (styles.css:51). Fix: draggable edge with a col-resize cursor, arrow keys when focused. Advisory; the narrow layout already handles small screens.

### Layer 4. Surface

17. **The author line repeats.** Conversation.tsx:30-31 prints a bold name above every message; in the screenshot "st/helper" appears five times in one view, and the header already says it. Rule 8: no labels that restate. Fix: unlabelled agent messages; label only when the sender differs from the open agent, and group consecutive messages from one sender under one label.
18. **Bold means three things.** 600 is the author line, the header title and any `**bold**` in agent prose (styles.css:95, 108, 116), so agent emphasis can look like a speaker change. Fix: author names keep 600; prose strong drops to 500 or the primary tone only.
19. **Greys are overloaded and the lowest one fails contrast.** text-tertiary carries five meanings and text-quaternary four (table above); quaternary #a3a3a3 on #fcfcfc is about 2.4:1 (styles.css:9, 123), and it carries the only record of what tools ran. Fix: two declared meanings: tertiary = "not from a person" (system, work, divider, status); secondary = "from someone else". Pending is a state: use opacity on the text it already has. Raise quaternary to at least 4.5:1 or stop using it for readable content; keep it for placeholder only.
20. **Instruction copy.** The not-granted sentence is a paragraph of CLI steps (Conversation.tsx:9, 149; pairing steps in App.tsx:13-15). Rule 8 forbids this, though the information is critical when sending is blocked. Fix: composer keeps its shape, disabled, with "Read only" and the steps one press away (expand in place, copy on press). Same for the blocked screen reasons.
21. **Filler empty state.** "No messages yet." (Conversation.tsx:139) restates what an empty thread already shows beside a ready composer. Delete.
22. **Two seam strengths.** Sidebar uses border-primary (styles.css:62), header border-secondary (styles.css:93) for the same meaning, docked edge. Fix: one token.
23. **Tooltip as the only place for the full agent name** (App.tsx:72) when the prefix truncates. Also the row has no accessible name beyond its text. Fix: grouping by project (finding 2) removes most truncation; keep the title as a convenience, not the only route.

### Deletion candidates
- Author line on the open agent's own messages (17).
- "No messages yet." (21).
- The composer shadow and `--shadow` token (7).
- The system-reminder style "Input" label (1).
- Second border strength (22).

### Questions for Maggie
- Is the object of interest here the agent's conversation, or the decision it is preparing (VISION.md)? This view is the right one for the first and a supporting one for the second.
- Should a person be able to stop a running agent from here?
- Should failed sends be retried by the reader, or by the app?
- Do you want agents grouped by project prefix now, or wait for the attention queue?

---

## Part C. Better model (diff)

```diff
 Concepts
-  Agent: a name in a list
+  Agent: a seat, with a state (running, needs me, failed, idle), grouped by project
-  Message: author line on each; four sender names
+  Message: sender named once per run; the open agent's own are unlabelled; "You" is stable
-  Work: tally, thinking only
+  Work: expandable run of calls and thinking, one row, always expandable
-  Divider: "Conversation compacted"
+  Divider: "Earlier messages summarised", a seam
 Spatial
   Sidebar    1 docked, seam            (unchanged)
   Header     1 docked, seam; status slot is the app's one ephemeral voice, clickable to retry
-  Composer   1 docked with shadow
+  Composer   1 docked, seam, focus ring; disabled shape instead of a sentence when read-only
 Behaviour
+  Work row: marker at rest, grows in place from its summary, reduced-motion safe
+  Status: "Loading earlier", "New below" (jump), failures retry on press
+  Sidebar edge: draggable, keyboard resizable
 Surface
-  Greys: five meanings on tertiary, four on quaternary
+  Greys: secondary = from someone else, tertiary = not from a person, quaternary = placeholder only; all at least 4.5:1
-  Bold: author, title, agent emphasis
+  Bold: names only
```

Slice order if you want it in PRs: (1) naming and author line (1, 17); (2) composer seam, focus, grey contrast (7, 11, 19); (3) Work expands calls (3, 12); (4) sidebar grouping and agent state (2).
