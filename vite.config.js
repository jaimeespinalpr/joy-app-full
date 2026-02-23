import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // GitHub Pages serves this repo under /joy-app-full/
  base: command === 'build' ? '/joy-app-full/' : '/',
}))
