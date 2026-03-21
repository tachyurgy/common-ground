import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/common-ground/',
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
