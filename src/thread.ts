import type { Entry } from './timeline.ts'

/** What the thread shows; everything else in the timeline is bookkeeping. */
export type Row =
  | { readonly kind: 'text'; readonly id: string; readonly role: 'user' | 'assistant' | 'system'; readonly text: string; readonly from?: string }
  // One run of tool calls and thinking between pieces of prose.
  | { readonly kind: 'work'; readonly id: string; readonly tools: readonly string[]; readonly failed: number; readonly thinking: readonly string[] }
  | { readonly kind: 'divider'; readonly id: string; readonly text: string }

export type Thread = { readonly rows: readonly Row[]; readonly working: boolean }

type Mutable<T> = { -readonly [K in keyof T]: T[K] extends readonly (infer U)[] ? U[] : T[K] }
// A work row while it is still gathering tool calls and thinking.
type Work = Mutable<Extract<Row, { kind: 'work' }>>

// Notes the Claude harness injects into a turn for the model, not for people.
const HARNESS_NOTES = /<(system-reminder|task-notification)>[\s\S]*?<\/\1>/g
// Copies of mail the harness injects into a Claude turn; the mail itself arrives as a message entry.
const DELIVERY = /<channel\b[\s\S]*?<\/channel>|<smalltalk-message\b[\s\S]*?<\/smalltalk-message>|^\[PING from st3\] message\/.*$/gm
const REASONING = '[reasoning]\n'

// `mcp__plugin_x__browser_click` reads as `browser_click`.
const toolName = (name: string) => name.split('__').pop() || name

const hiddenBlocks = (entry: Extract<Entry, { type: 'content' }>) =>
  entry.body.blocks?.some((b) => b.kind !== 'source_record' && (b.visibility === 'internal' || b.visibility === 'hidden-by-harness')) ?? false

/** Strips harness bookkeeping from prose; undefined when nothing a person wrote remains. */
const cleanText = (text: string): string | undefined => {
  const clean = text.replace(HARNESS_NOTES, '').replace(DELIVERY, '').trim()
  return clean === '' ? undefined : clean
}

export const toThread = (entries: readonly Entry[]): Thread => {
  const rows: Row[] = []
  const results = new Map<string, boolean>()
  let from: string | undefined
  let working = false

  // The work row still gathering; any other row ends it.
  let run: Work | undefined
  const work = (id: string) => {
    if (run === undefined) {
      run = { kind: 'work', id, tools: [], failed: 0, thinking: [] }
      rows.push(run)
    }
    return run
  }

  for (const entry of entries) {
    if (entry.type === 'tool_result') results.set(entry.body.call_id, entry.body.status === 'error')
  }

  for (const entry of entries) {
    switch (entry.type) {
      case 'status':
        working = entry.body.status === 'running' || entry.body.status === 'queued'
        continue
      case 'message':
        // A message with neither sender nor recipient is the harness's turn header.
        if (entry.body.from !== undefined || entry.body.to !== undefined) from = entry.body.from
        continue
      case 'tool_call': {
        const run = work(entry.id)
        run.tools.push(toolName(entry.body.name))
        if (results.get(entry.body.call_id)) run.failed++
        continue
      }
      case 'content': {
        const raw = entry.body.text ?? ''
        if (hiddenBlocks(entry) || raw.startsWith('[unrecognized ')) continue
        if (raw === 'Conversation compacted') {
          rows.push({ kind: 'divider', id: entry.id, text: 'Conversation compacted' })
          run = undefined
          continue
        }
        if (entry.role === 'assistant' && raw.startsWith(REASONING)) {
          const thought = raw.slice(REASONING.length).trim()
          if (thought !== '') work(entry.id).thinking.push(thought)
          continue
        }
        const text = cleanText(raw)
        if (text === undefined || entry.role === 'tool') continue
        rows.push({ kind: 'text', id: entry.id, role: entry.role, text, ...(from === undefined ? {} : { from }) })
        from = undefined
        run = undefined
        continue
      }
      default:
        // tool_result joins its call; usage, truncation, redaction, error and undecodable entries are bookkeeping.
        continue
    }
  }
  return { rows, working }
}
