import { Option } from 'effect'
import { useEffect, useState } from 'react'
import { canSend, readAgents, type Agent } from './fractal.ts'
import { Conversation } from './Conversation.tsx'
import { PAIR_STEPS } from './pairing.ts'

type Connection = { state: 'checking' } | { state: 'ready' } | { state: 'blocked'; reason: string }

// The gateway answers before the SDK opens a socket, so its refusals become plain sentences.
const checkConnection = async (): Promise<Connection> => {
  const res = await fetch('/v1/client/capabilities').catch(() => undefined)
  if (res?.ok) return { state: 'ready' }
  const code = res === undefined ? 'daemon-unreachable' : ((await res.json().catch(() => ({}))) as { code?: string }).code
  if (code === 'not-paired') return { state: 'blocked', reason: `Polychrome is not paired with Fractal yet. Run ${PAIR_STEPS}.` }
  if (code === 'daemon-unreachable') return { state: 'blocked', reason: 'The Fractal daemon is not running. Start it with st service start.' }
  return { state: 'blocked', reason: 'Fractal refused this device. Its pairing may have expired or been revoked; pair it again.' }
}

const selectedFromHash = () => {
  try {
    return decodeURIComponent(window.location.hash.slice(1)) || undefined
  } catch {
    return undefined // a malformed hash selects nothing
  }
}

// `polychrome/quality/slice-1/design` shows its distinguishing tail in full and lets the prefix truncate.
function AgentName({ name }: { name: string }) {
  const cut = name.lastIndexOf('/')
  if (cut <= 0) return <span className="tail">{name}</span>
  return (
    <>
      <span className="prefix">{name.slice(0, cut + 1)}</span>
      <span className="tail">{name.slice(cut + 1)}</span>
    </>
  )
}

export function App() {
  const [connection, setConnection] = useState<Connection>({ state: 'checking' })
  const [agents, setAgents] = useState<readonly Agent[]>([])
  const [granted, setGranted] = useState<boolean>()
  const [selected, setSelected] = useState(selectedFromHash)

  useEffect(() => {
    checkConnection().then((next) => {
      setConnection(next)
      if (next.state !== 'ready') return
      readAgents().then(setAgents, () => setConnection({ state: 'blocked', reason: 'The agent list could not be read.' }))
      // The send grant belongs to the device, not to an agent, so it is read once.
      canSend().then(setGranted, () => setGranted(false))
    })
  }, [])

  // The hash is the selection, so Back and Forward move between agents.
  useEffect(() => {
    const sync = () => setSelected(selectedFromHash())
    window.addEventListener('hashchange', sync)
    return () => window.removeEventListener('hashchange', sync)
  }, [])

  const choose = (id: string) => {
    window.location.hash = encodeURIComponent(id)
  }

  if (connection.state === 'blocked') return <p className="notice">{connection.reason}</p>
  const agent = agents.find((a) => a.id === selected) ?? agents[0]

  return (
    <div className="app">
      <nav className="agents" aria-label="Agents">
        {agents.map((a) => (
          <button key={a.id} className="agent" title={a.name} aria-current={a.id === agent?.id} onClick={() => a.id && choose(a.id)}>
            <AgentName name={a.name} />
          </button>
        ))}
      </nav>
      {agent?.id && <Conversation key={agent.id} agentId={agent.id} sessionId={agent.current_session_id && Option.getOrUndefined(agent.current_session_id)} name={agent.name} granted={granted} />}
    </div>
  )
}
