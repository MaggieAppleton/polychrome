import { DateTime } from 'effect'
import type { ConversationChunk } from '@fractal/sdk/effect'

/** A decoded timeline entry, or one the contract codec could not decode. */
export type Entry = ConversationChunk['entries'][number]

/** Folds one chunk in: `replace` starts over, otherwise entries merge by id at the higher revision. */
export const fold = (byId: ReadonlyMap<string, Entry>, chunk: Pick<ConversationChunk, 'replace' | 'entries'>) => {
  const next = new Map(chunk.replace ? [] : byId)
  for (const entry of chunk.entries) {
    const held = next.get(entry.id)
    if (held === undefined || held.revision <= entry.revision) next.set(entry.id, entry)
  }
  return next
}

// Undecodable entries keep the wire's ISO string.
const at = ({ timestamp }: Entry) =>
  timestamp === undefined ? 0 : typeof timestamp === 'string' ? Date.parse(timestamp) : DateTime.toEpochMillis(timestamp)

/**
 * Mailbox and transcript entries use separate sequence spaces and a page can lead with newer mail,
 * so entries are ordered by time; the stable sort keeps st's delivery order on ties.
 */
export const ordered = (byId: ReadonlyMap<string, Entry>): readonly Entry[] => [...byId.values()].sort((a, b) => at(a) - at(b))

/** Ids of the mail the thread already shows. */
export const shownMessageIds = (entries: readonly Entry[]) =>
  new Set(entries.flatMap((e) => (e.type === 'message' ? [e.body.message_id] : [])))

/** st names sent mail `message/` + the first 16 hex digits of SHA-256(idempotency key). */
export const messageIdOf = async (idempotencyKey: string) => {
  const hash = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(idempotencyKey)))
  return `message/${[...hash.slice(0, 8)].map((b) => b.toString(16).padStart(2, '0')).join('')}`
}
