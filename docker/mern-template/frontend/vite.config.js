import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// Read the mapped host port written by DevPod after container launch.
// This lets HMR connect through the correct Docker-mapped port.
let clientPort
try {
  const ports = fs.readFileSync('/workspace/.devpod-ports', 'utf8')
  const match = ports.match(/FRONTEND_PORT=(\d+)/)
  if (match) clientPort = parseInt(match[1], 10)
} catch {
  // Not running inside DevPod — use defaults
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    hmr: clientPort ? { clientPort } : undefined,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
})
