# Survey: building Polychrome on Fractal

Paths are relative to `reference/fractal`. Read-only reference; nothing there was changed.

## 1. Connecting and authenticating

**The browser never holds a credential and never pairs.** fractal-web always talks to its own page origin (`baseUrl: window.location.origin`, `apps/fractal-web/src/web/liveRuntime.ts:35`), and something on that origin admits it:

| Mode | Who admits the browser | Credential |
|---|---|---|
| Daemon-served (`st web`, `127.0.0.1:7410`) | The daemon, via a one-time `?token=` launch URL that it swaps for a cookie | HttpOnly `fractal_local` cookie, 12h (`crates/fractal-daemon/src/web.rs:129-173`) |
| Vite dev proxy (`scripts/vite-gateway.mjs`) | A middleware that checks loopback Host and the exact Vite Origin (`server/devAdmission.mts`) | The proxy injects a paired bearer from `WF_ST_AUTHORIZATION` and forwards to the daemon's unix socket `WF_ST_GATEWAY` |
| Tailnet publisher (`server/host.mts`) | `tailscale serve` identity header plus exact Origin | Bearer from a chmod-600 file |

- **Transport:**
  - Plain HTTP goes to `/v1/client/*`.
  - Live collections and conversations share one multiplexed WebSocket.
  - There is no SSE.
  - The proxy strips the browser's `authorization` and `cookie` headers and injects the bearer on both HTTP requests and WebSocket upgrades (`server/gateway.mts:20,74,135`).
- **Device pairing** is a CLI step done once by the person on the trusted machine (`docs/st3/client-only.md:13-51`, `docs/st3/device-signing.md`):
  1. `st devices pair "polychrome" --as person/maggieappleton --full-control` runs `POST /v1/client/pairings`. Only the local unix API may start a pairing. It produces an 8-character code that expires in 5 minutes.
  2. `st devices complete …` runs `POST /v1/client/pairings/{id}/complete` with the code and the device public key. It returns a 30-day bearer `credential`, the `scopes` and `expires_at`.
- **The message-send grant:**
  - The `message.send` action needs the `control.messages` scope. Only a `--full-control` pairing, or the daemon's own cookie session, has it. Limited pairings leave it out (`crates/fractal-api-client-v0/src/api/client_v0.rs:2748`).
  - `GET /v1/client/capabilities` reports each action as `granted`, `ungranted` or `unavailable`.
  - fractal-web reads it into `grants.messageSend` (`src/data/liveSource.ts:1081-1104`). The default is `ungranted`.
  - It re-checks before every send (`src/data/attachmentPort.ts:92`).
  - When sending isn't allowed, it disables the composer with "Message send is not granted for this device." (`src/web/composerSend.ts:98-101`).

## 2. SDK calls

There are two layers:
- `@fractal/client` provides `FractalClient`, a generated HTTP client (`clients/typescript/fractal-client/Client.generated.ts`).
- `@fractal/sdk/effect` provides `St3Live(options)`, an Effect service over the shared socket (`packages/fractal-sdk/src/effect/mod.ts:274-325,1228`).

Every live stream yields `Observed | Stale | Failed`. The next `Observed` after a `Stale` is authoritative.

| Need | SDK (`St3`) | Raw client |
|---|---|---|
| Agent list | `readAgents` (one page), then `followWindow({collection:'agents'})`; keep rows with `kind === 'agent'` | `agentsList` |
| One conversation | `followConversation({_tag:'Conversation', ref: agentRef})` → `ConversationChunk {replace, hasMore, entries}`. Fold: on `replace`, reset; otherwise merge by `id`, keeping the higher `revision` | `timelineList`, `conversationChanges` (long poll), `conversationStream` |
| Send | `messageSend({to, content, kind:'wake'})` with an idempotency key and a fence `{snapshot_id}` | `client.messageSend` |
| Alerts | `followWindow({collection:'attention'})` | `attentionList` |
| Missions and runs | `followWindow({collection:'missions'})`; runs are carried inline on each mission (`run_details`, `active_runs`) | `missionsList`, `workList` |

- **Send flow** (`liveSource.ts:846-918`):
  1. Paint an optimistic row.
  2. Take `snapshot_id` from the latest window snapshot.
  3. Send.
  4. Retire the optimistic row when `message/<sha256(key)[0..16]>` echoes back into the timeline.
  5. Map `stale-fence` and `unconfirmed` errors to plain messages.
- **Timeline entry** (`Models.generated.ts:3030`):
  - Fields: `{id, sequence, revision, role, timestamp, type, body}`.
  - `type` is one of `message`, `content`, `tool_call`, `tool_result`, `status`, `error`, `usage`, `redaction` or `truncation`.
  - `content` may carry `blocks[]`, each with a `visibility`.

