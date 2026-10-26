# Design reference notes

Observations only. Sources: computed styles read from live pages via Playwright (1440x900), screenshots in this folder, and page text. Gaps are flagged. Motion could not be observed in stills, so motion notes come from page copy only.

## 1. Linear (linear.app, hero product mockup)

What: issue tracker; 2026 marketing positions it as "The product development system for teams and agents". The hero mockup is an inline, live-rendered app window (not an image). /method has no UI content (chapter headings only; opens "There is a lost art of building true quality software.").

Screenshots: `linear-home-hero.png`, `linear-app-ui-sidebar-issue-agent-panel.png`.

Layout and layering (three tiers visible in the mockup):
- Base: near-black page `rgb(8,9,10)`. App window: 1px border `rgba(255,255,255,.05)`, radius 8px, fill barely lifted (`rgba(255,255,255,.01)`).
- Left sidebar on the base surface, no separate fill: Pulse, Inbox, My issues, Reviews; then "Workspace" (Initiatives, Projects, More); then "Favorites". Section labels are small, dim, with a caret. Selected row is a faintly lighter rounded pill.
- Main pane is a slightly lighter rounded panel inside the window (own border, inset from the sidebar), with a header strip: status icon, `DRV-8852`, title, star, `1 / 84` with up/down arrows for stepping through a list.
- Cards in the activity feed: fill `rgb(15,16,17)`, 1px border `rgba(255,255,255,.08)`, radius 9px, hairline shadow `0 0 0 1px rgba(0,0,0,.2)`.
- Floating agent panel (top layer): fill `rgb(22,23,24)`, border `rgba(255,255,255,.12)`, radius 12px, shadow `0 2px 32px rgba(0,0,0,.25)`. It overlaps the issue pane and covers part of the right metadata column. Header has minimise, expand, close.
- Each tier is a few percent lighter than the one below; the border alpha rises with the tier (.05, .08, .12). Shadow appears only on the topmost floating layer.

Attention: not shown as badges in the mockup. Activity is a quiet timeline of one-line system events ("Linear moved from Todo to In Progress", "Triage Intelligence added the labels...", "Changed 2 files, Draft PR awaiting your review") in dim text with timestamps ("2min ago", "just now"). Agent work appears as an inline card ("Changed 2 files +22 -10", Draft PR, branch name, Preview button). Inbox is only a sidebar item here (the inbox view itself was not shown).

Typography: Inter Variable (SF Pro Display fallback). Weight 510 for headings and buttons, 400 body. Marketing sizes: h1 64px, h2 48px with letter-spacing about -0.022em, body 15px, nav links 14px, buttons 13-14px. App mockup text is roughly 13px, one size for most rows; hierarchy comes from colour (white vs `rgb(138,143,152)` grey) and weight. Monospace for identifiers and code (`vehicle_state`, branch names, `DRV-364`).

Colour: grayscale UI. Text `rgb(247,248,248)` and `rgb(138,143,152)`. Colour reserved for status icons (yellow in-progress ring, yellow star, purple/blue PR icons, green/red diff counts) and the single brand button `rgb(94,106,210)`. Sign up in the nav is a white pill.

Density: rows about 30px tall, 13px text, 8px radii, icons about 14px. Dense but with generous padding in the main pane (content starts ~70px in from the pane edge).

Motion: not observable here. (Header uses `--header-blur: 20px`, a blurred sticky header.)

Distinctive:
- Depth from lightness steps and border alpha, with shadow reserved for floating layers.
- Overlays are non-modal docked-looking panels (agent chat) that sit over content with minimise/expand controls.
- List navigation built into the detail header (`1 / 84`, arrows).
- Event log written as plain sentences with actor names bolded; no cards for system events.
- Marketing copy now frames agents as teammates in the same activity feed.

## 2. Arc UI (uiarc.dev)

What: "The React UI library your AI agents can build with." 188 animated components and 113 blocks, shadcn CLI and MCP install, Free and Pro tiers ($249 lifetime). It is a library marketing site, not an app UI.

Screenshot: `uiarc-home.png`.

Layout and layering: white page; a gradient announcement bar on top; nav is a centred pill-shaped tab group with a border; hero is one large rounded card (about 24px radius) inset from the viewport edge, filled warm off-white with soft blurred pastel blobs (pink, lavender-blue, cream) in the corners. Below: component card grid with preview, name, one-line description, Free/Pro tag; install section; FAQ.

Attention/notifications: none in the page itself. Component copy mentions toasts that "fan out on hover".

Motion (from copy only): cards that "lift, tilt and spring", a slider that "stretches like rubber", a sliding tab indicator. "Arc components include reduced motion behavior."

Typography: Geist for headings (h1 72px, weight 400, letter-spacing about -0.057em, so very tight; h2 52px/-0.03em), Inter for body (16 and 18px). Headings are regular weight, not bold. Dark navy-grey heading colour `rgb(38,41,49)`, body grey `rgb(91,98,109)`.

