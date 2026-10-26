import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { polychromeGateway } from './scripts/gateway.mjs'

export default defineConfig({
  plugins: [react(), polychromeGateway()],
  // The Fractal packages are linked TypeScript source under reference/, so their bare imports
  // resolve up to this app's node_modules; dedupe keeps one copy of each runtime.
  resolve: { dedupe: ['react', 'react-dom', 'effect'] },
  // Only this app's page is an entry; reference/ and design worktrees hold other apps' HTML.
  optimizeDeps: { entries: ['index.html'] },
  server: {
    host: '127.0.0.1',
    port: 5199,
    strictPort: true,
    watch: { ignored: ['**/reference/fractal/apps/**', '**/.worktrees/**'] },
  },
  test: { include: ['src/**/*.test.ts'] },
})
