import { useEffect, useMemo, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { followConversation, sendMessage, type ConversationState } from './fractal.ts'
import { PAIR_STEPS } from './pairing.ts'
import { toThread, type Row } from './thread.ts'
import { messageIdOf, shownMessageIds } from './timeline.ts'

const NOT_GRANTED = `This device can read but not send. To send messages, run ${PAIR_STEPS}.`

// Agent-written Markdown may not make the browser fetch remote images (a way to leak the thread).
const NO_IMAGES = ['img']

type Pending = { readonly key: string; readonly messageId: string; readonly text: string; readonly error?: string }

const author = (row: Extract<Row, { kind: 'text' }>, name: string) =>
  row.from?.replace(/^(person|agent)\//, '') ?? (row.role === 'assistant' ? name : row.role === 'user' ? 'Input' : 'System')

// `Bash, Edit ×2, Read` in first-use order.
const tally = (tools: readonly string[]) => {
  const counts = new Map<string, number>()
  for (const tool of tools) counts.set(tool, (counts.get(tool) ?? 0) + 1)
  return [...counts].map(([tool, n]) => (n > 1 ? `${tool} ×${n}` : tool)).join(', ')
}

function RowView({ row, name }: { row: Row; name: string }) {
  switch (row.kind) {
    case 'text':
      return (
        <article className={`message ${row.role}`}>
          <h3 className="author">{author(row, name)}</h3>
          <div className="prose">
            <Markdown remarkPlugins={[remarkGfm]} disallowedElements={NO_IMAGES}>{row.text}</Markdown>
          </div>
        </article>
      )
    case 'work': {
      const summary = (
        <>
          {tally(row.tools)}
          {row.failed > 0 && <span className="failed"> {row.failed} failed</span>}
        </>
      )
      if (row.thinking.length === 0) return <p className="quiet">{summary}</p>
      return (
        <details className="quiet">
          <summary>{summary}</summary>
          <div className="prose">
            <Markdown remarkPlugins={[remarkGfm]} disallowedElements={NO_IMAGES}>{row.thinking.join('\n\n')}</Markdown>
          </div>
        </details>
      )
    }
    case 'divider':
      return <p className="divider">{row.text}</p>
  }
}

export function Conversation({ agentId, name, granted }: { agentId: string; name: string; granted?: boolean }) {
  const [state, setState] = useState<ConversationState>({ entries: [], live: false })
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState<readonly Pending[]>([])
  const scroller = useRef<HTMLDivElement>(null)
  const atBottom = useRef(true)

  useEffect(() => followConversation(agentId, setState), [agentId])

  const thread = useMemo(() => toThread(state.entries), [state.entries])
  // A sent message stays as pending until mail with its id arrives in the thread.
  const shown = useMemo(() => shownMessageIds(state.entries), [state.entries])
  const outbox = pending.filter((p) => p.error !== undefined || !shown.has(p.messageId))

  // Follow new rows only while the reader is at the bottom.
  useEffect(() => {
    const el = scroller.current
    if (el && atBottom.current) el.scrollTop = el.scrollHeight
  }, [thread.rows.length, outbox.length])

  const send = async () => {
    const text = draft.trim()
    if (text === '') return
    setDraft('')
    atBottom.current = true
    const key = crypto.randomUUID()
    const sent: Pending = { key, messageId: await messageIdOf(key), text }
    setPending((p) => [...p, sent])
    const error = await sendMessage(agentId, text, key)
    if (error !== undefined) setPending((p) => p.map((x) => (x.key === key ? { ...x, error } : x)))
  }

  return (
    <main className="conversation">
      <header className="title">
        <h2>{name}</h2>
        <span className="status">{!state.live ? 'Connecting' : thread.working ? 'Working' : ''}</span>
      </header>
      <div
        className="thread"
        ref={scroller}
        onScroll={(e) => {
          const el = e.currentTarget
          atBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 32
        }}
      >
        {state.live && thread.rows.length === 0 && <p className="notice">No messages yet.</p>}
        {thread.rows.map((row) => <RowView key={row.id} row={row} name={name} />)}
        {outbox.map((p) => (
          <article key={p.key} className="message user pending">
            <h3 className="author">You</h3>
            <div className="prose"><p>{p.text}</p></div>
            <p className={p.error ? 'quiet failed' : 'quiet'}>{p.error ?? 'Sending'}</p>
          </article>
        ))}
      </div>
      {granted === false && <p className="composer notice">{NOT_GRANTED}</p>}
      {granted === true && (
        <form className="composer" onSubmit={(e) => { e.preventDefault(); void send() }}>
          <textarea
            value={draft}
            rows={1}
            placeholder="Message"
            onChange={(e) => setDraft(e.target.value)}
            // Insert pasted text ourselves: the browser starts but never completes a paste whose
            // Cmd+V is synthesised without a Cmd keydown (Superwhisper's auto-paste does this).
            onPaste={(e) => {
              const text = e.clipboardData.getData('text/plain')
              if (text === '') return
              e.preventDefault()
              const field = e.currentTarget
              field.setRangeText(text, field.selectionStart, field.selectionEnd, 'end')
              setDraft(field.value)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault()
                void send()
              }
            }}
          />
          <button type="submit" disabled={draft.trim() === ''}>Send</button>
        </form>
      )}
    </main>
  )
}
