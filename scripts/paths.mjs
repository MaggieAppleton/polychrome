import { homedir } from 'node:os'
import { join } from 'node:path'

export const CONFIG_DIR = join(homedir(), '.config', 'polychrome')
export const CREDENTIAL_FILE = join(CONFIG_DIR, 'credential')
export const KEY_FILE = join(CONFIG_DIR, 'device-key.der')
export const SOCKET = process.env.POLYCHROME_SOCKET ?? join(homedir(), '.local', 'state', 'st3', 'run', 'st3-client.sock')
