// Completes a pairing begun with `st devices pair polychrome --as person/NAME --full-control`
// and stores the bearer where the dev proxy reads it. Usage: pnpm pair pairing/ID
import { generateKeyPairSync } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { request } from 'node:http'
import { createInterface } from 'node:readline'
import { CONFIG_DIR, CREDENTIAL_FILE, KEY_FILE, SOCKET } from './paths.mjs'

const pairingId = process.argv[2]
if (!pairingId?.startsWith('pairing/')) {
  console.error('Usage: pnpm pair pairing/ID')
  process.exit(1)
}

const askHidden = (prompt) =>
  new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true })
    rl._writeToOutput = (s) => { if (s.includes(prompt)) rl.output.write(s) }
    rl.question(prompt, (answer) => { rl.close(); process.stdout.write('\n'); resolve(answer.trim()) })
  })

const post = (path, body) =>
  new Promise((resolve, reject) => {
    const req = request(
      { socketPath: SOCKET, path, method: 'POST', headers: { host: '127.0.0.1', 'content-type': 'application/json' } },
      (res) => {
        let text = ''
        res.on('data', (chunk) => (text += chunk))
        res.on('end', () => resolve({ status: res.statusCode, json: JSON.parse(text) }))
      },
    )
    req.on('error', reject)
    req.end(JSON.stringify(body))
  })

const code = await askHidden('Pairing code: ')
const { publicKey, privateKey } = generateKeyPairSync('ec', { namedCurve: 'P-256' })
// Device public keys are `p256:` + base64url of the uncompressed SEC1 point (docs/st3/device-signing.md).
const point = publicKey.export({ format: 'jwk' })
const sec1 = Buffer.concat([Buffer.from([4]), Buffer.from(point.x, 'base64url'), Buffer.from(point.y, 'base64url')])

const { status, json } = await post(`/v1/client/pairings/${pairingId.replace(/^pairing\//, '')}/complete`, {
  api_version: 'st3.client.v0',
  code,
  device_public_key: `p256:${sec1.toString('base64url')}`,
  key_storage: 'software',
})
if (status !== 200) {
  console.error(`Pairing refused (${status}): ${json.message ?? json.code}`)
  process.exit(1)
}

mkdirSync(CONFIG_DIR, { recursive: true, mode: 0o700 })
writeFileSync(KEY_FILE, privateKey.export({ format: 'der', type: 'pkcs8' }), { mode: 0o600 })
writeFileSync(CREDENTIAL_FILE, json.value.credential, { mode: 0o600 })
const sends = json.value.scopes.includes('control.messages') ? 'can send messages' : 'cannot send messages (pair with --full-control)'
console.log(`Paired as ${json.value.person_id} until ${json.value.expires_at}; this device ${sends}.`)
