import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  BookOpen,
  Calculator,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Lock,
  LogOut,
  Maximize2,
  MessageSquareText,
  Minimize2,
  Minus,
  Plus,
  RotateCcw,
  Sparkles,
  Star,
  Trophy,
  User,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { auth, db } from './firebase'

const INITIAL_QUESTION_COUNT = 25
const APP_DOMAIN = 'joyapp.student'

const SUBJECTS = [
  {
    id: 'math',
    name: 'Matematicas',
    description: 'Practica operaciones, retos y problemas paso a paso.',
    colorClass: 'subject-math',
    icon: Calculator,
    available: true,
  },
  {
    id: 'reading',
    name: 'Lectura',
    description: 'Comprension, vocabulario y mini retos de lectura.',
    colorClass: 'subject-reading',
    icon: BookOpen,
    available: false,
  },
  {
    id: 'language',
    name: 'Lenguaje',
    description: 'Ortografia, silabas y expresion escrita.',
    colorClass: 'subject-language',
    icon: MessageSquareText,
    available: false,
  },
]

const TESTS_BY_SUBJECT = {
  math: [
    {
      id: 'multiplication',
      name: 'Multiplicacion',
      description: 'Multiplicaciones para 3er grado con puntaje y refuerzo.',
      available: true,
      accentClass: 'test-multiplication',
      icon: X,
    },
    {
      id: 'addition',
      name: 'Suma',
      description: 'Proximamente: sumas por niveles y rapidez mental.',
      available: false,
      accentClass: 'test-addition',
      icon: Plus,
    },
    {
      id: 'subtraction',
      name: 'Resta',
      description: 'Proximamente: restas con y sin llevadas.',
      available: false,
      accentClass: 'test-subtraction',
      icon: Minus,
    },
    {
      id: 'word-problems',
      name: 'Problemas Verbales',
      description: 'Proximamente: lectura y resolucion de situaciones.',
      available: false,
      accentClass: 'test-word',
      icon: MessageSquareText,
    },
  ],
}

let audioCtx = null

function initAudio() {
  if (typeof window === 'undefined') return false

  if (!audioCtx) {
    const AudioContextCtor = window.AudioContext || window.webkitAudioContext
    if (!AudioContextCtor) return false
    audioCtx = new AudioContextCtor()
  }

  if (audioCtx.state === 'suspended') {
    void audioCtx.resume()
  }

  return true
}

function playSound(type, enabled) {
  if (!enabled) return
  if (!initAudio()) return

  const osc = audioCtx.createOscillator()
  const gainNode = audioCtx.createGain()

  osc.connect(gainNode)
  gainNode.connect(audioCtx.destination)

  const now = audioCtx.currentTime

  if (type === 'start') {
    osc.type = 'square'
    osc.frequency.setValueAtTime(440, now)
    osc.frequency.setValueAtTime(554.37, now + 0.09)
    osc.frequency.setValueAtTime(659.25, now + 0.18)
    osc.frequency.setValueAtTime(880, now + 0.27)
    gainNode.gain.setValueAtTime(0.001, now)
    gainNode.gain.linearRampToValueAtTime(0.14, now + 0.04)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.45)
    osc.start(now)
    osc.stop(now + 0.46)
    return
  }

  if (type === 'coin') {
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(987.77, now)
    osc.frequency.setValueAtTime(1318.51, now + 0.08)
    gainNode.gain.setValueAtTime(0.001, now)
    gainNode.gain.linearRampToValueAtTime(0.16, now + 0.03)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.22)
    osc.start(now)
    osc.stop(now + 0.24)
    return
  }

  if (type === 'bump') {
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(180, now)
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.18)
    gainNode.gain.setValueAtTime(0.08, now)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2)
    osc.start(now)
    osc.stop(now + 0.2)
    return
  }

  if (type === 'win') {
    osc.type = 'square'
    const notes = [523.25, 659.25, 783.99, 1046.5]
    notes.forEach((freq, index) => {
      osc.frequency.setValueAtTime(freq, now + index * 0.13)
    })
    gainNode.gain.setValueAtTime(0.08, now)
    gainNode.gain.linearRampToValueAtTime(0.09, now + 0.35)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.65)
    osc.start(now)
    osc.stop(now + 0.66)
  }
}

