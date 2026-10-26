import { useEffect, useMemo, useRef, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { canSend, followConversation, sendMessage, type ConversationState } from './fractal.ts'
import { toThread, type Row } from './thread.ts'

const NOT_GRANTED =
  'This device can read but not send. Pair it with --full-control to send messages: st devices pair polychrome --as person/NAME --full-control, then pnpm pair.'

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
            <Markdown remarkPlugins={[remarkGfm]}>{row.text}</Markdown>
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
            <Markdown remarkPlugins={[remarkGfm]}>{row.thinking.join('\n\n')}</Markdown>
          </div>
        </details>
      )
    }
    case 'divider':
      return <p className="divider">{row.text}</p>
  }
}

export function Conversation({ agentId, name }: { agentId: string; name: string }) {
  const [state, setState] = useState<ConversationState>({ entries: [], live: false })
  const [granted, setGranted] = useState<boolean>()
  const [draft, setDraft] = useState('')
  const [pending, setPending] = useState<readonly { text: string; error?: string }[]>([])
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => followConversation(agentId, setState), [agentId])
  useEffect(() => {
    canSend().then(setGranted, () => setGranted(false))
  }, [])

  const thread = useMemo(() => toThread(state.entries), [state.entries])
  // A sent message stays as pending until its echo arrives in the thread.
  const shown = useMemo(() => new Set(thread.rows.flatMap((r) => (r.kind === 'text' ? [r.text] : []))), [thread])
  const outbox = pending.filter((p) => p.error !== undefined || !shown.has(p.text))

  useEffect(() => {
    end.current?.scrollIntoView({ block: 'end' })
  }, [thread.rows.length, outbox.length])

  const send = async () => {
    const text = draft.trim()
    if (text === '') return
    setDraft('')
    setPending((p) => [...p, { text }])
    const error = await sendMessage(agentId, text)
    if (error !== undefined) setPending((p) => p.map((x) => (x.text === text ? { text, error } : x)))
  }

  return (
    <main className="conversation">
      <header className="title">
        <h2>{name}</h2>
        <span className="status">{!state.live ? 'Connecting' : thread.working ? 'Working' : ''}</span>
      </header>
      <div className="thread">
        {state.live && thread.rows.length === 0 && <p className="notice">No messages yet.</p>}
        {thread.rows.map((row) => <RowView key={row.id} row={row} name={name} />)}
        {outbox.map((p, i) => (
          <article key={i} className="message user pending">
            <h3 className="author">You</h3>
            <div className="prose"><p>{p.text}</p></div>
            <p className={p.error ? 'quiet failed' : 'quiet'}>{p.error ?? 'Sending'}</p>
          </article>
        ))}
        <div ref={end} />
      </div>
      {granted === false && <p className="composer notice">{NOT_GRANTED}</p>}
      {granted === true && (
        <form className="composer" onSubmit={(e) => { e.preventDefault(); void send() }}>
          <textarea
            value={draft}
            rows={1}
            placeholder={`Message ${name}`}
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
