import { FractalClient, type CollectionFrame, type CollectionSocket, type CollectionSocketFactory } from '@fractal/client'
import { decodeConversationChunk, St3, St3Live, type DecodedAgent } from '@fractal/sdk/effect'
import { Effect, Fiber, ManagedRuntime, Stream } from 'effect'
import { fold, ordered, pageBefore, withOlder, type Entry, type TimelinePage } from './timeline.ts'

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
    // Browsers throw on an application close with 1001 (going away); a bare close sends it.
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

export type ConversationState = {
  readonly entries: readonly Entry[]
  /** False while the socket reconnects. */
  readonly live: boolean
  /** True once the session's first entry is held, or when there is no session to page through. */
  readonly start: boolean
  readonly loadingOlder: boolean
  readonly olderFailed?: string
}

// Older pages come over HTTP; the SDK's live follow carries only the newest window.
const client = new FractalClient({ baseUrl: window.location.origin, fetchImpl: fetch.bind(window), client: 'polychrome' })
const OLDER_PAGE = 200

const readTimeline = (sessionId: string) => async (cursor?: string): Promise<TimelinePage> => {
  const { value } = await client.timelineList(sessionId, { limit: OLDER_PAGE, ...(cursor ? { cursor } : {}) })
  // Decoded as a frame, so older entries have the same shape as live ones.
  const frame = { kind: 'conversation', id: 'older', replace: false, has_more: value.page.has_more, items: value.items }
  const { entries } = decodeConversationChunk(frame as Extract<CollectionFrame, { kind: 'conversation' }>)
  return { entries, hasMore: value.page.has_more, ...(value.page.next_cursor ? { cursor: value.page.next_cursor } : {}) }
}

/**
 * Follows one agent's conversation. `loadOlder` reads the page before the oldest entry held; a
 * replace frame starts a new history, and pages requested before it are dropped.
 */
export const followConversation = (ref: string, sessionId: string | undefined, onChange: (state: ConversationState) => void) => {
  let byId: ReadonlyMap<string, Entry> = new Map()
  let live = false
  let history = 0
  let cursor: { value: string; at: number } | undefined
  let start = sessionId === undefined
  let loadingOlder = false
  let olderFailed: string | undefined
  const publish = () =>
    onChange({ entries: ordered(byId), live, start, loadingOlder, ...(olderFailed ? { olderFailed } : {}) })

  const fiber = runtime.runFork(
    Effect.gen(function* () {
      const st3 = yield* St3
      yield* Stream.runForEach(st3.followConversation({ _tag: 'Conversation', ref }), (event) =>
        Effect.sync(() => {
          live = event._tag === 'Observed'
          if (event._tag === 'Observed') {
            if (event.value.replace) {
              history++
              cursor = undefined
              start = sessionId === undefined || !event.value.hasMore
              loadingOlder = false
            }
            byId = fold(byId, event.value)
          }
          publish()
        }),
      )
    }),
  )

  const loadOlder = async () => {
    if (sessionId === undefined || start || loadingOlder) return
    const asked = history
    loadingOlder = true
    olderFailed = undefined
    publish()
    try {
      const page = await pageBefore(readTimeline(sessionId), cursor, ordered(byId)[0])
      if (asked !== history) return
      byId = withOlder(byId, page.entries)
      cursor = page.cursor === undefined ? undefined : { value: page.cursor, at: Date.now() }
      start = !page.hasMore
    } catch (cause) {
      if (asked !== history) return
      olderFailed = cause instanceof Error ? cause.message : 'Earlier messages could not be read.'
    }
    loadingOlder = false
    publish()
  }

  return {
    loadOlder,
    stop: () => {
      runtime.runFork(Fiber.interrupt(fiber))
    },
  }
}

/** Sends `content` to an agent; resolves with a reason when the daemon does not accept it. */
export const sendMessage = (to: string, content: string, idempotencyKey: string) =>
  runtime.runPromise(
    Effect.gen(function* () {
      const st3 = yield* St3
      const snapshot = yield* st3.snapshot
      return yield* st3.messageSend({
        id: `action/${crypto.randomUUID()}`,
        idempotency_key: idempotencyKey,
        fence: { snapshot_id: snapshot, subject_revisions: {} },
        parameters: { to, content, kind: 'wake', attachments: [] },
      })
    }).pipe(
      Effect.map((result) => (result.status === 'rejected' ? 'The daemon rejected this message.' : undefined)),
      Effect.catch((failure) => Effect.succeed(failure.message ?? 'The message could not be sent.')),
    ),
  )
