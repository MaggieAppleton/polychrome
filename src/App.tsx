import { useEffect, useState } from 'react'
import { readAgents, type Agent } from './fractal.ts'
import { Conversation } from './Conversation.tsx'

type Connection = { state: 'checking' } | { state: 'ready' } | { state: 'blocked'; reason: string }

// The gateway answers before the SDK opens a socket, so its refusals become plain sentences.
const checkConnection = async (): Promise<Connection> => {
  const res = await fetch('/v1/client/capabilities').catch(() => undefined)
  if (res?.ok) return { state: 'ready' }
  const code = res === undefined ? 'daemon-unreachable' : ((await res.json().catch(() => ({}))) as { code?: string }).code
  if (code === 'not-paired')
    return { state: 'blocked', reason: 'Polychrome is not paired with Fractal yet. Run st devices pair polychrome --as person/NAME --full-control, then pnpm pair with the pairing ID.' }
  if (code === 'daemon-unreachable') return { state: 'blocked', reason: 'The Fractal daemon is not running. Start it with st service start.' }
  return { state: 'blocked', reason: 'Fractal refused this device. Its pairing may have expired or been revoked; pair it again.' }
}

const selectedFromHash = () => decodeURIComponent(window.location.hash.slice(1)) || undefined

export function App() {
  const [connection, setConnection] = useState<Connection>({ state: 'checking' })
  const [agents, setAgents] = useState<readonly Agent[]>([])
  const [selected, setSelected] = useState(selectedFromHash)

  useEffect(() => {
    checkConnection().then((next) => {
      setConnection(next)
      if (next.state === 'ready') readAgents().then(setAgents, () => setConnection({ state: 'blocked', reason: 'The agent list could not be read.' }))
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
  const agent = agents.find((a) => a.id === selected)

  return (
    <div className="app">
      <nav className="agents" aria-label="Agents">
        {agents.map((a) => (
          <button key={a.id} className="agent" aria-current={a.id === selected} onClick={() => a.id && choose(a.id)}>
            {a.name}
          </button>
        ))}
      </nav>
      {agent?.id ? <Conversation key={agent.id} agentId={agent.id} name={agent.name} /> : <p className="notice">Choose an agent.</p>}
    </div>
  )
}
