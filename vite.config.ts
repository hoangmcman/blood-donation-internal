import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import vercel from 'vite-plugin-vercel'

export default defineConfig({
  plugins: [react(), vercel()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  },
  server: {
    port: process.env.PORT as unknown as number,
  },
})
