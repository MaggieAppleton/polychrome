// Dev-only gateway: forwards /v1/client/* (HTTP and WebSocket) from the Vite origin to st's paired
// client socket, attaching the bearer from `pnpm pair`. The browser never sees the credential.
import { existsSync, readFileSync } from 'node:fs'
import { request } from 'node:http'
import { connect } from 'node:net'
import { CREDENTIAL_FILE, SOCKET } from './paths.mjs'

const PREFIX = '/v1/client/'
const DROP = new Set(['authorization', 'cookie', 'host', 'origin', 'referer'])

const credential = () => (existsSync(CREDENTIAL_FILE) ? readFileSync(CREDENTIAL_FILE, 'utf8').trim() : undefined)

// Loopback only, and a browser Origin (if any) must be this dev server. Browsers omit Origin on
// no-cors GETs from other sites (<img>, <script>), so Sec-Fetch-Site, when sent, must say same-origin.
const admitted = (req, port) => {
  const host = req.headers.host ?? ''
  if (host !== `127.0.0.1:${port}` && host !== `localhost:${port}`) return false
  const site = req.headers['sec-fetch-site']
  if (site !== undefined && site !== 'same-origin' && site !== 'none') return false
  const origin = req.headers.origin
  return origin === undefined ? !req.headers.upgrade : origin === `http://${host}`
}

// The path the daemon will see, with `..` resolved, so the prefix check can't be walked out of.
const clientPath = (url) => {
  try {
    const { pathname, search } = new URL(url ?? '/', 'http://gateway')
    return pathname.startsWith(PREFIX) ? pathname + search : undefined
  } catch {
    return undefined // unparseable, so never forwarded
  }
}

const forwardHeaders = (headers, bearer) => {
  const out = { host: '127.0.0.1', authorization: `Bearer ${bearer}` }
  for (const [name, value] of Object.entries(headers)) if (!DROP.has(name)) out[name] = value
  return out
}

const refuse = (res, status, code, message) => {
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify({ code, message }))
}

export function polychromeGateway() {
  return {
    name: 'polychrome:gateway',
    apply: 'serve',
    configureServer(vite) {
      const port = () => vite.httpServer?.address()?.port

      vite.middlewares.use((req, res, next) => {
        const path = clientPath(req.url)
        if (path === undefined) return next()
        if (!admitted(req, port())) return refuse(res, 403, 'forbidden', 'Only this dev server may use the gateway.')
        const bearer = credential()
        if (bearer === undefined) return refuse(res, 401, 'not-paired', 'Polychrome is not paired with Fractal yet.')
        const upstream = request(
          { socketPath: SOCKET, path, method: req.method, headers: forwardHeaders(req.headers, bearer) },
          (answer) => {
            res.writeHead(answer.statusCode ?? 502, answer.headers)
            answer.pipe(res)
          },
        )
        upstream.on('error', () => refuse(res, 502, 'daemon-unreachable', 'The Fractal daemon is not running.'))
        req.pipe(upstream)
      })

      vite.httpServer?.on('upgrade', (req, socket, head) => {
        const path = clientPath(req.url)
        if (path === undefined) return
        const bearer = credential()
        if (!admitted(req, port()) || bearer === undefined) return socket.destroy()
        const upstream = connect(SOCKET, () => {
          const headers = forwardHeaders(req.headers, bearer)
          const lines = Object.entries(headers).flatMap(([k, v]) => (Array.isArray(v) ? v : [v]).map((x) => `${k}: ${x}`))
          upstream.write(`GET ${path} HTTP/1.1\r\n${lines.join('\r\n')}\r\n\r\n`)
          if (head.length > 0) upstream.write(head)
          upstream.pipe(socket)
          socket.pipe(upstream)
        })
        upstream.on('error', () => socket.destroy())
        socket.on('error', () => upstream.destroy())
      })
    },
  }
}
