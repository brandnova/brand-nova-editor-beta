import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    manifest: true,
    outDir: '../static/dist',
    rollupOptions: {
      input: {
        main: './src/main.jsx',
      },
    },
  },
  server: {
    origin: 'http://localhost:5173',
  },
})
