import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // allows external access
    port: 5173,
    strictPort: true,
    allowedHosts: ['cristi-unexhumed-britni.ngrok-free.dev'], // 👈 replace with your current ngrok host
    cors: true,
  },
})
