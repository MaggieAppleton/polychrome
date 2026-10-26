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

/** One page of a session's timeline, newest first; `cursor` reads the page before it. */
export type TimelinePage = { readonly entries: readonly Entry[]; readonly hasMore: boolean; readonly cursor?: string }

/** st keeps a page cursor for five minutes; an older one starts again from the newest page. */
export const CURSOR_LIFE_MS = 240_000

/**
 * The page before `oldest`. A fresh cursor continues where the last page ended. Without one, pages
 * are read again from the newest until one reaches past `oldest`, so nothing between is skipped.
 */
export const pageBefore = async (
  read: (cursor?: string) => Promise<TimelinePage>,
  cursor: { readonly value: string; readonly at: number } | undefined,
  oldest: Entry | undefined,
  now = Date.now(),
): Promise<TimelinePage> => {
  if (cursor !== undefined && now - cursor.at < CURSOR_LIFE_MS) return read(cursor.value)
  let next: string | undefined
  // Bounded, so a very long session stops instead of reading forever.
  for (let hop = 0; hop < 50; hop++) {
    const page = await read(next)
    const reaches = oldest === undefined || page.entries.some((e) => at(e) < at(oldest))
    if (reaches || !page.hasMore || page.cursor === undefined) return page
    next = page.cursor
  }
  throw new Error('This session is too long to read further back.')
}

/** Adds an older page; entries already held win, since the live follow has their newest revision. */
export const withOlder = (byId: ReadonlyMap<string, Entry>, page: readonly Entry[]) => {
  const next = new Map(byId)
  for (const entry of page) if (!next.has(entry.id)) next.set(entry.id, entry)
  return next
}
