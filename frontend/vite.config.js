import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite' // <-- 1. Importeer de Tailwind plugin

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // <-- 2. Voeg de plugin toe
  ],
  server: {
    host: 'localhost',
    port: 5173,
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
})