## 3. Claude events to hide

The daemon normalises Claude transcripts server-side (`crates/fractal-store/src/external_sessions.rs:1483-1560`). Anything it can't place becomes a role-`system` `content` entry whose text starts with `` [unrecognized claude <what> `<kind>`] `` followed by raw JSON. Examples are hook summaries, `turn_duration`, `total_tokens_reminder` and `api-request-blob` (which carries system reminders).

fractal-web only hides the `omp` form of these (`src/conversation/fromTimeline.ts:115`), so **the Claude ones currently show up as visible system text there**. Polychrome should hide all of these:

- turn headers: a `message` with neither `from` nor `to`
- `truncation`, `usage`, and `status` entries (fold `status` into a single "working" indicator)
- `tool_result` entries, which are shown inside their `tool_call` instead
- content whose blocks are `internal` or `hidden-by-harness`, and `source_record` blocks
- any text starting with `[unrecognized `
- inside user or system text: `<system-reminder>…</system-reminder>`, `<channel…>`, `<smalltalk-message…>` and `[PING from st3] …` copies of mail already shown (`semantics.ts:63-91`)

Keep these visible:
- user and assistant text
- `message` mail
- tool calls, collapsed to one line
- `[reasoning]`, collapsed
- "Conversation compacted", shown as a quiet divider

## 4. @fractal/ui: what's worth reusing

The kit is styled with StyleX (with some Tailwind v4 in `kit.tsx`) and ships raw TSX.

- `Transcript` and `EmbraceComposer` are what fractal-web uses (`src/web/ConversationPane.tsx`). Both need the assistant-ui runtime, `effect`, and fractal-web's own turn and work-log view models. Too heavy for a blank slate.
- **The smallest useful set is `Markdown`** (`assistant-ui/composition/Markdown.tsx`): `{text, streaming?}`, built on react-markdown, remark-gfm and refractor, with no runtime needed. Reusing it still means adding the StyleX compiler (`@stylexjs/unplugin` 0.19.0) and its theme tokens.
- No agent picker exists. `AgentRow` is tied to the sidebar data model.

## 5. Depending on the packages from outside the monorepo

None of the three packages is published or built. All are `private`, and their `exports` point at `.ts` or `.tsx` source.

- Use `"@fractal/client": "link:./reference/fractal/clients/typescript/fractal-client"` and `"@fractal/sdk": "link:./reference/fractal/packages/fractal-sdk"`.
- Add `effect@4.0.0` and React 19.2.3 to Polychrome, pinned to the same versions.
- Vite settings:
  - `resolve.dedupe: ['react','react-dom','effect']`
  - `server.fs.allow` covering `reference/fractal`
- TypeScript settings: `moduleResolution: "Bundler"` and `allowImportingTsExtensions`.
- The generated files (`Schema.generated.ts`, `Client.generated.ts`, `Models.generated.ts`) are committed, so there's nothing to build.
- `@fractal/sdk` declares `@fractal/client` as `workspace:^`. pnpm won't resolve that outside the Fractal workspace, so Polychrome must provide the client itself through the link above. **Check this first.**
- If Polychrome uses `@fractal/ui`, it also needs `link:`, the StyleX plugin, and `@stylexjs/stylex` deduped.

## 6. Build plan: conversation slice

1. **Scaffold:** Vite 8, React 19, TypeScript, with `@fractal/client` and `@fractal/sdk` linked as in §5. One command: `pnpm dev`.
2. **Gateway:** a small Vite dev-server proxy in Polychrome. It sends `/v1/client/*`, HTTP and WebSocket, to the daemon's unix socket and attaches a bearer read from a chmod-600 file outside the repo. This is the same pattern as `vite-gateway.mjs`, written ourselves rather than importing fractal-web's server. The bearer comes from a one-time `st devices pair … --full-control`.
3. **Data:**
   - one `St3Live` runtime
   - `readAgents` for the agent list
   - `followConversation(agentRef)` folded into a list of entries
   - `capabilities` read for the `messageSend` grant
   - `messageSend` with an optimistic row and echo retirement
4. **Filter:** one pure function, `visibleEntries(entries)`, implementing §3, with unit tests on fixture entries.
5. **UI** (campsite-design):
   - an agent picker, a plain list
   - a thread: text, mail, collapsed tool calls, a working indicator
   - a composer
   - when sending isn't granted, the composer is replaced by one plain sentence saying why and how to grant it
6. **Proof:** screenshots in `docs/screenshots/`.

**Decisions for approval:**
- (a) Bearer-proxy auth as above, or proxy to the daemon-served cookie session instead.
- (b) Render Markdown with `@fractal/ui`'s `Markdown`, which brings in StyleX, or with react-markdown directly. I recommend react-markdown directly for slice 1.
