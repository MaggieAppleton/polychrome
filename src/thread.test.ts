import { describe, expect, it } from 'vitest'
import type { Entry } from './timeline.ts'
import { toThread } from './thread.ts'

let seq = 0
const entry = (type: string, role: string, body: object) =>
  ({ id: `timeline-entry/s/${++seq}`, sequence: seq, revision: 1, final: true, role, type, body }) as unknown as Entry
const content = (role: string, text: string, blocks?: object[]) =>
  entry('content', role, { media_type: 'text/plain', text, ...(blocks ? { blocks } : {}) })

describe('toThread', () => {
  it('keeps what people and the agent wrote', () => {
    const { rows } = toThread([content('user', 'hello'), content('assistant', 'hi there')])
    expect(rows.map((r) => r.kind === 'text' && r.text)).toEqual(['hello', 'hi there'])
  })

  it('hides Claude bookkeeping the daemon could not classify', () => {
    const { rows } = toThread([
      content('system', '[unrecognized claude system `turn_duration`]\n{"ms":12}'),
      content('system', '[unrecognized claude attachment `total_tokens_reminder`]\n{}'),
      content('system', 'visible', [{ id: 'b', kind: 'text', source_type: 'x', payload: {}, visibility: 'internal' }]),
      entry('usage', 'system', { input_tokens: 1 }),
      entry('truncation', 'system', {}),
      entry('message', 'user', { message_id: 'native-1' }),
    ])
    expect(rows).toEqual([])
  })

  it('strips system reminders and delivery copies, dropping turns left empty', () => {
    const { rows } = toThread([
      content('user', '<system-reminder>be brief</system-reminder>\nWhat changed?'),
      content('user', '<task-notification>\n<task-id>b1</task-id>\n<status>failed</status>\n</task-notification>'),
      content('user', '<channel source="st">\n<smalltalk-message id="1">ping</smalltalk-message>\n</channel>'),
    ])
    expect(rows).toEqual([expect.objectContaining({ kind: 'text', text: 'What changed?' })])
  })

  it('labels mail with its sender', () => {
    const { rows } = toThread([
      entry('message', 'user', { message_id: 'message/1', from: 'person/maggie', to: 'agent/a' }),
      content('user', 'Please start'),
    ])
    expect(rows).toEqual([expect.objectContaining({ text: 'Please start', from: 'person/maggie' })])
  })

  it('gathers a run of tool calls and thinking into one row, folding results into their call', () => {
    const thread = toThread([
      content('assistant', '[reasoning]\nLook first'),
      entry('tool_call', 'assistant', { call_id: 'c1', name: 'Bash', arguments: {} }),
      entry('tool_result', 'tool', { call_id: 'c1', content: 'x', media_type: 'text/plain', status: 'error' }),
      entry('tool_call', 'assistant', { call_id: 'c2', name: 'mcp__plugin_pw__browser_click', arguments: {} }),
      entry('status', 'system', { status: 'running' }),
    ])
    expect(thread.rows).toEqual([
      expect.objectContaining({ kind: 'work', tools: ['Bash', 'browser_click'], failed: 1, thinking: ['Look first'] }),
    ])
    expect(thread.working).toBe(true)
  })
})