Colour: near-monochrome neutrals in oklch; colour only in the pastel gradient and a tiny Pro badge. Primary buttons are solid near-black pills; secondary are outlined pills. Dark mode toggle in nav.

Borders/radius/shadow: hairline borders, large radii and pill shapes, almost no shadows on the home page.

Distinctive:
- "Source files live in your project": components are copied in, not imported.
- Docs written for agents: per-component Markdown, llms.txt, MCP server.
- Physical-feeling motion vocabulary (lift, tilt, spring, rubber stretch).
- Reduced-motion treated as a built-in property of each component.
- Big tightly-tracked light-weight headline as the main visual.

## 3. Interface Craft (interfacecraft.dev)

What: Josh Puckett's paid learning library on interface design: 40+ articles, interactive walkthroughs, videos, skill files, tools (DialKit, Pica, Interface Kit). 3 items free. Endorsements from design engineers at Linear (Emil Kowalski) and Vercel (Rauno Freiberg).

Screenshot: `interfacecraft-home.png`.

Layout and layering: single centred column on pure white, tiny top bar (logo top-left, grey "Login" pill top-right, no nav). Hero is a short rule, a serif title, a grey subtitle, then a fan of five tilted, overlapping portrait cards. Cards overlap and are clipped by their neighbours, each rotated a few degrees. Long scroll afterwards: library, author, membership, FAQ.

Cards: flat solid colours (orange, cream, blue, mint green, near-black), radius about 16px, no visible shadow. Each has a generative line or grid pattern at the top (vertical lines, pixel grid, wavy lines, bar code, wireframe) and a serif title in the bottom-left in a tint of the card colour.

Principles quoted: "Designed with uncommon care", "Software that feels right", "Functional, but forgettable." Also: "Products that are loved. Interfaces that feel timeless. Experiences that welcome you in and anticipate your needs." and "an almost unreasonable level of consideration."

Motion: the tilted card fan suggests hover/entrance animation; not verified. Copy says interactive demos are "best experienced on the web".

Typography: Signifier (serif) for titles (h1 50px, weight 400, -0.025em; h2 28px); system-ui sans for body (16 and 18px) in mid-grey `rgb(115,115,115)`-ish. Serif for display, sans for reading.

Colour: black text on white, with saturated flat colour only on the cards; logo is a 2x3 grid of coloured squares.

Distinctive:
- Serif plus system sans on white with almost no chrome.
- Colour concentrated in objects (the cards), not in UI.
- Cards as a fan/stack, overlapping and rotated, instead of a grid.
- Generative pattern as the identity of each category.
- Stance statement as product: craft against "forgettable" output.

## 4. Dot by New Computer (Jason Yuan), archived Nov 2023

What: pre-launch page for Dot, "an intelligent guide designed to help you remember, organize, and navigate your life." Told as a story of Mei, a college student, in scroll-driven chapters with a phone mockup. The archive replays some assets imperfectly (console errors, some media missing).

Screenshots: `dot-new-computer-2023.png`, `dot-new-computer-2023-proactive.png`.

Layout: pure white page, centred text only; tiny nav (About, Waitlist) centred at top; a black two-blob "dot" mark; a circular grey down-arrow button. Further down, a single iPhone-shaped surface in warm grey (about `#E9E6E1`) holds the app: messages as soft grey bubbles, an input pill ("Share with Dot...", plus and mic icons). Chapter labels sit below the phone in grey pills with a plus icon ("Memory", "Context Awareness", "Dynamic UI", "Personalization", "Proactive Agency", "Automations & Routines", "Connecting the Dots").

Attention: the proactive-agency chapter has Dot message the user first: "Dot remembers Mei's interest in singing and proactively sends her suggestions for music clubs at school." Attention is conversational, not badge-based.

Motion: scroll-driven narrative; the phone content changes per chapter and bubbles appear blurred/fading in. "Dynamic UI" chapter: Dot changes the quiz format "when that gets monotonous". Details beyond this not visible in the archive.

Typography: Die Grotesk A throughout, one family. Statement text about 36px, weight about 600, tight leading, centred. Body in the phone about 16px regular. Black on white.

Colour: black, white, warm grey. No accent colour seen. Grandmother's recipe photo is the only coloured element.

Borders/radius/shadow: no borders or shadows seen; shapes defined by fill difference. Large radii (phone about 40px, bubbles and input about 16-24px, chapter pills fully round).

Quoted: "Cool! Now this will be with me wherever I go." (Mei, on Memory); "...who is always here to help connect the dots."

Distinctive:
- Whole product explained as a narrative of one person's day, with features as chapter titles.
- The interface is a single chat surface; features appear as behaviours (memory, proactivity, UI that changes format).
- Warm grey surface instead of white inside the device, with no borders.
- Text-only, giant-statement landing page with one brand mark.
- Agent initiates contact.
