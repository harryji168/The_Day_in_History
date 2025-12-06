import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: './', // Output to current directory
    emptyOutDir: false, // IMPORTANT: Don't delete source files!
    chunkSizeWarningLimit: 2000,
  }
})