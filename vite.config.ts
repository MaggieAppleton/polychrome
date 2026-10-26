import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
// @ts-expect-error plain ESM dev script
import { polychromeGateway } from './scripts/gateway.mjs'

export default defineConfig({
  plugins: [react(), polychromeGateway()],
  // The Fractal packages are linked TypeScript source under reference/, so their bare imports
  // resolve up to this app's node_modules; dedupe keeps one copy of each runtime.
  resolve: { dedupe: ['react', 'react-dom', 'effect'] },
  server: { host: '127.0.0.1', port: 5199, strictPort: true },
  test: { include: ['src/**/*.test.ts'] },
})