function shuffleArray(values) {
  const copy = [...values]
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function generateOptions(answer) {
  const options = new Set([answer])

  while (options.size < 4) {
    const variance = Math.floor(Math.random() * 8) + 1
    let distractor = Math.random() > 0.5 ? answer + variance : answer - variance

    if (distractor <= 0) {
      distractor = answer + variance + 3
    }

    options.add(distractor)
  }

  return shuffleArray(Array.from(options))
}

function generateMultiplicationQuestions(count = INITIAL_QUESTION_COUNT) {
  return Array.from({ length: count }, (_, index) => {
    const n1 = Math.floor(Math.random() * 9) + 2
    const n2 = Math.floor(Math.random() * 9) + 2
    const answer = n1 * n2

    return {
      id: `q_${index}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      n1,
      n2,
      answer,
      options: generateOptions(answer),
      isRetry: false,
    }
  })
}

function calculatePoints(attempts) {
  if (attempts === 0) return 5
  if (attempts === 1) return 3
  if (attempts === 2) return 1
  return 0
}

function countRemainingOriginalQuestions(queueItems) {
  return queueItems.reduce((count, item) => count + (item.isRetry ? 0 : 1), 0)
}

function getGrade(percentage) {
  if (percentage >= 97) {
    return { grade: 'A+', color: 'grade-aplus', message: 'Perfecto. Trabajo excelente.' }
  }
  if (percentage >= 90) {
    return { grade: 'A', color: 'grade-a', message: 'Muy buen trabajo. Sigue asi.' }
  }
  if (percentage >= 80) {
    return { grade: 'B', color: 'grade-b', message: 'Buen trabajo. Vas por buen camino.' }
  }
  if (percentage >= 70) {
    return { grade: 'C', color: 'grade-c', message: 'Bien. Con practica mejoras rapido.' }
  }
  if (percentage >= 60) {
    return { grade: 'D', color: 'grade-d', message: 'Casi. Vamos por otra ronda.' }
  }
  return { grade: 'F', color: 'grade-f', message: 'Necesita practica. Intentalo otra vez.' }
}

function normalizeAlias(alias) {
  return alias
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.+|\.+$/g, '')
}

function aliasToEmail(alias) {
  const slug = normalizeAlias(alias)
  if (!slug) return ''
  return `${slug}@${APP_DOMAIN}`
}

function getSubjectById(subjectId) {
  return SUBJECTS.find((subject) => subject.id === subjectId) ?? null
}

function getTestById(subjectId, testId) {
  const tests = TESTS_BY_SUBJECT[subjectId] ?? []
  return tests.find((test) => test.id === testId) ?? null
}

function toResultRecord(docSnapshot) {
  const data = docSnapshot.data()
  let createdAtMs = data.createdAtMs

  if (!createdAtMs && data.createdAt?.toMillis) {
    createdAtMs = data.createdAt.toMillis()
  }

  return {
    id: docSnapshot.id,
    ...data,
    createdAtMs: createdAtMs ?? Date.now(),
  }
}

function formatDateTime(ms) {
  try {
    return new Intl.DateTimeFormat('es-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(ms))
  } catch {
    return new Date(ms).toLocaleString()
  }
}

function mapFirebaseError(error, context) {
  const code = error?.code ?? ''

  if (context === 'register') {
    if (code === 'auth/email-already-in-use') {
      return 'Ese apodo ya existe. Usa otro apodo.'
    }
    if (code === 'auth/weak-password') {
      return 'La contrasena debe tener al menos 6 caracteres.'
    }
  }

  if (context === 'login') {
    if (code === 'auth/invalid-credential' || code === 'auth/user-not-found') {
      return 'Apodo o contrasena incorrectos.'
    }
    if (code === 'auth/too-many-requests') {
      return 'Demasiados intentos. Espera unos minutos.'
    }
  }

  if (code === 'permission-denied') {
    return 'Firebase bloqueo esta accion. Revisa las reglas de Firestore.'
  }

  return 'Ocurrio un error. Intenta nuevamente.'
}

function LoadingScreen() {
  return (
    <div className="screen-center">
      <div className="loading-card">
        <div className="spinner" aria-hidden="true" />
        <p>Cargando Joy App...</p>
      </div>
    </div>
  )
}

function AuthScreen({ busy, errorMessage, onLogin, onRegister }) {
  const [mode, setMode] = useState('login')
  const [alias, setAlias] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [localError, setLocalError] = useState('')

  const submitLabel = mode === 'login' ? 'Entrar' : 'Crear cuenta'

  function handleSubmit(event) {
    event.preventDefault()
    setLocalError('')

    const cleanAlias = alias.trim()

    if (cleanAlias.length < 2) {
      setLocalError('Escribe un apodo de al menos 2 letras.')
      return
    }

    if (password.length < 6) {
      setLocalError('La contrasena debe tener al menos 6 caracteres.')
      return
    }

    if (mode === 'register' && password !== confirmPassword) {
      setLocalError('Las contrasenas no coinciden.')
      return
    }

    if (mode === 'login') {
      onLogin(cleanAlias, password)
      return
    }

    onRegister(cleanAlias, password)
  }

  return (
    <div className="auth-shell">
      <div className="auth-art" aria-hidden="true">
        <div className="auth-bubble bubble-1" />
        <div className="auth-bubble bubble-2" />
        <div className="auth-bubble bubble-3" />
        <div className="auth-card-preview">
          <Sparkles size={22} />
          <p>Aprende por materias</p>
          <small>Selecciona Matematicas y luego Multiplicacion</small>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-header">
          <div className="brand-pill">
            <Sparkles size={16} />
            <span>Joy App Full</span>
          </div>
          <h1>Aprender con color y retos</h1>
          <p>
            Registro sencillo para estudiantes. Usa un apodo y contrasena para guardar resultados.
          </p>
        </div>

        <div className="auth-mode-toggle" role="tablist" aria-label="Modo de acceso">
          <button
            type="button"
            className={mode === 'login' ? 'is-active' : ''}
            onClick={() => {
              setMode('login')
              setLocalError('')
            }}
          >
            Entrar
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'is-active' : ''}
            onClick={() => {
              setMode('register')
              setLocalError('')
            }}
          >
            Registrarse
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Apodo del estudiante</span>
            <div className="input-wrap">
              <User size={16} />
              <input
                type="text"
                placeholder="Ej: Jaime123"
                value={alias}
                onChange={(event) => setAlias(event.target.value)}
                autoComplete="username"
              />
            </div>
          </label>

          <label>
            <span>Contrasena</span>
            <div className="input-wrap">
              <Lock size={16} />
              <input
                type="password"
                placeholder="Minimo 6 caracteres"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>
          </label>

          {mode === 'register' && (
            <label>
              <span>Confirmar contrasena</span>
              <div className="input-wrap">
                <Lock size={16} />
                <input
                  type="password"
                  placeholder="Repite la contrasena"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </label>
          )}

          {(localError || errorMessage) && (
            <div className="banner error">
              <CircleAlert size={16} />
              <span>{localError || errorMessage}</span>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
            {busy ? 'Procesando...' : submitLabel}
          </button>
        </form>

        <p className="auth-help">
          Nota: el apodo se convierte internamente en un acceso de Firebase (email tecnico).
        </p>
      </div>
    </div>
  )
}

function SubjectCard({ subject, onSelect }) {
  const Icon = subject.icon

  return (
    <button
      type="button"
      className={`subject-card ${subject.colorClass} ${subject.available ? '' : 'is-disabled'}`}
      onClick={() => subject.available && onSelect(subject.id)}
      disabled={!subject.available}
    >
      <div className="subject-card-top">
        <div className="subject-icon">
          <Icon size={22} />
        </div>
        <span className={`badge ${subject.available ? 'badge-live' : 'badge-soon'}`}>
          {subject.available ? 'Disponible' : 'Proximamente'}
        </span>
      </div>
      <h3>{subject.name}</h3>
      <p>{subject.description}</p>
    </button>
  )
}

function TestCard({ test, onSelect }) {
  const Icon = test.icon

  return (
    <button
      type="button"
      className={`test-card ${test.accentClass} ${test.available ? '' : 'is-disabled'}`}
      onClick={() => test.available && onSelect(test.id)}
      disabled={!test.available}
    >
      <div className="test-card-icon">
        <Icon size={20} />
      </div>
      <div>
        <h3>{test.name}</h3>
        <p>{test.description}</p>
      </div>
      <span className={`badge ${test.available ? 'badge-live' : 'badge-soon'}`}>
        {test.available ? 'Iniciar' : 'Proximamente'}
      </span>
    </button>
  )
}

function ResultsList({ results, loading }) {
  return (
    <section className="panel-card">
      <div className="panel-card-header">
        <div>
          <h2>Historial de pruebas</h2>
          <p>Se guarda automaticamente cada vez que el estudiante termina una prueba.</p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state compact">
          <div className="spinner small" aria-hidden="true" />
          <p>Cargando resultados...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <Clock3 size={22} />
          <p>Aun no hay resultados guardados.</p>
        </div>
      ) : (
        <div className="results-list">
          {results.map((result) => (
            <div key={result.id} className="result-row">
              <div className="result-main">
                <div className="result-title">
                  <span>{result.subjectName}</span>
                  <span className="dot" />
                  <span>{result.testName}</span>
                  {result.attemptStatus === 'abandoned' && (
                    <span className="badge badge-soon">Abandonada</span>
                  )}
                </div>
                <small>{formatDateTime(result.createdAtMs)}</small>
              </div>
              <div className="result-score">
                <span className={`grade-chip ${getGrade(result.percentage).color}`}>{result.grade}</span>
                <div>
                  <strong>{result.totalScore} pts</strong>
                  <small>{result.percentage}%</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function Dashboard({ studentProfile, results, resultsLoading, onSelectSubject }) {
  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <div className="brand-pill">
            <Sparkles size={16} />
            <span>Panel del Estudiante</span>
          </div>
          <h1>Hola, {studentProfile?.alias ?? 'Estudiante'}</h1>
          <p>
            Primero selecciona una materia. Luego eliges el tipo de prueba dentro de esa materia.
          </p>
        </div>
        <div className="hero-stats">
          <div className="mini-stat">
            <span>Total pruebas</span>
            <strong>{results.length}</strong>
          </div>
          <div className="mini-stat">
            <span>Ultima nota</span>
            <strong>{results[0]?.grade ?? '-'}</strong>
          </div>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-card-header">
          <div>
            <h2>Materias</h2>
            <p>Elige una materia para ver sus tipos de prueba.</p>
          </div>
        </div>
        <div className="subject-grid">
          {SUBJECTS.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} onSelect={onSelectSubject} />
          ))}
        </div>
      </section>

      <ResultsList results={results} loading={resultsLoading} />
    </div>
  )
}

function SubjectTestsView({ subject, onBack, onSelectTest }) {
  const tests = TESTS_BY_SUBJECT[subject.id] ?? []

  return (
    <div className="page-stack">
      <section className={`hero-panel subject-hero ${subject.colorClass}`}>
        <div>
          <button type="button" className="btn btn-ghost back-inline" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Volver a materias</span>
          </button>
          <h1>{subject.name}</h1>
          <p>Selecciona el tipo de prueba. Empezamos con multiplicacion y luego agregamos mas.</p>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-card-header">
          <div>
            <h2>Tipos de prueba</h2>
            <p>Dentro de {subject.name}, el estudiante debe elegir una opcion antes de comenzar.</p>
          </div>
        </div>
        <div className="tests-grid">
          {tests.map((test) => (
            <TestCard key={test.id} test={test} onSelect={onSelectTest} />
          ))}
        </div>
      </section>
    </div>
  )
}

function CoinBurst({ visible }) {
  if (!visible) return null

  return (
    <div className="coin-burst" aria-hidden="true">
      <div className="coin-shape">$</div>
      <span>+Pts</span>
    </div>
  )
}

function MultiplicationChallenge({ onBack, onSaveResult }) {
  const [phase, setPhase] = useState('booting')
  const [queue, setQueue] = useState([])
  const [currentOptions, setCurrentOptions] = useState([])
  const [attemptsOnCurrent, setAttemptsOnCurrent] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [totalScore, setTotalScore] = useState(0)
  const [perfectOriginalCount, setPerfectOriginalCount] = useState(0)
  const [showCoinAnimation, setShowCoinAnimation] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const [lastResult, setLastResult] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const clearFeedbackTimerRef = useRef(null)
  const advanceTimerRef = useRef(null)
  const coinTimerRef = useRef(null)
  const finishInProgressRef = useRef(false)
  const autoStartRef = useRef(false)

  useEffect(() => {
    function syncFullscreenState() {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', syncFullscreenState)
    syncFullscreenState()

    return () => {
      if (clearFeedbackTimerRef.current) window.clearTimeout(clearFeedbackTimerRef.current)
      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current)
      if (coinTimerRef.current) window.clearTimeout(coinTimerRef.current)
      document.removeEventListener('fullscreenchange', syncFullscreenState)
    }
  }, [])

  useEffect(() => {
    if (autoStartRef.current) return
    autoStartRef.current = true
    startGame()
  }, [])

  function clearTimers() {
    if (clearFeedbackTimerRef.current) {
      window.clearTimeout(clearFeedbackTimerRef.current)
      clearFeedbackTimerRef.current = null
    }
    if (advanceTimerRef.current) {
      window.clearTimeout(advanceTimerRef.current)
      advanceTimerRef.current = null
    }
    if (coinTimerRef.current) {
      window.clearTimeout(coinTimerRef.current)
      coinTimerRef.current = null
    }
  }

  function setupQuestion(question) {
    setCurrentOptions(question.options.map((value) => ({ value, isHidden: false })))
    setAttemptsOnCurrent(0)
    setFeedback(null)
  }

  async function enterFullscreenMode() {
    if (typeof document === 'undefined') return
    if (document.fullscreenElement) return
    if (!document.documentElement?.requestFullscreen) return

    try {
      await document.documentElement.requestFullscreen()
    } catch (error) {
      console.warn('No se pudo activar fullscreen:', error)
    }
  }

  async function exitFullscreenMode() {
    if (typeof document === 'undefined') return
    if (!document.fullscreenElement || !document.exitFullscreen) return

    try {
      await document.exitFullscreen()
    } catch (error) {
      console.warn('No se pudo salir de fullscreen:', error)
    }
  }

  function handleBackToTests() {
    void (async () => {
      await exitFullscreenMode()
      onBack()
    })()
  }

  function startGame() {
    clearTimers()
    finishInProgressRef.current = false
    playSound('start', soundEnabled)
    void enterFullscreenMode()
    const initialQueue = generateMultiplicationQuestions(INITIAL_QUESTION_COUNT)
    setQueue(initialQueue)
    setTotalScore(0)
    setPerfectOriginalCount(0)
    setShowCoinAnimation(false)
    setSaveStatus('idle')
    setSaveMessage('')
    setLastResult(null)
    setupQuestion(initialQueue[0])
    setPhase('playing')
  }

  async function finishGame(finalScore, finalPerfectCount, options = {}) {
    if (finishInProgressRef.current) return
    finishInProgressRef.current = true

    const completionMode = options.completionMode ?? 'completed'
    const queueSnapshot = options.queueSnapshot ?? []
    const remainingQueueCount = options.remainingQueueCount ?? queueSnapshot.length
    const remainingOriginalCount =
      options.remainingOriginalCount ?? countRemainingOriginalQuestions(queueSnapshot)
    const answeredOriginalCount = INITIAL_QUESTION_COUNT - remainingOriginalCount

    clearTimers()
    setShowCoinAnimation(false)

    if (completionMode === 'completed') {
      playSound('win', soundEnabled)
    } else {
      playSound('bump', soundEnabled)
    }

    const maxScore = INITIAL_QUESTION_COUNT * 5
    const percentage = Math.min(Math.round((finalScore / maxScore) * 100), 100)
    const gradeInfo = getGrade(percentage)

    const summary = {
      subjectId: 'math',
      subjectName: 'Matematicas',
      testId: 'multiplication',
      testName: 'Multiplicacion',
      totalScore: finalScore,
      maxScore,
      percentage,
      grade: gradeInfo.grade,
      perfectOriginalCount: finalPerfectCount,
      questionCount: INITIAL_QUESTION_COUNT,
      answeredOriginalCount,
      remainingOriginalCount,
      remainingQueueCount,
      attemptStatus: completionMode,
      isAbandoned: completionMode === 'abandoned',
      finishedAtMs: Date.now(),
    }

    setLastResult(summary)
    setPhase('finished')
    setSaveStatus('saving')
    setSaveMessage(
      completionMode === 'abandoned'
        ? 'Guardando resultado parcial (preguntas restantes = 0 pts)...'
        : 'Guardando resultado...',
    )

    try {
      await onSaveResult(summary)
      setSaveStatus('saved')
      setSaveMessage(
        completionMode === 'abandoned'
          ? 'Prueba abandonada: progreso y puntaje guardados en Firebase.'
          : 'Resultado guardado en Firebase.',
      )
    } catch (error) {
      setSaveStatus('error')
      setSaveMessage(mapFirebaseError(error, 'save'))
    }
  }

  function handleGuess(guessedValue) {
    if (feedback === 'correct') return
    const currentQuestion = queue[0]
    if (!currentQuestion) return

    if (guessedValue === currentQuestion.answer) {
      if (clearFeedbackTimerRef.current) window.clearTimeout(clearFeedbackTimerRef.current)
      playSound('coin', soundEnabled)

      const pointsEarned = currentQuestion.isRetry ? 0 : calculatePoints(attemptsOnCurrent)
      const nextScore = totalScore + pointsEarned

      setTotalScore(nextScore)
      setFeedback('correct')
      setShowCoinAnimation(true)

      if (coinTimerRef.current) window.clearTimeout(coinTimerRef.current)
      coinTimerRef.current = window.setTimeout(() => {
        setShowCoinAnimation(false)
      }, 850)

      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current)
      advanceTimerRef.current = window.setTimeout(() => {
        const remainingQueue = queue.slice(1)
        const shouldRepeat = attemptsOnCurrent > 0
        const isPerfectOriginal = !currentQuestion.isRetry && attemptsOnCurrent === 0
        const nextPerfectOriginalCount = isPerfectOriginal
          ? perfectOriginalCount + 1
          : perfectOriginalCount

        let nextQueue = remainingQueue

        if (shouldRepeat) {
          const retryQuestion = {
            ...currentQuestion,
            id: `retry_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            options: generateOptions(currentQuestion.answer),
            isRetry: true,
          }
          nextQueue = [...remainingQueue, retryQuestion]
        }

        setPerfectOriginalCount(nextPerfectOriginalCount)

        if (nextQueue.length === 0) {
          setQueue([])
          setCurrentOptions([])
          setFeedback(null)
          void finishGame(nextScore, nextPerfectOriginalCount, {
            completionMode: 'completed',
            queueSnapshot: [],
          })
          return
        }

        setQueue(nextQueue)
        setupQuestion(nextQueue[0])
      }, 900)

      return
    }

    playSound('bump', soundEnabled)
    setFeedback('incorrect')
    setAttemptsOnCurrent((previous) => previous + 1)
    setCurrentOptions((previous) =>
      previous.map((option) =>
        option.value === guessedValue ? { ...option, isHidden: true } : option,
      ),
    )

    if (clearFeedbackTimerRef.current) window.clearTimeout(clearFeedbackTimerRef.current)
    clearFeedbackTimerRef.current = window.setTimeout(() => {
      setFeedback((previous) => (previous === 'incorrect' ? null : previous))
    }, 420)
  }

  function handleAbandonTest() {
    if (phase !== 'playing') return
    if (feedback === 'correct') return
    if (!queue.length) return
    if (finishInProgressRef.current) return

    const confirmed = window.confirm(
      'Si abandonas la prueba ahora, se guardará el puntaje actual y las preguntas restantes contarán como 0 puntos. ¿Deseas continuar?',
    )

    if (!confirmed) return

    const queueSnapshot = [...queue]
    void finishGame(totalScore, perfectOriginalCount, {
      completionMode: 'abandoned',
      queueSnapshot,
    })
  }

  async function handleFullscreenToggle() {
    if (document.fullscreenElement) {
      await exitFullscreenMode()
      return
    }

    await enterFullscreenMode()
  }

  if (phase === 'booting') {
    return (
      <section className={`game-shell intro ${isFullscreen ? 'is-fullscreen' : ''}`}>
        <div className="game-intro-card">
          <div className="empty-state">
            <div className="spinner" aria-hidden="true" />
            <p>Preparando prueba de multiplicacion...</p>
          </div>
        </div>
      </section>
    )
  }

  if (phase === 'finished') {
    const summary = lastResult ?? {
      totalScore,
      maxScore: INITIAL_QUESTION_COUNT * 5,
      percentage: 0,
      grade: 'F',
      perfectOriginalCount,
      questionCount: INITIAL_QUESTION_COUNT,
    }
    const gradeInfo = getGrade(summary.percentage)
    const isAbandoned = summary.attemptStatus === 'abandoned'

    return (
      <section className={`game-shell ${isFullscreen ? 'is-fullscreen' : ''}`}>
        <div className="results-card">
          <div className={`results-trophy ${gradeInfo.color}`}>
            {isAbandoned ? <CircleAlert size={34} /> : <Trophy size={34} />}
          </div>
          <h1 className={`results-grade ${gradeInfo.color}`}>{summary.grade}</h1>
          <p className="results-message">
            {isAbandoned
              ? 'Prueba abandonada. Se guardó el avance con el puntaje actual.'
              : gradeInfo.message}
          </p>

          <div className="score-panel">
            <div className="score-labels">
              <span>Puntaje final</span>
              <strong>
                {summary.totalScore} / {summary.maxScore} pts
              </strong>
            </div>
            <div className="progress-track large">
              <div className="progress-fill" style={{ width: `${summary.percentage}%` }} />
            </div>
            <div className="score-meta">
              <span>{summary.percentage}%</span>
              <span>
                {isAbandoned
                  ? `${summary.answeredOriginalCount ?? 0} de 25 preguntas base respondidas`
                  : `${summary.perfectOriginalCount} perfectas (de 25)`}
              </span>
            </div>
          </div>

          <div
            className={`banner ${
              saveStatus === 'saved'
                ? 'success'
                : saveStatus === 'error'
                  ? 'error'
                  : 'info'
            }`}
          >
            {saveStatus === 'saved' ? (
              <CheckCircle2 size={16} />
            ) : saveStatus === 'error' ? (
              <CircleAlert size={16} />
            ) : (
              <Clock3 size={16} />
            )}
            <span>{saveMessage || 'Resultado listo.'}</span>
          </div>

          <div className="results-actions">
            <button type="button" className="btn btn-primary" onClick={startGame}>
              <RotateCcw size={16} />
              <span>Jugar de nuevo</span>
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleBackToTests}>
              <ArrowLeft size={16} />
              <span>Volver a tipos de prueba</span>
            </button>
          </div>
        </div>
      </section>
    )
  }

  const currentQuestion = queue[0]
  const progressPercentage = Math.round((perfectOriginalCount / INITIAL_QUESTION_COUNT) * 100)
  const currentPotentialPoints = currentQuestion?.isRetry ? 0 : calculatePoints(attemptsOnCurrent)

  return (
    <section className={`game-shell ${isFullscreen ? 'is-fullscreen' : ''}`}>
      <CoinBurst visible={showCoinAnimation} />

      <div className="game-topbar">
        <div className="hud-pill">
          <span className="hud-label">Puntos</span>
          <strong>x{String(totalScore).padStart(3, '0')}</strong>
        </div>

        <div className="hud-progress">
          <div className="hud-row">
            <span>Mundo Matematico 1</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
          </div>
          <small>Preguntas en cola: {queue.length}</small>
        </div>

        <div className="hud-actions">
          <button
            type="button"
            className="btn btn-ghost icon-only"
            onClick={() => void handleFullscreenToggle()}
            aria-label={isFullscreen ? 'Salir de pantalla grande' : 'Pantalla grande'}
            title={isFullscreen ? 'Salir de pantalla grande' : 'Pantalla grande'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button
            type="button"
            className="btn btn-ghost icon-only"
            onClick={() => setSoundEnabled((value) => !value)}
            aria-label={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
            title={soundEnabled ? 'Silenciar sonidos' : 'Activar sonidos'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            type="button"
            className="btn btn-danger-soft"
            onClick={handleAbandonTest}
            disabled={saveStatus === 'saving' || feedback === 'correct'}
            title="Guardar resultado parcial y salir de la prueba"
          >
            <ArrowLeft size={16} />
            <span>Abandonar</span>
          </button>
        </div>
      </div>

      {currentQuestion && (
        <div className="game-board">
          <div className="stars-row" aria-label="Puntos posibles en esta pregunta">
            {Array.from({ length: 5 }, (_, index) => (
              <Star
                key={index}
                size={28}
                className={index < currentPotentialPoints ? 'star-on' : 'star-off'}
                fill={index < currentPotentialPoints ? 'currentColor' : 'none'}
              />
            ))}
          </div>

          <div className="question-meta">
            {currentQuestion.isRetry ? (
              <span className="badge badge-soon">Reforzamiento (0 pts)</span>
            ) : (
              <span className="badge badge-live">Pregunta con puntaje</span>
            )}
          </div>

          <div className={`question-card ${feedback ? `feedback-${feedback}` : ''}`}>
            <div className="question-number">{currentQuestion.n1}</div>
            <X size={36} className="question-symbol" />
            <div className="question-number">{currentQuestion.n2}</div>
          </div>

          <div className="answers-grid">
            {currentOptions.map((option, index) => (
              <button
                key={`${currentQuestion.id}_${index}`}
                type="button"
                className={`answer-btn ${option.isHidden ? 'is-hidden' : ''}`}
                disabled={option.isHidden || feedback === 'correct'}
                onClick={() => handleGuess(option.value)}
              >
                {option.value}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

function App() {
  const [authReady, setAuthReady] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [studentProfile, setStudentProfile] = useState(null)
  const [authBusy, setAuthBusy] = useState(false)
  const [authError, setAuthError] = useState('')
  const [resultsLoading, setResultsLoading] = useState(false)
  const [results, setResults] = useState([])
  const [screen, setScreen] = useState('dashboard')
  const [selectedSubjectId, setSelectedSubjectId] = useState(null)
  const [selectedTestId, setSelectedTestId] = useState(null)

  async function loadStudentData(user) {
    setResultsLoading(true)

    try {
      const profileRef = doc(db, 'students', user.uid)
      const profileSnapshot = await getDoc(profileRef)

      if (profileSnapshot.exists()) {
        setStudentProfile(profileSnapshot.data())
      } else {
        const fallbackAlias = user.email?.split('@')[0] ?? 'Estudiante'
        setStudentProfile({ alias: fallbackAlias })
      }

      const resultsRef = collection(db, 'students', user.uid, 'results')
      const resultsQuery = query(resultsRef, orderBy('createdAtMs', 'desc'), limit(20))
      const resultSnapshot = await getDocs(resultsQuery)
      setResults(resultSnapshot.docs.map(toResultRecord))
    } catch (error) {
      console.error('Error loading student data:', error)
      setResults([])
    } finally {
      setResultsLoading(false)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)

      if (!user) {
        setStudentProfile(null)
        setResults([])
        setScreen('dashboard')
        setSelectedSubjectId(null)
        setSelectedTestId(null)
        setAuthReady(true)
        return
      }

      await loadStudentData(user)
      setAuthReady(true)
    })

    return unsubscribe
  }, [])

  async function handleRegister(alias, password) {
    setAuthBusy(true)
    setAuthError('')

    try {
      const email = aliasToEmail(alias)

      if (!email) {
        setAuthError('Ese apodo no es valido.')
        return
      }

      const credential = await createUserWithEmailAndPassword(auth, email, password)
      const profile = {
        alias: alias.trim(),
        aliasSlug: normalizeAlias(alias),
        createdAt: serverTimestamp(),
        createdAtMs: Date.now(),
      }

      await setDoc(doc(db, 'students', credential.user.uid), profile, { merge: true })
      setStudentProfile(profile)
      setAuthError('')
    } catch (error) {
      setAuthError(mapFirebaseError(error, 'register'))
    } finally {
      setAuthBusy(false)
    }
  }

  async function handleLogin(alias, password) {
    setAuthBusy(true)
    setAuthError('')

    try {
      const email = aliasToEmail(alias)

      if (!email) {
        setAuthError('Ese apodo no es valido.')
        return
      }

      await signInWithEmailAndPassword(auth, email, password)
      setAuthError('')
    } catch (error) {
      setAuthError(mapFirebaseError(error, 'login'))
    } finally {
      setAuthBusy(false)
    }
  }

  async function handleLogout() {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  async function saveAssessmentResult(summary) {
    if (!currentUser) {
      throw new Error('No authenticated user.')
    }

    const payload = {
      ...summary,
      studentAlias: studentProfile?.alias ?? 'Estudiante',
      createdAtMs: Date.now(),
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, 'students', currentUser.uid, 'results'), payload)
    const savedRecord = { id: docRef.id, ...payload }

    setResults((previous) => [savedRecord, ...previous].sort((a, b) => b.createdAtMs - a.createdAtMs))
    return savedRecord
  }

  function openSubject(subjectId) {
    setSelectedSubjectId(subjectId)
    setSelectedTestId(null)
    setScreen('subject')
  }

  function openTest(testId) {
    setSelectedTestId(testId)
    setScreen('test')
  }

  function goToDashboard() {
    setScreen('dashboard')
    setSelectedSubjectId(null)
    setSelectedTestId(null)
  }

  function goToSubjectMenu() {
    setScreen('subject')
    setSelectedTestId(null)
  }

  if (!authReady) {
    return <LoadingScreen />
  }

  if (!currentUser) {
    return (
      <AuthScreen
        busy={authBusy}
        errorMessage={authError}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    )
  }

  const selectedSubject = getSubjectById(selectedSubjectId)
  const selectedTest = selectedSubject ? getTestById(selectedSubject.id, selectedTestId) : null

  return (
    <div className="app-shell">
      <header className="top-nav">
        <button type="button" className="brand-brand" onClick={goToDashboard}>
          <div className="brand-mark">
            <Sparkles size={18} />
          </div>
          <div>
            <strong>Joy App Full</strong>
            <small>Aprendizaje por materias</small>
          </div>
        </button>

        <div className="nav-user">
          <div className="user-chip">
            <User size={16} />
            <span>{studentProfile?.alias ?? 'Estudiante'}</span>
          </div>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Salir</span>
          </button>
        </div>
      </header>

      <main className="app-main">
        {screen === 'dashboard' && (
          <Dashboard
            studentProfile={studentProfile}
            results={results}
            resultsLoading={resultsLoading}
            onSelectSubject={openSubject}
          />
        )}

        {screen === 'subject' && selectedSubject && (
          <SubjectTestsView
            subject={selectedSubject}
            onBack={goToDashboard}
            onSelectTest={openTest}
          />
        )}

        {screen === 'test' && selectedSubject && selectedTest?.id === 'multiplication' && (
          <MultiplicationChallenge onBack={goToSubjectMenu} onSaveResult={saveAssessmentResult} />
        )}

        {screen === 'test' && (!selectedSubject || !selectedTest) && (
          <section className="panel-card">
            <div className="empty-state">
              <CircleAlert size={20} />
              <p>No se encontro la prueba seleccionada.</p>
              <button type="button" className="btn btn-primary" onClick={goToDashboard}>
                Volver al inicio
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
