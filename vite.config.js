import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // Build target can be GitHub Pages (/joy-app-full/) or Hostinger root (/)
  base:
    command !== 'build'
      ? '/'
      : process.env.DEPLOY_TARGET === 'github-pages'
        ? '/joy-app-full/'
        : '/',
}))
