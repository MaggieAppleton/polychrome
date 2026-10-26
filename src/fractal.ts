import type { CollectionSocket, CollectionSocketFactory } from '@fractal/client'
import { St3, St3Live, type ConversationChunk, type DecodedAgent } from '@fractal/sdk/effect'
import { DateTime, Effect, Fiber, ManagedRuntime, Stream } from 'effect'

/** A decoded timeline entry, or one the contract codec could not decode. */
export type Entry = ConversationChunk['entries'][number]
export type Agent = DecodedAgent

// The browser's WebSocket behind the client's socket surface; the dev gateway adds the bearer.
const browserSocket: CollectionSocketFactory = (url, protocols) => {
  const socket = new WebSocket(url, protocols)
  const wrapped: CollectionSocket = {
    onopen: null,
    onmessage: null,
    onclose: null,
    onerror: null,
    send: (data) => socket.send(data),
    close: (code, reason) => (code === 1001 ? socket.close() : socket.close(code, reason)),
  }
  socket.onopen = () => wrapped.onopen?.()
  socket.onmessage = (event) => wrapped.onmessage?.({ data: event.data })
  socket.onclose = (event) => wrapped.onclose?.({ code: event.code, reason: event.reason })
  socket.onerror = (event) => wrapped.onerror?.(event)
  return wrapped
}

const runtime = ManagedRuntime.make(
  St3Live({ baseUrl: window.location.origin, client: 'polychrome', maxFollows: 8, socket: browserSocket }),
)

export const readAgents = () =>
  runtime.runPromise(Effect.gen(function* () {
    return (yield* (yield* St3).readAgents).value
  }))

/** Whether this device's pairing holds the `message.send` action. */
export const canSend = () =>
  runtime.runPromise(
    Effect.gen(function* () {
      const caps = yield* (yield* St3).capabilities
      return caps.capabilities.some((c) => c.id === 'message.send' && c.state === 'granted')
    }),
  )

export type ConversationState = { entries: readonly Entry[]; live: boolean }

// Undecodable entries keep the wire's ISO string.
const at = ({ timestamp }: Entry) =>
  timestamp === undefined ? 0 : typeof timestamp === 'string' ? Date.parse(timestamp) : DateTime.toEpochMillis(timestamp)

/**
 * Follows one agent's conversation: `replace` resets, otherwise entries merge by id at the higher
 * revision. Mailbox and transcript entries use separate sequence spaces and a page can lead with
 * newer mail, so entries are ordered by time; the stable sort keeps st's delivery order on ties.
 */
export const followConversation = (ref: string, onChange: (state: ConversationState) => void) => {
  let byId = new Map<string, Entry>()
  const publish = (live: boolean) => onChange({ entries: [...byId.values()].sort((a, b) => at(a) - at(b)), live })
  const fiber = runtime.runFork(
    Effect.gen(function* () {
      const st3 = yield* St3
      yield* Stream.runForEach(st3.followConversation({ _tag: 'Conversation', ref }), (event) =>
        Effect.sync(() => {
          if (event._tag !== 'Observed') return publish(false)
          if (event.value.replace) byId = new Map()
          for (const entry of event.value.entries) {
            const held = byId.get(entry.id)
            if (held === undefined || held.revision <= entry.revision) byId.set(entry.id, entry)
          }
          publish(true)
        }),
      )
    }),
  )
  return () => {
    runtime.runFork(Fiber.interrupt(fiber))
  }
}

/** Sends `content` to an agent; resolves with a reason when the daemon does not accept it. */
export const sendMessage = (to: string, content: string) =>
  runtime.runPromise(
    Effect.gen(function* () {
      const st3 = yield* St3
      const snapshot = yield* st3.snapshot
      return yield* st3.messageSend({
        id: `action/${crypto.randomUUID()}`,
        idempotency_key: crypto.randomUUID(),
        fence: { snapshot_id: snapshot, subject_revisions: {} },
        parameters: { to, content, kind: 'wake', attachments: [] },
      })
    }).pipe(
      Effect.map((result) => (result.status === 'rejected' ? 'The daemon rejected this message.' : undefined)),
      Effect.catch((failure) => Effect.succeed(failure.message ?? 'The message could not be sent.')),
    ),
  )
