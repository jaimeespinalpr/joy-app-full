import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    // Build target can be GitHub Pages (/joy-app-full/) or Hostinger root (/)
    base:
      command !== 'build'
        ? '/'
        : env.DEPLOY_TARGET === 'github-pages'
          ? '/joy-app-full/'
          : '/',
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/firebase')) return 'firebase-vendor'
            if (id.includes('node_modules/lucide-react')) return 'icons-vendor'
            if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) {
              return 'react-vendor'
            }
          },
        },
      },
    },
  }
})
