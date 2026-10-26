import { DateTime } from 'effect'
import { describe, expect, it } from 'vitest'
import { CURSOR_LIFE_MS, fold, messageIdOf, ordered, pageBefore, withOlder, type Entry, type TimelinePage } from './timeline.ts'

const entry = (id: string, at: string, revision = 1, type = 'content') =>
  ({ id, sequence: 0, revision, type, role: 'user', timestamp: DateTime.makeUnsafe(at), body: {} }) as unknown as Entry
const ids = (byId: ReadonlyMap<string, Entry>) => ordered(byId).map((e) => `${e.id}@${e.revision}`)

describe('fold', () => {
  it('starts over on replace and merges otherwise', () => {
    const first = fold(new Map(), { replace: true, entries: [entry('a', '2026-10-26T10:00:00Z')] })
    const merged = fold(first, { replace: false, entries: [entry('b', '2026-10-26T10:01:00Z')] })
    const replaced = fold(merged, { replace: true, entries: [entry('c', '2026-10-26T10:02:00Z')] })
    expect(ids(merged)).toEqual(['a@1', 'b@1'])
    expect(ids(replaced)).toEqual(['c@1'])
  })

  it('keeps the higher revision of an entry', () => {
    const v2 = fold(new Map(), { replace: true, entries: [entry('a', '2026-10-26T10:00:00Z', 2)] })
    expect(ids(fold(v2, { replace: false, entries: [entry('a', '2026-10-26T10:00:00Z', 1)] }))).toEqual(['a@2'])
    expect(ids(fold(v2, { replace: false, entries: [entry('a', '2026-10-26T10:00:00Z', 3)] }))).toEqual(['a@3'])
  })
})

describe('ordered', () => {
  it('places mail that leads a page by its time, keeping delivery order on ties', () => {
    const page = fold(new Map(), {
      replace: true,
      entries: [
        entry('mail', '2026-10-26T13:48:00Z'),
        entry('turn-1', '2026-10-26T13:45:00Z'),
        entry('turn-2', '2026-10-26T13:45:00Z'),
        entry('turn-3', '2026-10-26T13:50:00Z'),
      ],
    })
    expect(ids(page)).toEqual(['turn-1@1', 'turn-2@1', 'mail@1', 'turn-3@1'])
  })
})

describe('messageIdOf', () => {
  it('names mail by the first 16 hex digits of SHA-256 of the key', async () => {
    // sha256("abc") = ba7816bf8f01cfea…
    expect(await messageIdOf('abc')).toBe('message/ba7816bf8f01cfea')
  })
})

describe('pageBefore', () => {
  const page = (ids: string[], at: string, hasMore: boolean, cursor?: string): TimelinePage => ({
    entries: ids.map((id) => entry(id, at)),
    hasMore,
    ...(cursor ? { cursor } : {}),
  })

  it('continues from a fresh cursor', async () => {
    const reads: (string | undefined)[] = []
    const read = async (c?: string) => (reads.push(c), page(['x'], '2026-10-26T09:00:00Z', true, 'c2'))
    await pageBefore(read, { value: 'c1', at: 1000 }, entry('a', '2026-10-26T10:00:00Z'), 2000)
    expect(reads).toEqual(['c1'])
  })

  it('walks back from the newest page when st has discarded a fresh cursor', async () => {
    const reads: (string | undefined)[] = []
    const read = async (c?: string) => {
      reads.push(c)
      if (c === 'gone') throw Object.assign(new Error('expired'), { response: { code: 'page-cursor-expired' } })
      return page(['m'], '2026-10-26T09:00:00Z', false)
    }
    await pageBefore(read, { value: 'gone', at: 1000 }, entry('a', '2026-10-26T10:00:00Z'), 2000)
    expect(reads).toEqual(['gone', undefined])
  })

  it('walks back from the newest page when the cursor is stale, until a page reaches past the oldest', async () => {
    const pages: Record<string, TimelinePage> = {
      newest: page(['n'], '2026-10-26T12:00:00Z', true, 'p2'),
      p2: page(['m'], '2026-10-26T09:00:00Z', true, 'p3'),
    }
    const reads: (string | undefined)[] = []
    const read = async (c?: string) => (reads.push(c), pages[c ?? 'newest']!)
    const got = await pageBefore(read, { value: 'old', at: 0 }, entry('a', '2026-10-26T10:00:00Z'), CURSOR_LIFE_MS + 1)
    expect(reads).toEqual([undefined, 'p2'])
    expect(got.entries.map((e) => e.id)).toEqual(['m'])
  })
})

describe('withOlder', () => {
  it('adds older entries without replacing ones already held', () => {
    const held = fold(new Map(), { replace: true, entries: [entry('a', '2026-10-26T10:00:00Z', 3)] })
    const next = withOlder(held, [entry('a', '2026-10-26T10:00:00Z', 1), entry('z', '2026-10-26T08:00:00Z')])
    expect(ids(next)).toEqual(['z@1', 'a@3'])
  })
})
