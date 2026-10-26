# Polychrome

A minimal web client for one Fractal conversation, built on `@fractal/sdk` and `@fractal/client` (linked from `reference/fractal`).

## Run

```sh
pnpm install
pnpm dev            # http://127.0.0.1:5199
```

The first time, pair this device with Fractal (once per 30 days):

```sh
st devices pair polychrome --as person/NAME --full-control
pnpm pair pairing/ID   # asks for the code; stores the credential in ~/.config/polychrome
```

Without `--full-control` the app can read conversations but not send to them.

## How it fits together

- `scripts/gateway.mjs`: a dev-only Vite middleware.
  - It forwards `/v1/client/*`, over both HTTP and WebSocket, to st's paired client socket.
  - It attaches the bearer itself, so the browser never holds it.
  - It only admits requests from this loopback dev server.
- `src/fractal.ts`: one `St3Live` SDK runtime. It reads the agent list, follows one conversation, checks the `message.send` grant and sends messages.
- `src/thread.ts`: turns timeline entries into what the thread shows.
  - It hides Claude bookkeeping: unrecognized entries, internal blocks, system reminders, delivery copies, usage, status and truncation.
  - It gathers tool calls and thinking into one line between pieces of prose. Tests are in `thread.test.ts`.
- `docs/survey.md`: the research behind this.
- `docs/screenshots/`: screenshots of the app.
