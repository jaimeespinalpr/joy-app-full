import { spawn } from 'node:child_process'
import { readFile } from 'node:fs/promises'

const PREVIEW_URL = 'http://127.0.0.1:4173/'

function waitForReady(proc, timeoutMs = 15000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Preview server did not start in time.')), timeoutMs)

    const onData = (chunk) => {
      const text = String(chunk)
      if (text.includes('Local:') || text.includes('Network:')) {
        clearTimeout(timer)
        resolve()
      }
    }

    proc.stdout.on('data', onData)
    proc.stderr.on('data', onData)
    proc.on('exit', (code) => {
      clearTimeout(timer)
      reject(new Error(`Preview server exited early with code ${code}.`))
    })
  })
}

async function run() {
  const appSource = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')
  const requiredWiring = [
    "onStartSnakeGame={openSnakeGame}",
    "onStartFullTest={openFullTest}",
    "screen === 'snake'",
    "screen === 'full-test'",
  ]

  for (const marker of requiredWiring) {
    if (!appSource.includes(marker)) {
      throw new Error(`Missing game flow wiring marker: ${marker}`)
    }
  }

  const preview = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', '4173'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true,
  })

  try {
    await waitForReady(preview)
    const response = await fetch(PREVIEW_URL)
    const html = await response.text()

    if (!response.ok) {
      throw new Error(`Preview URL returned status ${response.status}.`)
    }

    if (!html.includes('Joy App Full')) {
      throw new Error('Preview loaded but expected app title was not found.')
    }

    console.log('Smoke games check passed.')
  } finally {
    preview.kill('SIGTERM')
  }
}

run().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
