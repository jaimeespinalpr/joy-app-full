import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { auth, db } from './firebase'
import { READING_STORY_BANKS } from './readingStories'

const INITIAL_QUESTION_COUNT = 25
const MULTIPLICATION_QUESTION_COUNT = 12
const WORD_PROBLEM_QUESTION_COUNT = 8
const FULL_TEST_QUESTION_COUNT = 15
const FULL_TEST_MIN_PER_TEST = 2
const WORD_PROBLEM_VOICE_LANG = 'en-US'
const GLOBAL_RESULTS_COLLECTION = 'publicResults'
const APP_DOMAIN = 'joyapp.student'

const WORD_PROBLEM_NAMES = [
  'Mia',
  'Leo',
  'Sofia',
  'Noah',
  'Emma',
  'Liam',
  'Ava',
  'Eli',
  'Chloe',
  'Owen',
  'Luna',
  'Mateo',
]

const WORD_PROBLEM_ITEMS = [
  'stickers',
  'apples',
  'cookies',
  'crayons',
  'marbles',
  'blocks',
  'toy cars',
  'shells',
  'books',
  'pencils',
  'balloons',
  'buttons',
]

const WORD_PROBLEM_CONTAINERS = ['bags', 'boxes', 'rows', 'trays', 'baskets', 'shelves']
const WORD_PROBLEM_PLACES = ['classroom', 'park', 'kitchen', 'playroom', 'library', 'garden']

const SUBJECTS = [
  {
    id: 'math',
    name: 'Math',
    description: 'Practice operations, challenges, and step-by-step problems.',
    colorClass: 'subject-math',
    icon: Calculator,
    available: true,
  },
  {
    id: 'reading',
    name: 'Reading',
    description: 'Short stories in English and Spanish with comprehension questions.',
    colorClass: 'subject-reading',
    icon: BookOpen,
    available: true,
  },
  {
    id: 'language',
    name: 'Language',
    description: 'Spelling and language practice in Spanish and English.',
    colorClass: 'subject-language',
    icon: MessageSquareText,
    available: true,
  },
]

const TESTS_BY_SUBJECT = {
  math: [
    {
      id: 'multiplication',
      name: 'Multiplication',
      description: '3rd grade multiplication with scoring and reinforcement.',
      available: true,
      accentClass: 'test-multiplication',
      icon: X,
    },
    {
      id: 'addition',
      name: 'Addition',
      description: 'Coming soon: leveled addition and mental math speed.',
      available: false,
      accentClass: 'test-addition',
      icon: Plus,
    },
    {
      id: 'subtraction',
      name: 'Subtraction',
      description: 'Coming soon: subtraction with and without borrowing.',
      available: false,
      accentClass: 'test-subtraction',
      icon: Minus,
    },
    {
      id: 'word-problems',
      name: 'Word Problems',
      description: 'Listen to a short math story and solve it with +, -, or x.',
      available: true,
      accentClass: 'test-word',
      icon: MessageSquareText,
    },
  ],
  reading: [
    {
      id: 'reading-english',
      name: 'English',
      description: 'Read a short story and answer 5 questions.',
      available: true,
      accentClass: 'test-reading-english',
      icon: BookOpen,
    },
    {
      id: 'reading-spanish',
      name: 'Spanish',
      description: 'Read a short story and answer 5 questions.',
      available: true,
      accentClass: 'test-reading-spanish',
      icon: BookOpen,
    },
  ],
  language: [
    {
      id: 'spelling-spanish',
      name: 'Spanish',
      description: 'Listen to a word and choose the correct spelling.',
      available: true,
      accentClass: 'test-word',
      icon: Volume2,
    },
    {
      id: 'spelling-english',
      name: 'English',
      description: 'Choose the correct past tense form of a verb.',
      available: true,
      accentClass: 'test-language',
      icon: Volume2,
    },
  ],
}

const FULL_TEST_CARD = {
  id: 'full-test',
  name: 'Full Test',
  description: 'Mixed challenge with 15 exercises (minimum 2 from each test).',
  available: true,
  accentClass: 'test-full',
  icon: Sparkles,
}

const FULL_TEST_SOURCE_TESTS = [
  { testId: 'multiplication', label: 'Multiplication' },
  { testId: 'word-problems', label: 'Word Problems' },
  { testId: 'reading-english', label: 'Reading English' },
  { testId: 'reading-spanish', label: 'Reading Spanish' },
  { testId: 'spelling-spanish', label: 'Spelling Spanish' },
  { testId: 'spelling-english', label: 'Spelling English' },
]

const SPELLING_TEST_CONFIGS = {
  'spelling-spanish': {
    subjectId: 'language',
    subjectName: 'Language',
    testId: 'spelling-spanish',
    testName: 'Spanish',
    languageLabel: 'Spanish',
    voiceLang: 'es-ES',
    words: [
      'casa',
      'gato',
      'perro',
      'mesa',
      'silla',
      'libro',
      'lapiz',
      'cuaderno',
      'escuela',
      'amigo',
      'amiga',
      'fruta',
      'manzana',
      'pera',
      'uva',
      'leche',
      'pan',
      'queso',
      'arroz',
      'sopa',
      'agua',
      'sol',
      'luna',
      'estrella',
      'cielo',
      'nube',
      'lluvia',
      'viento',
      'playa',
      'arena',
      'mar',
      'pez',
      'pato',
      'gallina',
      'caballo',
      'conejo',
      'flor',
      'hoja',
      'arbol',
      'rama',
      'piedra',
      'puerta',
      'ventana',
      'camisa',
      'zapato',
      'gorra',
      'rojo',
      'azul',
      'verde',
      'amarillo',
      'negro',
      'blanco',
      'grande',
      'chico',
      'feliz',
      'triste',
      'jugar',
      'cantar',
      'saltar',
      'correr',
      'bailar',
      'sonrisa',
      'dulce',
      'tigre',
      'raton',
      'botella',
      'parque',
      'pelota',
      'camino',
      'naranja',
    ],
  },
  'spelling-english': {
    subjectId: 'language',
    subjectName: 'Language',
    testId: 'spelling-english',
    testName: 'English',
    languageLabel: 'English',
    voiceLang: 'en-US',
    mode: 'past-tense',
    words: [
      'change',
      'play',
      'jump',
      'wash',
      'clean',
      'open',
      'close',
      'help',
      'paint',
      'talk',
      'walk',
      'watch',
      'start',
      'visit',
      'listen',
      'cook',
      'laugh',
      'smile',
      'ask',
      'call',
      'stop',
      'plan',
      'drop',
      'shop',
      'slip',
      'trip',
      'clap',
      'grab',
      'skip',
      'nod',
      'hug',
      'jog',
      'drag',
      'plug',
      'beg',
      'pat',
      'tap',
      'hop',
      'rub',
      'rip',
      'step',
      'chat',
      'drip',
      'clip',
      'pack',
      'kick',
      'push',
      'pull',
      'look',
      'need',
      'want',
      'learn',
      'rain',
      'snow',
      'rest',
      'share',
      'brush',
      'dance',
      'move',
      'live',
    ],
  },
}

const READING_QUESTION_COUNT = 5
const readingStoryDecksByTest = {}
const ENGLISH_READING_FILLER_SENTENCES = [
  'The characters noticed small details around them as the story continued.',
  'They paid attention and tried to make good choices.',
  'Everything happened in a calm and simple way that was easy to follow.',
  'A small problem appeared, but they handled it step by step.',
  'They listened carefully and helped each other when needed.',
  'By the end, they had learned something useful from the experience.',
  'The day felt special because of the little moments they shared.',
  'They were careful, patient, and worked together.',
  'Each new moment helped them understand what to do next.',
  'It was a good reminder to pay attention and be kind.',
]
const SPANISH_READING_FILLER_SENTENCES = [
  'Los personajes notaron pequenos detalles mientras la historia continuaba.',
  'Ellos prestaron atencion e intentaron tomar buenas decisiones.',
  'Todo paso de una forma tranquila y facil de entender.',
  'Aparecio un problema pequeno, pero lo resolvieron paso a paso.',
  'Escucharon con cuidado y se ayudaron cuando fue necesario.',
  'Al final, aprendieron algo util de la experiencia.',
  'El dia se sintio especial por los momentos sencillos que compartieron.',
  'Fueron pacientes, cuidadosos y trabajaron juntos.',
  'Cada momento nuevo les ayudo a entender que hacer despues.',
  'Fue un buen recordatorio para prestar atencion y ser amables.',
]

const READING_TEST_CONFIGS = {
  'reading-english': {
    subjectId: 'reading',
    subjectName: 'Reading',
    testId: 'reading-english',
    testName: 'English',
    languageLabel: 'English',
    stories: READING_STORY_BANKS.english,
  },
  'reading-spanish': {
    subjectId: 'reading',
    subjectName: 'Reading',
    testId: 'reading-spanish',
    testName: 'Spanish',
    languageLabel: 'Spanish',
    stories: READING_STORY_BANKS.spanish,
  },
}

let audioCtx = null
let speechVoicesInitialized = false

function warmSpeechVoices() {
  if (typeof window === 'undefined' || !window.speechSynthesis || speechVoicesInitialized) return

  speechVoicesInitialized = true

  try {
    window.speechSynthesis.getVoices()
    window.speechSynthesis.onvoiceschanged = () => {
      // Trigger browser voice list load/update (Chrome often fills this asynchronously).
      window.speechSynthesis.getVoices()
    }
  } catch (error) {
    console.warn('Could not initialize speech voices:', error)
  }
}

function initAudio() {
  try {
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
  } catch (error) {
    console.warn('Audio is not available right now:', error)
    return false
  }
}

function playSound(type, enabled) {
  try {
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
  } catch (error) {
    console.warn('Could not play sound:', error)
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

function generateMultiplicationQuestions(count = MULTIPLICATION_QUESTION_COUNT) {
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

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pickRandom(values) {
  if (!values?.length) return ''
  return values[Math.floor(Math.random() * values.length)]
}

function generateWordProblemOptions(answer, operation, values = {}) {
  const options = new Set([answer])
  const seedCandidates = []

  if (operation === 'add') {
    const { a = 0, b = 0 } = values
    seedCandidates.push(Math.abs(a - b), answer + 1, answer - 1, answer + 2, answer - 2)
  } else if (operation === 'subtract') {
    const { total = 0, removed = 0 } = values
    seedCandidates.push(total + removed, removed, answer + 1, answer - 1, answer + 2)
  } else if (operation === 'multiply') {
    const { groups = 0, each = 0 } = values
    seedCandidates.push(groups + each, groups * (each - 1), (groups - 1) * each, answer + each, answer - each)
  }

  for (const candidate of shuffleArray(seedCandidates)) {
    if (options.size >= 4) break
    if (Number.isFinite(candidate) && candidate > 0 && candidate !== answer) {
      options.add(Math.round(candidate))
    }
  }

  while (options.size < 4) {
    const variance = randomInt(1, 8)
    const candidate = Math.random() > 0.5 ? answer + variance : answer - variance
    if (candidate > 0 && candidate !== answer) options.add(candidate)
  }

  return shuffleArray(Array.from(options))
}

function toSimpleSingular(word) {
  const value = String(word ?? '').trim().toLowerCase()
  if (!value) return ''
  if (value.endsWith('ies')) return `${value.slice(0, -3)}y`
  if (value.endsWith('xes') || value.endsWith('ches') || value.endsWith('shes')) {
    return value.slice(0, -2)
  }
  if (value.endsWith('s')) return value.slice(0, -1)
  return value
}

function buildAdditionWordProblem(templateIndex) {
  const name = pickRandom(WORD_PROBLEM_NAMES)
  const item = pickRandom(WORD_PROBLEM_ITEMS)
  const place = pickRandom(WORD_PROBLEM_PLACES)
  const a = randomInt(3, 18)
  const b = randomInt(2, 14)
  const answer = a + b
  let storyText = ''
  let questionPrompt = ''
  let explanation = ''
  let templateId = `add-${templateIndex}`

  switch (templateIndex % 4) {
    case 0:
      storyText = `${name} had ${a} ${item} at home. Then ${name}'s teacher gave ${name} ${b} more ${item} in class.`
      questionPrompt = `How many ${item} does ${name} have now?`
      explanation = `Add the two amounts: ${a} plus ${b} equals ${answer}. So ${name} has ${answer} ${item} now.`
      break
    case 1:
      storyText = `At the ${place}, ${name} found ${a} ${item} in one basket and ${b} ${item} in another basket.`
      questionPrompt = `How many ${item} are there in both baskets together?`
      explanation = `Put both groups together: ${a} + ${b} = ${answer}. There are ${answer} ${item} in all.`
      break
    case 2:
      storyText = `${name} brought ${a} ${item} to a game. A friend brought ${b} more ${item} to share.`
      questionPrompt = `How many ${item} do they have altogether?`
      explanation = `Altogether means add. ${a} plus ${b} equals ${answer}. The total is ${answer}.`
      break
    default:
      storyText = `${name} counted ${a} ${item} in the ${place}. Later, ${name} counted ${b} more ${item}.`
      questionPrompt = `What is the total number of ${item}?`
      explanation = `First group ${a}, second group ${b}. Add them: ${a} + ${b} = ${answer}.`
      break
  }

  return {
    operation: 'add',
    operationLabel: 'Addition',
    templateId,
    values: { a, b },
    storyText,
    questionPrompt,
    answer,
    explanation,
    options: generateWordProblemOptions(answer, 'add', { a, b }),
    baseKey: `${templateId}:${name}:${item}:${a}:${b}`,
  }
}

function buildSubtractionWordProblem(templateIndex) {
  const name = pickRandom(WORD_PROBLEM_NAMES)
  const item = pickRandom(WORD_PROBLEM_ITEMS)
  const place = pickRandom(WORD_PROBLEM_PLACES)
  const total = randomInt(8, 24)
  const removed = randomInt(2, Math.max(2, total - 2))
  const answer = total - removed
  let storyText = ''
  let questionPrompt = ''
  let explanation = ''
  let templateId = `sub-${templateIndex}`

  switch (templateIndex % 4) {
    case 0:
      storyText = `${name} had ${total} ${item} in a box. ${name} gave ${removed} ${item} to a friend after school.`
      questionPrompt = `How many ${item} are left in the box?`
      explanation = `Left means subtract. Start with ${total} and take away ${removed}. ${total} - ${removed} = ${answer}.`
      break
    case 1:
      storyText = `There were ${total} ${item} on a table in the ${place}. ${removed} ${item} were used for an art project.`
      questionPrompt = `How many ${item} are still on the table?`
      explanation = `Still on the table means what remains. Subtract ${removed} from ${total}. The answer is ${answer}.`
      break
    case 2:
      storyText = `${name} counted ${total} ${item}. Then ${removed} ${item} rolled under the couch.`
      questionPrompt = `How many ${item} can ${name} still count?`
      explanation = `Take away the ones that rolled away: ${total} - ${removed} = ${answer}.`
      break
    default:
      storyText = `${name} made ${total} ${item} for a class party. The class ate ${removed} ${item}.`
      questionPrompt = `How many ${item} are left for later?`
      explanation = `We subtract the eaten items from the total. ${total} minus ${removed} equals ${answer}.`
      break
  }

  return {
    operation: 'subtract',
    operationLabel: 'Subtraction',
    templateId,
    values: { total, removed },
    storyText,
    questionPrompt,
    answer,
    explanation,
    options: generateWordProblemOptions(answer, 'subtract', { total, removed }),
    baseKey: `${templateId}:${name}:${item}:${total}:${removed}`,
  }
}

function buildMultiplicationWordProblem(templateIndex) {
  const name = pickRandom(WORD_PROBLEM_NAMES)
  const item = pickRandom(WORD_PROBLEM_ITEMS)
  const container = pickRandom(WORD_PROBLEM_CONTAINERS)
  const place = pickRandom(WORD_PROBLEM_PLACES)
  const groups = randomInt(2, 6)
  const each = randomInt(2, 9)
  const answer = groups * each
  const singularContainer = toSimpleSingular(container)
  let storyText = ''
  let questionPrompt = ''
  let explanation = ''
  let templateId = `mul-${templateIndex}`

  switch (templateIndex % 4) {
    case 0:
      storyText = `${name} packed ${groups} ${container} for the ${place}. Each ${singularContainer} has ${each} ${item}.`
      questionPrompt = `How many ${item} are in all ${groups} ${container}?`
      explanation = `${groups} groups of ${each} means multiply. ${groups} x ${each} = ${answer}.`
      break
    case 1:
      storyText = `A game has ${groups} rows of prizes. Each row has ${each} ${item}.`
      questionPrompt = `How many ${item} are there in all?`
      explanation = `Rows with the same number use multiplication. ${groups} times ${each} equals ${answer}.`
      break
    case 2:
      storyText = `${name} made ${groups} small teams. Each team got ${each} ${item}.`
      questionPrompt = `How many ${item} did the teams get altogether?`
      explanation = `There are ${groups} equal groups of ${each}. Multiply: ${groups} x ${each} = ${answer}.`
      break
    default:
      storyText = `In the ${place}, there are ${groups} ${container}. Each ${singularContainer} holds ${each} ${item}.`
      questionPrompt = `What is the total number of ${item}?`
      explanation = `Use multiplication for equal groups. ${groups} groups times ${each} each makes ${answer}.`
      break
  }

  return {
    operation: 'multiply',
    operationLabel: 'Multiplication',
    templateId,
    values: { groups, each },
    storyText,
    questionPrompt,
    answer,
    explanation,
    options: generateWordProblemOptions(answer, 'multiply', { groups, each }),
    baseKey: `${templateId}:${name}:${item}:${container}:${groups}:${each}`,
  }
}

function buildWordProblemQuestion(operation, index) {
  const templateIndex = randomInt(0, 99)
  if (operation === 'add') return buildAdditionWordProblem(templateIndex + index)
  if (operation === 'subtract') return buildSubtractionWordProblem(templateIndex + index)
  return buildMultiplicationWordProblem(templateIndex + index)
}

function generateWordProblemQuestions(count = WORD_PROBLEM_QUESTION_COUNT) {
  const operationSeed = Array.from({ length: count }, (_, index) => ['add', 'subtract', 'multiply'][index % 3])
  const operationOrder = shuffleArray(operationSeed)
  const seenKeys = new Set()

  return operationOrder.map((operation, index) => {
    let question = null
    let attempts = 0

    do {
      question = buildWordProblemQuestion(operation, index + attempts)
      attempts += 1
    } while (question && seenKeys.has(question.baseKey) && attempts < 12)

    if (question?.baseKey) {
      seenKeys.add(question.baseKey)
    }

    return {
      ...question,
      id: `wp_${index}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      isRetry: false,
    }
  })
}

function getWordSequence(pool, count) {
  const uniquePool = Array.from(new Set(pool.map((word) => word.trim().toLowerCase()).filter(Boolean)))
  if (uniquePool.length === 0) return []

  const sequence = []
  let batch = shuffleArray(uniquePool)
  let index = 0

  while (sequence.length < count) {
    if (index >= batch.length) {
      batch = shuffleArray(uniquePool)
      index = 0
    }

    const candidate = batch[index]
    index += 1

    if (sequence.length > 0 && sequence[sequence.length - 1] === candidate && uniquePool.length > 1) {
      continue
    }

    sequence.push(candidate)
  }

  return sequence
}

function replaceCharAt(value, index, nextChar) {
  return `${value.slice(0, index)}${nextChar}${value.slice(index + 1)}`
}

function mutateSpellingWord(word, languageId) {
  const normalized = word.trim().toLowerCase()
  if (normalized.length < 2) return normalized

  const vowels = ['a', 'e', 'i', 'o', 'u']
  const spanishMap = {
    b: ['v'],
    v: ['b'],
    c: ['s', 'k'],
    s: ['c', 'z'],
    z: ['s'],
    g: ['j'],
    j: ['g'],
    y: ['i'],
    i: ['y'],
  }
  const englishMap = {
    c: ['k', 's'],
    k: ['c'],
    s: ['c', 'z'],
    z: ['s'],
    i: ['e', 'y'],
    e: ['i'],
    y: ['i'],
    f: ['v'],
    v: ['f'],
    g: ['j'],
    j: ['g'],
  }
  const confusionMap = languageId === 'spelling-spanish' ? spanishMap : englishMap

  const candidates = []

  for (let i = 0; i < normalized.length - 1; i += 1) {
    if (normalized[i] !== normalized[i + 1]) {
      const swapped =
        normalized.slice(0, i) +
        normalized[i + 1] +
        normalized[i] +
        normalized.slice(i + 2)
      candidates.push(swapped)
    }
  }

  for (let i = 0; i < normalized.length; i += 1) {
    const char = normalized[i]
    if (vowels.includes(char)) {
      for (const vowel of vowels) {
        if (vowel !== char) {
          candidates.push(replaceCharAt(normalized, i, vowel))
        }
      }
    }

    const substitutions = confusionMap[char] ?? []
    for (const replacement of substitutions) {
      candidates.push(replaceCharAt(normalized, i, replacement))
    }

    candidates.push(normalized.slice(0, i) + normalized.slice(i + 1))
    candidates.push(normalized.slice(0, i + 1) + char + normalized.slice(i + 1))
  }

  if (!normalized.startsWith('h')) {
    candidates.push(`h${normalized}`)
  } else if (normalized.length > 2) {
    candidates.push(normalized.slice(1))
  }

  const filtered = shuffleArray(
    Array.from(
      new Set(
        candidates.filter(
          (candidate) =>
            candidate &&
            candidate !== normalized &&
            candidate.length >= 2 &&
            /^[a-z]+$/.test(candidate),
        ),
      ),
    ),
  )

  return filtered
}

function generateSpellingOptions(correctWord, languageId) {
  const options = new Set([correctWord])
  const candidates = mutateSpellingWord(correctWord, languageId)

  for (const candidate of candidates) {
    if (options.size >= 4) break
    options.add(candidate)
  }

  let safety = 0
  while (options.size < 4 && safety < 40) {
    safety += 1
    const base = mutateSpellingWord(correctWord, languageId)
    const fallback = base[safety % Math.max(base.length, 1)]
    if (fallback) options.add(fallback)
  }

  if (options.size < 4) {
    const extraLetters = ['a', 'e', 'i', 'o', 'u', 'n', 'r', 's', 't', 'l']
    let attempts = 0
    while (options.size < 4 && attempts < 40) {
      attempts += 1
      const index = Math.floor(Math.random() * correctWord.length)
      const nextChar = extraLetters[Math.floor(Math.random() * extraLetters.length)]
      const candidate = replaceCharAt(correctWord, index, nextChar)
      if (candidate !== correctWord && /^[a-z]+$/.test(candidate)) {
        options.add(candidate)
      }
    }
  }

  return shuffleArray(Array.from(options)).slice(0, 4)
}

function isLikelyCvcVerbForPast(baseWord) {
  const word = String(baseWord ?? '').toLowerCase()
  if (word.length < 3) return false
  const vowels = new Set(['a', 'e', 'i', 'o', 'u'])
  const last = word[word.length - 1]
  const middle = word[word.length - 2]
  const before = word[word.length - 3]
  if (['w', 'x', 'y'].includes(last)) return false
  return !vowels.has(last) && vowels.has(middle) && !vowels.has(before)
}

function toRegularEnglishPastTense(baseWord) {
  const word = String(baseWord ?? '').toLowerCase()
  if (!word) return ''

  if (word.endsWith('e')) {
    return `${word}d`
  }

  if (word.endsWith('y')) {
    const beforeY = word[word.length - 2] ?? ''
    if (!['a', 'e', 'i', 'o', 'u'].includes(beforeY)) {
      return `${word.slice(0, -1)}ied`
    }
  }

  if (isLikelyCvcVerbForPast(word)) {
    const last = word[word.length - 1]
    return `${word}${last}ed`
  }

  return `${word}ed`
}

function generatePastTenseOptions(baseWord) {
  const word = String(baseWord ?? '').toLowerCase()
  const answer = toRegularEnglishPastTense(word)
  const options = new Set([answer])

  const candidates = [
    `${word}ed`,
    `${word}d`,
    word,
    word.endsWith('e') ? `${word}ed` : `${word}ing`,
    answer.endsWith('ed') ? `${answer}ed` : `${answer}d`,
  ]

  if (isLikelyCvcVerbForPast(word)) {
    const last = word[word.length - 1]
    candidates.push(`${word}${last}d`)
    candidates.push(`${word}ing`)
  }

  if (word.endsWith('e')) {
    candidates.push(`${word.slice(0, -1)}ed`)
  }

  if (word.endsWith('y')) {
    candidates.push(`${word}ed`)
    candidates.push(`${word.slice(0, -1)}yed`)
  }

  for (const candidate of shuffleArray(candidates)) {
    if (options.size >= 4) break
    if (candidate && candidate !== answer) {
      options.add(candidate)
    }
  }

  while (options.size < 4) {
    const fallback = mutateSpellingWord(answer, 'spelling-english')[options.size] ?? `${answer}${options.size}`
    if (fallback !== answer) options.add(fallback)
  }

  return { answer, options: shuffleArray(Array.from(options)).slice(0, 4) }
}

function generateSpellingQuestions(testConfig, count = INITIAL_QUESTION_COUNT) {
  const words = getWordSequence(testConfig.words, count)

  if (testConfig.mode === 'past-tense') {
    return words.map((word, index) => {
      const pastTense = generatePastTenseOptions(word)
      return {
        id: `sp_${testConfig.testId}_${index}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        word,
        baseWord: word,
        promptWord: word,
        answer: pastTense.answer,
        options: pastTense.options,
        isRetry: false,
      }
    })
  }

  return words.map((word, index) => ({
    id: `sp_${testConfig.testId}_${index}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    word,
    answer: word,
    options: generateSpellingOptions(word, testConfig.testId),
    isRetry: false,
  }))
}

function getObjectSequence(pool, count) {
  if (!pool?.length || count <= 0) return []

  const sequence = []
  let batch = shuffleArray(pool)
  let index = 0

  while (sequence.length < count) {
    if (index >= batch.length) {
      batch = shuffleArray(pool)
      index = 0
    }

    sequence.push(batch[index])
    index += 1
  }

  return sequence
}

function toFullQuestionId(prefix, index) {
  return `full_${prefix}_${index}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function generateFullTestReadingQuestions(testConfig, sourceLabel, count) {
  const stories = testConfig?.stories ?? []
  const pool = stories.flatMap((story) =>
    (story.questions ?? []).map((question) => ({
      story,
      question,
    })),
  )
  const picked = getObjectSequence(pool, count)

  return picked.map((item, index) => {
    const storyText = (item.story?.paragraphs ?? []).join(' ')
    return {
      id: toFullQuestionId(testConfig.testId, index),
      sourceTestId: testConfig.testId,
      sourceLabel,
      prompt: item.question.prompt,
      context: storyText,
      answer: item.question.answer,
      options: shuffleArray([...(item.question.options ?? [])]),
      optionPool: [...(item.question.options ?? [])],
      baseKey: `${item.story?.id ?? 'story'}:${item.question.id}`,
      isRetry: false,
    }
  })
}

function generateFullTestQuestionsForSource(sourceTestId, count) {
  if (sourceTestId === 'multiplication') {
    return generateMultiplicationQuestions(count).map((question, index) => ({
      id: toFullQuestionId('multiplication', index),
      sourceTestId,
      sourceLabel: 'Multiplication',
      prompt: `${question.n1} x ${question.n2} = ?`,
      context: 'Solve the multiplication.',
      answer: question.answer,
      options: question.options,
      n1: question.n1,
      n2: question.n2,
      baseKey: `${question.n1}x${question.n2}`,
      isRetry: false,
    }))
  }

  if (sourceTestId === 'word-problems') {
    return generateWordProblemQuestions(count).map((question, index) => ({
      id: toFullQuestionId('word-problems', index),
      sourceTestId,
      sourceLabel: 'Word Problems',
      prompt: question.questionPrompt,
      context: question.storyText,
      answer: question.answer,
      options: question.options,
      operation: question.operation,
      values: question.values,
      explanation: question.explanation,
      baseKey: question.baseKey ?? `wp:${index}`,
      isRetry: false,
    }))
  }

  if (sourceTestId === 'reading-english') {
    return generateFullTestReadingQuestions(READING_TEST_CONFIGS['reading-english'], 'Reading English', count)
  }

  if (sourceTestId === 'reading-spanish') {
    return generateFullTestReadingQuestions(READING_TEST_CONFIGS['reading-spanish'], 'Reading Spanish', count)
  }

  if (sourceTestId === 'spelling-spanish' || sourceTestId === 'spelling-english') {
    const config = SPELLING_TEST_CONFIGS[sourceTestId]
    return generateSpellingQuestions(config, count).map((question, index) => ({
      id: toFullQuestionId(sourceTestId, index),
      sourceTestId,
      sourceLabel: sourceTestId === 'spelling-spanish' ? 'Spelling Spanish' : 'Spelling English',
      prompt:
        sourceTestId === 'spelling-english'
          ? `Choose the correct past tense for "${question.baseWord}".`
          : `Choose the correct spelling for "${question.word}".`,
      context:
        sourceTestId === 'spelling-english'
          ? 'Pick the verb in past tense.'
          : 'Pick the word with correct spelling.',
      answer: question.answer,
      options: question.options,
      word: question.word,
      baseWord: question.baseWord,
      baseKey: `${sourceTestId}:${question.baseWord ?? question.word ?? index}`,
      isRetry: false,
    }))
  }

  return []
}

function buildFullTestRetryQuestion(question) {
  let nextOptions = shuffleArray([...(question.options ?? [])])

  if (question.sourceTestId === 'multiplication') {
    nextOptions = generateOptions(question.answer)
  } else if (question.sourceTestId === 'word-problems') {
    nextOptions = generateWordProblemOptions(question.answer, question.operation, question.values)
  } else if (question.sourceTestId === 'reading-english' || question.sourceTestId === 'reading-spanish') {
    nextOptions = shuffleArray([...(question.optionPool ?? question.options ?? [])])
  } else if (question.sourceTestId === 'spelling-english' && question.baseWord) {
    nextOptions = generatePastTenseOptions(question.baseWord).options
  } else if (question.sourceTestId === 'spelling-spanish' && question.answer) {
    nextOptions = generateSpellingOptions(question.answer, 'spelling-spanish')
  }

  return {
    ...question,
    id: `retry_full_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    options: nextOptions,
    isRetry: true,
  }
}

function generateFullTestQuestions(count = FULL_TEST_QUESTION_COUNT) {
  const required = FULL_TEST_SOURCE_TESTS.flatMap((source) =>
    generateFullTestQuestionsForSource(source.testId, FULL_TEST_MIN_PER_TEST),
  )
  const allQuestions = [...required]

  while (allQuestions.length < count) {
    const extraSource = pickRandom(FULL_TEST_SOURCE_TESTS)
    const [extraQuestion] = generateFullTestQuestionsForSource(extraSource?.testId, 1)
    if (extraQuestion) {
      allQuestions.push(extraQuestion)
    } else {
      break
    }
  }

  return shuffleArray(allQuestions).slice(0, count)
}

function fullTestRecordFromQuestion(question) {
  const prompt = trimReviewLabel(question.prompt, 64)
  return {
    key: `full:${question.sourceTestId}:${question.baseKey ?? question.id}`,
    prompt: question.prompt,
    answer: question.answer,
    label: `${question.sourceLabel}: ${prompt} (Answer: ${question.answer})`,
  }
}

function getPendingFullTestQuestions(queueItems) {
  return mergeExerciseRecords(
    queueItems
      .filter((item) => !item.isRetry)
      .map((item) => fullTestRecordFromQuestion(item)),
  )
}

function spellingRecordFromQuestion(question) {
  if (question.baseWord) {
    return {
      key: `word:${question.baseWord}`,
      label: `${question.baseWord} -> ${question.answer}`,
      word: question.answer,
      baseWord: question.baseWord,
    }
  }

  return {
    key: `word:${question.word}`,
    label: question.word,
    word: question.word,
  }
}

function getNextReadingStory(testConfig) {
  const pool = testConfig?.stories ?? []
  if (!pool.length) return null

  const deckKey = testConfig.testId
  let deck = readingStoryDecksByTest[deckKey] ?? []

  if (!deck.length) {
    deck = shuffleArray(pool.map((item) => item.id))
  }

  const nextStoryId = deck.shift()
  readingStoryDecksByTest[deckKey] = deck

  return pool.find((item) => item.id === nextStoryId) ?? pool[0]
}

function generateReadingQuestions(story, testId, count = READING_QUESTION_COUNT) {
  if (!story) return []

  return shuffleArray(story.questions)
    .slice(0, count)
    .map((question, index) => ({
      id: `rd_${testId}_${story.id}_${index}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      baseKey: `${story.id}:${question.id}`,
      storyId: story.id,
      storyTitle: story.title,
      prompt: question.prompt,
      answer: question.answer,
      options: shuffleArray([...question.options]),
      isRetry: false,
    }))
}

function splitStoryTextIntoSentences(text) {
  return String(text ?? '')
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean)
}

function buildExpandedReadingParagraph(story, languageLabel) {
  if (!story) return ''

  const baseSentences = (story.paragraphs ?? []).flatMap((paragraph) =>
    splitStoryTextIntoSentences(paragraph),
  )

  const fillerPool = languageLabel === 'Spanish' ? SPANISH_READING_FILLER_SENTENCES : ENGLISH_READING_FILLER_SENTENCES
  const needed = Math.max(0, 10 - baseSentences.length)
  const fillers = shuffleArray(fillerPool).slice(0, needed)

  return [...baseSentences, ...fillers].join(' ')
}

function trimReviewLabel(text, maxLength = 88) {
  const value = String(text ?? '').trim()
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength - 1).trimEnd()}…`
}

function readingQuestionRecordFromQuestion(question) {
  const prompt = trimReviewLabel(question.prompt, 64)
  return {
    key: `reading:${question.baseKey ?? question.id}`,
    prompt: question.prompt,
    answer: question.answer,
    label: `${prompt} (Answer: ${question.answer})`,
  }
}

function wordProblemRecordFromQuestion(question) {
  const prompt = trimReviewLabel(question.questionPrompt, 64)
  return {
    key: `word-problem:${question.baseKey ?? question.id}`,
    prompt: question.questionPrompt,
    answer: question.answer,
    label: `${prompt} (Answer: ${question.answer})`,
  }
}

function getPendingReadingQuestions(queueItems) {
  return mergeExerciseRecords(
    queueItems
      .filter((item) => !item.isRetry)
      .map((item) => readingQuestionRecordFromQuestion(item)),
  )
}

function getPendingWordProblems(queueItems) {
  return mergeExerciseRecords(
    queueItems
      .filter((item) => !item.isRetry)
      .map((item) => wordProblemRecordFromQuestion(item)),
  )
}

function getPendingSpellingWords(queueItems) {
  return mergeExerciseRecords(
    queueItems
      .filter((item) => !item.isRetry)
      .map((item) => spellingRecordFromQuestion(item)),
  )
}

function estimateSpeechDurationMs(text) {
  const words = String(text ?? '')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length
  if (!words) return 900
  return Math.max(1400, Math.min(9000, 700 + words * 280))
}

function stopSpeechPlayback() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
}

function getPreferredSpeechVoice(voiceLang, options = {}) {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null

  const voices = window.speechSynthesis.getVoices?.() ?? []
  if (!voices.length) return null

  const requested = String(voiceLang || '').toLowerCase()
  const requestedBase = requested.split('-')[0]

  const matches = voices.filter((voice) => {
    const lang = String(voice.lang || '').toLowerCase()
    if (!requestedBase) return true
    return lang === requested || lang.startsWith(`${requestedBase}-`) || lang === requestedBase
  })

  const pool = matches.length ? matches : voices

  const preferGoogle = options.preferGoogle ?? false
  const scored = pool
    .map((voice) => {
      const name = String(voice.name || '').toLowerCase()
      const lang = String(voice.lang || '').toLowerCase()
      let score = 0

      if (lang === requested) score += 40
      else if (requestedBase && lang.startsWith(`${requestedBase}-`)) score += 24
      else if (requestedBase && lang === requestedBase) score += 20

      if (name.includes('google')) score += 60
      if (preferGoogle && name.includes('google')) score += 120
      if (name.includes('natural')) score += 30
      if (name.includes('enhanced')) score += 20
      if (name.includes('premium')) score += 18
      if (name.includes('neural')) score += 18

      if (requestedBase === 'es') {
        if (name.includes('español') || name.includes('spanish')) score += 18
      }
      if (requestedBase === 'en') {
        if (name.includes('english')) score += 18
        if (name.includes('us') || name.includes('america')) score += 6
      }

      if (voice.default) score += 8
      if (voice.localService) score += 4

      return { voice, score }
    })
    .sort((a, b) => b.score - a.score)

  return scored[0]?.voice ?? null
}

function speakDictationWord(word, voiceLang, enabled) {
  if (!enabled) return false
  if (typeof window === 'undefined' || !window.speechSynthesis || !word) return false

  warmSpeechVoices()

  const UtteranceCtor = window.SpeechSynthesisUtterance || globalThis.SpeechSynthesisUtterance
  if (!UtteranceCtor) return false

  try {
    window.speechSynthesis.cancel()
    const utterance = new UtteranceCtor(word)
    const preferredVoice = getPreferredSpeechVoice(voiceLang)

    if (preferredVoice) {
      utterance.voice = preferredVoice
      utterance.lang = preferredVoice.lang || voiceLang
    } else {
      utterance.lang = voiceLang
    }

    utterance.rate = voiceLang.startsWith('es') ? 0.86 : 0.88
    utterance.pitch = 1
    utterance.volume = 1
    window.speechSynthesis.speak(utterance)
    return true
  } catch (error) {
    console.warn('Could not play dictation voice:', error)
    return false
  }
}

function speakTextSequence(texts, voiceLang, enabled, options = {}) {
  if (!enabled) return false
  if (typeof window === 'undefined' || !window.speechSynthesis) return false

  const sequence = texts.map((item) => String(item ?? '').trim()).filter(Boolean)
  if (!sequence.length) return false

  warmSpeechVoices()

  const UtteranceCtor = window.SpeechSynthesisUtterance || globalThis.SpeechSynthesisUtterance
  if (!UtteranceCtor) return false

  const {
    cancelFirst = true,
    onDone,
    runTokenRef,
    runToken,
    rate,
    pitch,
    volume,
    pauseMs,
    preferGoogle,
  } = options

  try {
    if (cancelFirst) {
      window.speechSynthesis.cancel()
    }

    const preferredVoice = getPreferredSpeechVoice(voiceLang, { preferGoogle })
    const localRunToken = runToken ?? Symbol('speech-seq')
    const utteranceRate = Number.isFinite(rate) ? rate : voiceLang.startsWith('es') ? 0.86 : 0.88
    const utterancePitch = Number.isFinite(pitch) ? pitch : 1
    const utteranceVolume = Number.isFinite(volume) ? volume : 1
    const pauseDelay = Number.isFinite(pauseMs) ? pauseMs : 120

    const speakNext = (index) => {
      if (runTokenRef && runTokenRef.current !== localRunToken) return

      if (index >= sequence.length) {
        onDone?.()
        return
      }

      const utterance = new UtteranceCtor(sequence[index])
      if (preferredVoice) {
        utterance.voice = preferredVoice
        utterance.lang = preferredVoice.lang || voiceLang
      } else {
        utterance.lang = voiceLang
      }

      utterance.rate = utteranceRate
      utterance.pitch = utterancePitch
      utterance.volume = utteranceVolume
      utterance.onend = () => {
        if (runTokenRef && runTokenRef.current !== localRunToken) return
        window.setTimeout(() => speakNext(index + 1), pauseDelay)
      }
      utterance.onerror = () => {
        if (runTokenRef && runTokenRef.current !== localRunToken) return
        onDone?.()
      }
      window.speechSynthesis.speak(utterance)
    }

    if (runTokenRef) runTokenRef.current = localRunToken
    speakNext(0)
    return true
  } catch (error) {
    console.warn('Could not play speech sequence:', error)
    return false
  }
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
    return { grade: 'A+', color: 'grade-aplus', message: 'Perfect. Excellent work.' }
  }
  if (percentage >= 90) {
    return { grade: 'A', color: 'grade-a', message: 'Great job. Keep going.' }
  }
  if (percentage >= 80) {
    return { grade: 'B', color: 'grade-b', message: 'Good work. You are on the right track.' }
  }
  if (percentage >= 70) {
    return { grade: 'C', color: 'grade-c', message: 'Nice. With practice you improve fast.' }
  }
  if (percentage >= 60) {
    return { grade: 'D', color: 'grade-d', message: 'Almost there. Let us try another round.' }
  }
  return { grade: 'F', color: 'grade-f', message: 'Needs practice. Try again.' }
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

function sortResultsByNewest(results) {
  return [...results].sort((a, b) => (b.createdAtMs ?? 0) - (a.createdAtMs ?? 0))
}

function upsertResultRecord(list, nextRecord) {
  const nextId = nextRecord?.id
  if (!nextId) return sortResultsByNewest(list)

  const withoutCurrent = list.filter((item) => item.id !== nextId)
  return sortResultsByNewest([nextRecord, ...withoutCurrent])
}

function mergeResultRecordLists(...lists) {
  const byId = new Map()
  for (const item of lists.flat()) {
    if (!item?.id) continue
    byId.set(item.id, item)
  }
  return sortResultsByNewest(Array.from(byId.values()))
}

function getPublicResultDocId(userId, sourceResultId) {
  return `public_${userId}_${sourceResultId}`
}

function toPublicResultPayload(resultRecord, userId, sourceResultId) {
  const { id: _ignoredLocalId, createdAt, ...rest } = resultRecord
  return {
    ...rest,
    sourceUserId: userId,
    sourceResultId,
    visibility: 'public',
    updatedAtMs: Date.now(),
    createdAtMs: resultRecord.createdAtMs ?? Date.now(),
    createdAt: serverTimestamp(),
  }
}

function formatDateTime(ms) {
  try {
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(ms))
  } catch {
    return new Date(ms).toLocaleString()
  }
}

function exerciseKeyFromQuestion(question) {
  return `${question.n1}x${question.n2}`
}

function exerciseRecordFromQuestion(question) {
  return {
    key: exerciseKeyFromQuestion(question),
    n1: question.n1,
    n2: question.n2,
    answer: question.answer,
    label: `${question.n1} x ${question.n2} = ${question.answer}`,
  }
}

function mergeExerciseRecords(...lists) {
  const seen = new Set()
  const merged = []

  lists.flat().forEach((item) => {
    if (!item?.key) return
    if (seen.has(item.key)) return
    seen.add(item.key)
    merged.push(item)
  })

  return merged
}

function getPendingOriginalExercises(queueItems) {
  return mergeExerciseRecords(
    queueItems
      .filter((item) => !item.isRetry)
      .map((item) => exerciseRecordFromQuestion(item)),
  )
}

function getPersonalRecords(results) {
  return results
    .filter(
      (result) =>
        result.attemptStatus !== 'abandoned',
    )
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) return b.totalScore - a.totalScore
      if (b.percentage !== a.percentage) return b.percentage - a.percentage
      return (a.createdAtMs ?? 0) - (b.createdAtMs ?? 0)
    })
}

function getTopRecordForTest(results, subjectId, testId) {
  return (
    results
      .filter(
        (result) =>
          result.subjectId === subjectId &&
          result.testId === testId &&
          result.attemptStatus !== 'abandoned',
      )
      .sort((a, b) => {
        if ((b.percentage ?? 0) !== (a.percentage ?? 0)) return (b.percentage ?? 0) - (a.percentage ?? 0)
        if ((b.totalScore ?? 0) !== (a.totalScore ?? 0)) return (b.totalScore ?? 0) - (a.totalScore ?? 0)
        return (a.createdAtMs ?? 0) - (b.createdAtMs ?? 0)
      })[0] ?? null
  )
}

function getResultDisplayLabels(result) {
  const subjectName = getSubjectById(result.subjectId)?.name ?? result.subjectName ?? 'Subject'
  const testName =
    getTestById(result.subjectId, result.testId)?.name ?? result.testName ?? 'Test'

  return { subjectName, testName }
}

function getSavedStudentName(result) {
  return result.studentName || result.studentAlias || 'Student'
}

function TestLeaderboardChip({ topRecord }) {
  if (!topRecord) {
    return (
      <div className="test-leader-chip is-empty">
        <Trophy size={14} />
        <span>No leaderboard record yet for this test</span>
      </div>
    )
  }

  return (
    <div className="test-leader-chip">
      <Trophy size={14} />
      <span className="label">Top</span>
      <strong>{getSavedStudentName(topRecord)}</strong>
      <span>{topRecord.percentage}%</span>
    </div>
  )
}

function getStudentDisplayName(studentProfile, currentUser) {
  const alias = studentProfile?.alias?.trim()
  if (alias) return alias

  const emailPrefix = currentUser?.email?.split('@')?.[0]?.trim()
  if (emailPrefix) return emailPrefix

  return 'Student'
}

function mapFirebaseError(error, context) {
  const code = error?.code ?? ''

  if (context === 'register') {
    if (code === 'auth/email-already-in-use') {
      return 'That nickname already exists. Use a different nickname.'
    }
    if (code === 'auth/weak-password') {
      return 'The password must be at least 6 characters.'
    }
  }

  if (context === 'login') {
    if (code === 'auth/invalid-credential' || code === 'auth/user-not-found') {
      return 'Nickname or password is incorrect.'
    }
    if (code === 'auth/too-many-requests') {
      return 'Too many attempts. Please wait a few minutes.'
    }
  }

  if (code === 'permission-denied') {
    return 'Firebase blocked this action. Check your Firestore rules.'
  }

  return 'An error occurred. Please try again.'
}

function LoadingScreen() {
  return (
    <div className="screen-center">
        <div className="loading-card">
          <div className="spinner" aria-hidden="true" />
        <p>Loading Joy App...</p>
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

  const submitLabel = mode === 'login' ? 'Sign in' : 'Create account'

  function handleSubmit(event) {
    event.preventDefault()
    setLocalError('')

    const cleanAlias = alias.trim()

    if (cleanAlias.length < 2) {
      setLocalError('Enter a nickname with at least 2 letters.')
      return
    }

    if (password.length < 6) {
      setLocalError('The password must be at least 6 characters.')
      return
    }

    if (mode === 'register' && password !== confirmPassword) {
      setLocalError('Passwords do not match.')
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
          <p>Learn by subject</p>
          <small>Select Math and then Multiplication</small>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-header">
          <div className="brand-pill">
            <Sparkles size={16} />
            <span>Joy App Full</span>
          </div>
          <h1>Learn with color and challenges</h1>
          <p>
            Simple student sign-up. Use a nickname and password to save results.
          </p>
        </div>

        <div className="auth-mode-toggle" role="tablist" aria-label="Access mode">
          <button
            type="button"
            className={mode === 'login' ? 'is-active' : ''}
            onClick={() => {
              setMode('login')
              setLocalError('')
            }}
          >
            Sign in
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'is-active' : ''}
            onClick={() => {
              setMode('register')
              setLocalError('')
            }}
          >
            Sign up
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Student nickname</span>
            <div className="input-wrap">
              <User size={16} />
              <input
                type="text"
                placeholder="Ex: Jaime123"
                value={alias}
                onChange={(event) => setAlias(event.target.value)}
                autoComplete="username"
              />
            </div>
          </label>

          <label>
            <span>Password</span>
            <div className="input-wrap">
              <Lock size={16} />
              <input
                type="password"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            </div>
          </label>

          {mode === 'register' && (
            <label>
              <span>Confirm password</span>
              <div className="input-wrap">
                <Lock size={16} />
                <input
                  type="password"
                  placeholder="Repeat the password"
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
            {busy ? 'Processing...' : submitLabel}
          </button>
        </form>

        <p className="auth-help">
          Note: the nickname is internally converted into a Firebase login (technical email).
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
          {subject.available ? 'Available' : 'Coming soon'}
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
        {test.available ? 'Start' : 'Coming soon'}
      </span>
    </button>
  )
}

function ResultsList({ results, loading }) {
  return (
    <section className="panel-card">
      <div className="panel-card-header">
        <div>
          <h2>Global Test History</h2>
          <p>Completed and abandoned tests from all students (updated automatically).</p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state compact">
          <div className="spinner small" aria-hidden="true" />
          <p>Loading results...</p>
        </div>
      ) : results.length === 0 ? (
        <div className="empty-state">
          <Clock3 size={22} />
          <p>No saved results yet.</p>
        </div>
      ) : (
        <div className="results-list">
          {results.map((result) => {
            const labels = getResultDisplayLabels(result)

            return (
              <div key={result.id} className="result-row">
              <div className="result-main">
                <div className="result-title">
                  <span>{labels.subjectName}</span>
                  <span className="dot" />
                  <span>{labels.testName}</span>
                  {result.attemptStatus === 'abandoned' && (
                    <span className="badge badge-soon">Abandoned</span>
                  )}
                </div>
                <small>
                  {getSavedStudentName(result)} · {formatDateTime(result.createdAtMs)}
                </small>
              </div>
              <div className="result-score">
                <span className={`grade-chip ${getGrade(result.percentage).color}`}>{result.grade}</span>
                <div>
                  <strong>{result.totalScore} pts</strong>
                  <small>{result.percentage}%</small>
                </div>
              </div>
            </div>
            )
          })}
        </div>
      )}
    </section>
  )
}

function RecordsPanel({ results }) {
  const records = getPersonalRecords(results)
  const highScore = records[0] ?? null
  const leaderboardEntries = records
  const highScoreLabels = highScore ? getResultDisplayLabels(highScore) : null

  return (
    <section className="panel-card">
      <div className="panel-card-header">
        <div>
          <h2>Global Leaderboard / High Score</h2>
          <p>Completed tests from all students (name + score).</p>
        </div>
      </div>

      {!highScore ? (
        <div className="empty-state">
          <Trophy size={20} />
          <p>Complete a test to create the first global record.</p>
        </div>
      ) : (
        <div className="records-layout">
          <div className="record-highlight">
            <div className="record-highlight-header">
              <Trophy size={18} />
              <span>High Score</span>
            </div>
            <strong>{highScore.totalScore} pts</strong>
            <div className="record-highlight-meta">
              <span>{getSavedStudentName(highScore)}</span>
              <span>{highScoreLabels?.subjectName}</span>
              <span>{highScoreLabels?.testName}</span>
            </div>
            <div className="record-highlight-meta">
              <span>{highScore.percentage}%</span>
              <span>{highScore.grade}</span>
              <span>{formatDateTime(highScore.createdAtMs)}</span>
            </div>
          </div>

          <div className="leaderboard-list">
            {leaderboardEntries.map((record, index) => {
              const labels = getResultDisplayLabels(record)
              return (
                <div key={record.id} className="leaderboard-row">
                  <div className="rank-pill">#{index + 1}</div>
                  <div className="leaderboard-main">
                    <strong>{record.totalScore} pts</strong>
                    <small>
                      {record.percentage}% · {record.grade} · {getSavedStudentName(record)}
                    </small>
                    <small>
                      {labels.subjectName} · {labels.testName}
                    </small>
                  </div>
                  <small className="leaderboard-date">{formatDateTime(record.createdAtMs)}</small>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </section>
  )
}

function Dashboard({
  studentProfile,
  personalResults,
  globalResults,
  personalResultsLoading,
  globalResultsLoading,
  globalResultsError,
  onStartFullTest,
  onSelectSubject,
}) {
  const usingGlobalPanels = globalResults.length > 0 || !personalResults.length
  const panelResults = usingGlobalPanels ? globalResults : personalResults
  const panelLoading = usingGlobalPanels ? globalResultsLoading : personalResultsLoading

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <div>
          <div className="brand-pill">
            <Sparkles size={16} />
            <span>Student Dashboard</span>
          </div>
          <h1>Hello, {studentProfile?.alias ?? 'Student'}</h1>
          <p>
            First select a subject. Then choose the test type inside that subject.
          </p>
        </div>
        <div className="hero-stats">
          <div className="mini-stat">
            <span>Your tests</span>
            <strong>{personalResults.length}</strong>
          </div>
          <div className="mini-stat">
            <span>Your last grade</span>
            <strong>{personalResults[0]?.grade ?? '-'}</strong>
          </div>
          <div className="mini-stat">
            <span>Global tests</span>
            <strong>{globalResults.length}</strong>
          </div>
        </div>
      </section>

      {!usingGlobalPanels && (
        <div className="banner info">
          <CircleAlert size={16} />
          <span>
            Global leaderboard is not available right now, so this section is showing this student&apos;s
            results only. Check Firestore rules for `publicResults`.
          </span>
        </div>
      )}

      {globalResultsError && (
        <div className="banner error">
          <CircleAlert size={16} />
          <span>{globalResultsError}</span>
        </div>
      )}

      <section className="panel-card">
        <div className="panel-card-header">
          <div>
            <h2>Full Test</h2>
            <p>Mixed challenge of 15 exercises with all test types included.</p>
          </div>
        </div>
        <div className="tests-grid tests-grid-single">
          <TestCard test={FULL_TEST_CARD} onSelect={onStartFullTest} />
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-card-header">
          <div>
            <h2>Subjects</h2>
            <p>Choose a subject to see its test types.</p>
          </div>
        </div>
        <div className="subject-grid">
          {SUBJECTS.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} onSelect={onSelectSubject} />
          ))}
        </div>
      </section>

      <ResultsList results={panelResults} loading={panelLoading} />
      <RecordsPanel results={panelResults} />
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
            <span>Back to subjects</span>
          </button>
          <h1>{subject.name}</h1>
          <p>Select the test type for this subject. More activities will be added over time.</p>
        </div>
      </section>

      <section className="panel-card">
        <div className="panel-card-header">
          <div>
            <h2>Test types</h2>
            <p>Inside {subject.name}, the student must choose an option before starting.</p>
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

function MultiplicationChallenge({ onBack, onSaveResult, studentName, topTestRecord }) {
  const [phase, setPhase] = useState('playing')
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
  const [reviewExercises, setReviewExercises] = useState([])

  const clearFeedbackTimerRef = useRef(null)
  const advanceTimerRef = useRef(null)
  const coinTimerRef = useRef(null)
  const finishInProgressRef = useRef(false)
  const autoStartRef = useRef(false)
  const reviewExercisesRef = useRef([])

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

  useLayoutEffect(() => {
    if (autoStartRef.current) return
    autoStartRef.current = true
    startGame({ playStartSound: false })
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

  function addReviewExercise(question) {
    if (!question || question.isRetry) return

    const nextList = mergeExerciseRecords(reviewExercisesRef.current, [
      exerciseRecordFromQuestion(question),
    ])
    reviewExercisesRef.current = nextList
    setReviewExercises(nextList)
  }

  async function enterFullscreenMode() {
    if (typeof document === 'undefined') return
    if (document.fullscreenElement) return
    if (!document.documentElement?.requestFullscreen) return

    try {
      await document.documentElement.requestFullscreen()
    } catch (error) {
      console.warn('Could not enter fullscreen mode:', error)
    }
  }

  async function exitFullscreenMode() {
    if (typeof document === 'undefined') return
    if (!document.fullscreenElement || !document.exitFullscreen) return

    try {
      await document.exitFullscreen()
    } catch (error) {
      console.warn('Could not exit fullscreen mode:', error)
    }
  }

  function handleBackToTests() {
    void (async () => {
      await exitFullscreenMode()
      onBack()
    })()
  }

  function startGame(options = {}) {
    const shouldPlayStartSound = options.playStartSound ?? true
    clearTimers()
    finishInProgressRef.current = false
    if (shouldPlayStartSound) {
      playSound('start', soundEnabled)
    }
    void enterFullscreenMode()
    const initialQueue = generateMultiplicationQuestions(MULTIPLICATION_QUESTION_COUNT)
    setQueue(initialQueue)
    setTotalScore(0)
    setPerfectOriginalCount(0)
    setShowCoinAnimation(false)
    setSaveStatus('idle')
    setSaveMessage('')
    setLastResult(null)
    reviewExercisesRef.current = []
    setReviewExercises([])
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
    const answeredOriginalCount = MULTIPLICATION_QUESTION_COUNT - remainingOriginalCount
    const pendingExercises = completionMode === 'abandoned' ? getPendingOriginalExercises(queueSnapshot) : []
    const reviewExercisesSummary = mergeExerciseRecords(
      reviewExercisesRef.current,
      options.extraReviewExercises ?? [],
    )

    clearTimers()
    setShowCoinAnimation(false)

    if (completionMode === 'completed') {
      playSound('win', soundEnabled)
    } else {
      playSound('bump', soundEnabled)
    }

    const maxScore = MULTIPLICATION_QUESTION_COUNT * 5
    const percentage = Math.min(Math.round((finalScore / maxScore) * 100), 100)
    const gradeInfo = getGrade(percentage)

    const summary = {
      subjectId: 'math',
      subjectName: 'Math',
      testId: 'multiplication',
      testName: 'Multiplication',
      totalScore: finalScore,
      maxScore,
      percentage,
      grade: gradeInfo.grade,
      perfectOriginalCount: finalPerfectCount,
      questionCount: MULTIPLICATION_QUESTION_COUNT,
      answeredOriginalCount,
      remainingOriginalCount,
      remainingQueueCount,
      attemptStatus: completionMode,
      isAbandoned: completionMode === 'abandoned',
      reviewExercises: reviewExercisesSummary,
      pendingExercises,
      finishedAtMs: Date.now(),
    }

    setLastResult(summary)
    setPhase('finished')
    setSaveStatus('saving')
    setSaveMessage(
      completionMode === 'abandoned'
        ? 'Saving partial result (remaining questions = 0 pts)...'
        : 'Saving result...',
    )

    try {
      await onSaveResult(summary)
      setSaveStatus('saved')
      setSaveMessage(
        completionMode === 'abandoned'
          ? 'Test abandoned: progress and score saved to Firebase.'
          : 'Result saved to Firebase.',
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

      if (attemptsOnCurrent > 0) {
        addReviewExercise(currentQuestion)
      }

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
      'If you leave the test now, your current score will be saved and all remaining questions will count as 0 points. Do you want to continue?',
    )

    if (!confirmed) return

    const queueSnapshot = [...queue]
    const currentQuestion = queue[0]
    const extraReviewExercises =
      currentQuestion && !currentQuestion.isRetry && attemptsOnCurrent > 0
        ? [exerciseRecordFromQuestion(currentQuestion)]
        : []
    void finishGame(totalScore, perfectOriginalCount, {
      completionMode: 'abandoned',
      queueSnapshot,
      extraReviewExercises,
    })
  }

  async function handleFullscreenToggle() {
    if (document.fullscreenElement) {
      await exitFullscreenMode()
      return
    }

    await enterFullscreenMode()
  }

  if (phase === 'finished') {
    const summary = lastResult ?? {
      totalScore,
      maxScore: MULTIPLICATION_QUESTION_COUNT * 5,
      percentage: 0,
      grade: 'F',
      perfectOriginalCount,
      questionCount: MULTIPLICATION_QUESTION_COUNT,
      reviewExercises,
      pendingExercises: [],
    }
    const gradeInfo = getGrade(summary.percentage)
    const isAbandoned = summary.attemptStatus === 'abandoned'
    const reviewList = summary.reviewExercises ?? []
    const pendingList = summary.pendingExercises ?? []

    return (
      <section className={`game-shell ${isFullscreen ? 'is-fullscreen' : ''}`}>
        <div className="results-card">
          <div className={`results-trophy ${gradeInfo.color}`}>
            {isAbandoned ? <CircleAlert size={34} /> : <Trophy size={34} />}
          </div>
          <h1 className={`results-grade ${gradeInfo.color}`}>{summary.grade}</h1>
          <p className="results-message">
            {isAbandoned
              ? 'Test abandoned. Progress was saved with the current score.'
              : gradeInfo.message}
          </p>

          <div className="score-panel">
            <div className="score-labels">
              <span>Final score</span>
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
                  ? `${summary.answeredOriginalCount ?? 0} of ${MULTIPLICATION_QUESTION_COUNT} base questions answered`
                  : `${summary.perfectOriginalCount} perfect (out of ${MULTIPLICATION_QUESTION_COUNT})`}
              </span>
            </div>
          </div>

          <div className="study-panels">
            <div className="study-card">
              <div className="study-card-header">
                <BookOpen size={16} />
                <h3>Exercises to study</h3>
              </div>
              {reviewList.length === 0 ? (
                <p className="study-empty">
                  {isAbandoned
                    ? 'No missed exercises have been recorded in this attempt yet.'
                    : 'Excellent: there were no missed exercises in this test.'}
                </p>
              ) : (
                <div className="exercise-tags">
                  {reviewList.map((exercise) => (
                    <span key={exercise.key} className="exercise-tag">
                      {exercise.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {isAbandoned && (
              <div className="study-card">
                <div className="study-card-header">
                  <Clock3 size={16} />
                  <h3>Pending when abandoned</h3>
                </div>
                {pendingList.length === 0 ? (
                  <p className="study-empty">No base questions were left pending.</p>
                ) : (
                  <div className="exercise-tags">
                    {pendingList.map((exercise) => (
                      <span key={exercise.key} className="exercise-tag pending">
                        {exercise.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
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
            <span>{saveMessage || 'Result ready.'}</span>
          </div>

          <div className="results-actions">
            <button type="button" className="btn btn-primary" onClick={startGame}>
              <RotateCcw size={16} />
              <span>Play again</span>
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleBackToTests}>
              <ArrowLeft size={16} />
              <span>Back to test types</span>
            </button>
          </div>
        </div>
      </section>
    )
  }

  const currentQuestion = queue[0]
  const progressPercentage = Math.round((perfectOriginalCount / MULTIPLICATION_QUESTION_COUNT) * 100)
  const currentPotentialPoints = currentQuestion?.isRetry ? 0 : calculatePoints(attemptsOnCurrent)

  return (
    <section className={`game-shell ${isFullscreen ? 'is-fullscreen' : ''}`}>
      <CoinBurst visible={showCoinAnimation} />

      <div className="game-topbar">
        <div className="hud-pill">
          <span className="hud-label">Points</span>
          <strong>x{String(totalScore).padStart(3, '0')}</strong>
        </div>

        <div className="hud-progress">
          <div className="hud-row">
            <span>Hello, {studentName || 'Student'}</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
          </div>
          <small>
            Math World 1 · Questions in queue: {queue.length}
          </small>
          <TestLeaderboardChip topRecord={topTestRecord} />
        </div>

        <div className="hud-actions">
          <button
            type="button"
            className="btn btn-ghost icon-only"
            onClick={() => void handleFullscreenToggle()}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button
            type="button"
            className="btn btn-ghost icon-only"
            onClick={() => setSoundEnabled((value) => !value)}
            aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            type="button"
            className="btn btn-danger-soft"
            onClick={handleAbandonTest}
            disabled={saveStatus === 'saving' || feedback === 'correct'}
            title="Save partial result and leave the test"
          >
            <ArrowLeft size={16} />
            <span>Leave test</span>
          </button>
        </div>
      </div>

      {currentQuestion ? (
        <div className="game-board">
          <div className="stars-row" aria-label="Possible points for this question">
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
              <span className="badge badge-soon">Reinforcement (0 pts)</span>
            ) : (
              <span className="badge badge-live">Scored question</span>
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
      ) : (
        <div className="game-board">
          <div className="empty-state">
            <div className="spinner" aria-hidden="true" />
            <p>Loading test...</p>
          </div>
        </div>
      )}
    </section>
  )
}

function WordProblemsChallenge({ onBack, onSaveResult, studentName, topTestRecord }) {
  const questionCount = WORD_PROBLEM_QUESTION_COUNT

  const [phase, setPhase] = useState('playing')
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
  const [reviewProblems, setReviewProblems] = useState([])
  const [currentExplanationText, setCurrentExplanationText] = useState('')

  const clearFeedbackTimerRef = useRef(null)
  const advanceTimerRef = useRef(null)
  const coinTimerRef = useRef(null)
  const speechTimerRef = useRef(null)
  const finishInProgressRef = useRef(false)
  const autoStartRef = useRef(false)
  const reviewProblemsRef = useRef([])
  const speechSequenceTokenRef = useRef(Symbol('word-problem-speech-seq'))

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
      if (speechTimerRef.current) window.clearTimeout(speechTimerRef.current)
      speechSequenceTokenRef.current = Symbol('word-problem-speech-seq')
      stopSpeechPlayback()
      document.removeEventListener('fullscreenchange', syncFullscreenState)
    }
  }, [])

  useLayoutEffect(() => {
    if (autoStartRef.current) return
    autoStartRef.current = true
    startGame({ playStartSound: false })
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
    if (speechTimerRef.current) {
      window.clearTimeout(speechTimerRef.current)
      speechTimerRef.current = null
    }
    speechSequenceTokenRef.current = Symbol('word-problem-speech-seq')
  }

  function speakProblemNarration(question, enabledOverride = soundEnabled) {
    if (!question) return false
    const storyLines = splitStoryTextIntoSentences(question.storyText)
    const promptLines = splitStoryTextIntoSentences(question.questionPrompt)
    const segments = [...storyLines, 'Question.', ...promptLines]
    return speakTextSequence(
      segments,
      WORD_PROBLEM_VOICE_LANG,
      enabledOverride,
      {
      cancelFirst: true,
      runTokenRef: speechSequenceTokenRef,
      preferGoogle: true,
      rate: 0.79,
      pauseMs: 220,
      },
    )
  }

  function speakExplanationNarration(question, options = {}, enabledOverride = soundEnabled) {
    if (!question?.explanation) return false
    const explanationLines = splitStoryTextIntoSentences(question.explanation)
    return speakTextSequence(explanationLines, WORD_PROBLEM_VOICE_LANG, enabledOverride, {
      cancelFirst: options.cancelFirst ?? true,
      runTokenRef: speechSequenceTokenRef,
      onDone: options.onDone,
      preferGoogle: true,
      rate: 0.8,
      pauseMs: 180,
    })
  }

  function queueProblemNarration(question) {
    if (!question) return
    if (speechTimerRef.current) window.clearTimeout(speechTimerRef.current)
    speechTimerRef.current = window.setTimeout(() => {
      speechTimerRef.current = null
      void speakProblemNarration(question)
    }, 140)
  }

  function setupQuestion(question) {
    if (!question) {
      setCurrentOptions([])
      setAttemptsOnCurrent(0)
      setFeedback(null)
      setCurrentExplanationText('')
      return
    }

    setCurrentOptions(question.options.map((value) => ({ value, isHidden: false })))
    setAttemptsOnCurrent(0)
    setFeedback(null)
    setCurrentExplanationText('')
    queueProblemNarration(question)
  }

  function addReviewProblem(question) {
    if (!question || question.isRetry) return
    const nextList = mergeExerciseRecords(reviewProblemsRef.current, [wordProblemRecordFromQuestion(question)])
    reviewProblemsRef.current = nextList
    setReviewProblems(nextList)
  }

  async function enterFullscreenMode() {
    if (typeof document === 'undefined') return
    if (document.fullscreenElement) return
    if (!document.documentElement?.requestFullscreen) return

    try {
      await document.documentElement.requestFullscreen()
    } catch (error) {
      console.warn('Could not enter fullscreen mode:', error)
    }
  }

  async function exitFullscreenMode() {
    if (typeof document === 'undefined') return
    if (!document.fullscreenElement || !document.exitFullscreen) return

    try {
      await document.exitFullscreen()
    } catch (error) {
      console.warn('Could not exit fullscreen mode:', error)
    }
  }

  function handleBackToTests() {
    void (async () => {
      speechSequenceTokenRef.current = Symbol('word-problem-speech-seq')
      stopSpeechPlayback()
      await exitFullscreenMode()
      onBack()
    })()
  }

  function startGame(options = {}) {
    const shouldPlayStartSound = options.playStartSound ?? true
    clearTimers()
    speechSequenceTokenRef.current = Symbol('word-problem-speech-seq')
    stopSpeechPlayback()
    finishInProgressRef.current = false
    if (shouldPlayStartSound) {
      playSound('start', soundEnabled)
    }
    void enterFullscreenMode()

    const initialQueue = generateWordProblemQuestions(questionCount)
    setQueue(initialQueue)
    setTotalScore(0)
    setPerfectOriginalCount(0)
    setShowCoinAnimation(false)
    setSaveStatus('idle')
    setSaveMessage('')
    setLastResult(null)
    reviewProblemsRef.current = []
    setReviewProblems([])
    setCurrentExplanationText('')
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
    const answeredOriginalCount = questionCount - remainingOriginalCount
    const pendingExercises = completionMode === 'abandoned' ? getPendingWordProblems(queueSnapshot) : []
    const reviewExercisesSummary = mergeExerciseRecords(
      reviewProblemsRef.current,
      options.extraReviewExercises ?? [],
    )

    clearTimers()
    stopSpeechPlayback()
    setShowCoinAnimation(false)

    if (completionMode === 'completed') {
      playSound('win', soundEnabled)
    } else {
      playSound('bump', soundEnabled)
    }

    const maxScore = questionCount * 5
    const percentage = Math.min(Math.round((finalScore / maxScore) * 100), 100)
    const gradeInfo = getGrade(percentage)

    const summary = {
      subjectId: 'math',
      subjectName: 'Math',
      testId: 'word-problems',
      testName: 'Word Problems',
      mode: 'word-problems',
      languageLabel: 'English',
      totalScore: finalScore,
      maxScore,
      percentage,
      grade: gradeInfo.grade,
      perfectOriginalCount: finalPerfectCount,
      questionCount,
      answeredOriginalCount,
      remainingOriginalCount,
      remainingQueueCount,
      attemptStatus: completionMode,
      isAbandoned: completionMode === 'abandoned',
      reviewExercises: reviewExercisesSummary,
      pendingExercises,
      finishedAtMs: Date.now(),
    }

    setLastResult(summary)
    setPhase('finished')
    setSaveStatus('saving')
    setSaveMessage(
      completionMode === 'abandoned'
        ? 'Saving partial result (remaining questions = 0 pts)...'
        : 'Saving result...',
    )

    try {
      await onSaveResult(summary)
      setSaveStatus('saved')
      setSaveMessage(
        completionMode === 'abandoned'
          ? 'Test abandoned: progress and score saved to Firebase.'
          : 'Result saved to Firebase.',
      )
    } catch (error) {
      setSaveStatus('error')
      setSaveMessage(mapFirebaseError(error, 'save'))
    }
  }

  function advanceAfterCorrect(currentQuestion, nextScore, nextPerfectOriginalCount) {
    const remainingQueue = queue.slice(1)
    const shouldRepeat = attemptsOnCurrent > 0
    let nextQueue = remainingQueue

    if (shouldRepeat) {
      const retryQuestion = {
        ...currentQuestion,
        id: `retry_wp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        options: generateWordProblemOptions(currentQuestion.answer, currentQuestion.operation, currentQuestion.values),
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
  }

  function handleGuess(guessedValue) {
    if (feedback === 'correct') return
    if (phase !== 'playing') return

    const currentQuestion = queue[0]
    if (!currentQuestion) return

    if (speechTimerRef.current) {
      window.clearTimeout(speechTimerRef.current)
      speechTimerRef.current = null
    }
    speechSequenceTokenRef.current = Symbol('word-problem-speech-seq')
    stopSpeechPlayback()

    if (guessedValue === currentQuestion.answer) {
      if (clearFeedbackTimerRef.current) window.clearTimeout(clearFeedbackTimerRef.current)
      playSound('coin', soundEnabled)

      const pointsEarned = currentQuestion.isRetry ? 0 : calculatePoints(attemptsOnCurrent)
      const nextScore = totalScore + pointsEarned

      if (attemptsOnCurrent > 0) {
        addReviewProblem(currentQuestion)
      }

      const isPerfectOriginal = !currentQuestion.isRetry && attemptsOnCurrent === 0
      const nextPerfectOriginalCount = isPerfectOriginal
        ? perfectOriginalCount + 1
        : perfectOriginalCount

      setTotalScore(nextScore)
      setFeedback('correct')
      setCurrentExplanationText(currentQuestion.explanation ?? '')
      setShowCoinAnimation(true)

      if (coinTimerRef.current) window.clearTimeout(coinTimerRef.current)
      coinTimerRef.current = window.setTimeout(() => {
        setShowCoinAnimation(false)
      }, 850)

      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current)

      let advanced = false
      const continueToNext = () => {
        if (advanced) return
        advanced = true
        if (advanceTimerRef.current) {
          window.clearTimeout(advanceTimerRef.current)
          advanceTimerRef.current = null
        }
        advanceAfterCorrect(currentQuestion, nextScore, nextPerfectOriginalCount)
      }

      if (soundEnabled && currentQuestion.explanation) {
        speechTimerRef.current = window.setTimeout(() => {
          speechTimerRef.current = null
          const started = speakExplanationNarration(currentQuestion, {
            cancelFirst: true,
            onDone: continueToNext,
          })
          const fallbackDelay = started
            ? estimateSpeechDurationMs(currentQuestion.explanation) + 700
            : 1100
          advanceTimerRef.current = window.setTimeout(continueToNext, fallbackDelay)
        }, 120)
      } else {
        advanceTimerRef.current = window.setTimeout(continueToNext, 950)
      }

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
      'If you leave the test now, your current score will be saved and all remaining questions will count as 0 points. Do you want to continue?',
    )
    if (!confirmed) return

    const queueSnapshot = [...queue]
    const currentQuestion = queue[0]
    const extraReviewExercises =
      currentQuestion && !currentQuestion.isRetry && attemptsOnCurrent > 0
        ? [wordProblemRecordFromQuestion(currentQuestion)]
        : []

    void finishGame(totalScore, perfectOriginalCount, {
      completionMode: 'abandoned',
      queueSnapshot,
      extraReviewExercises,
    })
  }

  async function handleFullscreenToggle() {
    if (document.fullscreenElement) {
      await exitFullscreenMode()
      return
    }
    await enterFullscreenMode()
  }

  function handleSoundToggle() {
    setSoundEnabled((value) => {
      const next = !value
      if (!next) {
        speechSequenceTokenRef.current = Symbol('word-problem-speech-seq')
        if (speechTimerRef.current) {
          window.clearTimeout(speechTimerRef.current)
          speechTimerRef.current = null
        }
        stopSpeechPlayback()
      } else if (queue[0]) {
        if (speechTimerRef.current) {
          window.clearTimeout(speechTimerRef.current)
        }
        speechTimerRef.current = window.setTimeout(() => {
          speechTimerRef.current = null
          void speakProblemNarration(queue[0], true)
        }, 80)
      }
      return next
    })
  }

  function handleReplayProblem() {
    const currentQuestion = queue[0]
    if (!currentQuestion) return
    if (speechTimerRef.current) {
      window.clearTimeout(speechTimerRef.current)
      speechTimerRef.current = null
    }
    void speakProblemNarration(currentQuestion)
  }

  function handleReplayExplanation() {
    const currentQuestion = queue[0]
    if (!currentQuestion || !currentQuestion.explanation) return
    if (feedback !== 'correct') return
    if (speechTimerRef.current) {
      window.clearTimeout(speechTimerRef.current)
      speechTimerRef.current = null
    }
    void speakExplanationNarration(currentQuestion, { cancelFirst: true })
  }

  if (phase === 'finished') {
    const summary = lastResult ?? {
      totalScore,
      maxScore: questionCount * 5,
      percentage: 0,
      grade: 'F',
      perfectOriginalCount,
      questionCount,
      reviewExercises: reviewProblems,
      pendingExercises: [],
    }
    const gradeInfo = getGrade(summary.percentage)
    const isAbandoned = summary.attemptStatus === 'abandoned'
    const reviewList = summary.reviewExercises ?? []
    const pendingList = summary.pendingExercises ?? []

    return (
      <section className={`game-shell ${isFullscreen ? 'is-fullscreen' : ''}`}>
        <div className="results-card">
          <div className={`results-trophy ${gradeInfo.color}`}>
            {isAbandoned ? <CircleAlert size={34} /> : <Trophy size={34} />}
          </div>
          <h1 className={`results-grade ${gradeInfo.color}`}>{summary.grade}</h1>
          <p className="results-message">
            {isAbandoned
              ? 'Test abandoned. Progress was saved with the current score.'
              : gradeInfo.message}
          </p>

          <div className="story-result-chip">
            <MessageSquareText size={14} />
            <span>Math · Word Problems</span>
          </div>

          <div className="score-panel">
            <div className="score-labels">
              <span>Final score</span>
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
                  ? `${summary.answeredOriginalCount ?? 0} of ${summary.questionCount ?? questionCount} base questions answered`
                  : `${summary.perfectOriginalCount} perfect (out of ${summary.questionCount ?? questionCount})`}
              </span>
            </div>
          </div>

          <div className="study-panels">
            <div className="study-card">
              <div className="study-card-header">
                <BookOpen size={16} />
                <h3>Problems to review</h3>
              </div>
              {reviewList.length === 0 ? (
                <p className="study-empty">
                  {isAbandoned
                    ? 'No missed problems have been recorded in this attempt yet.'
                    : 'Excellent: there were no missed problems in this test.'}
                </p>
              ) : (
                <div className="exercise-tags">
                  {reviewList.map((item) => (
                    <span key={item.key} className="exercise-tag review-long">
                      {item.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {isAbandoned && (
              <div className="study-card">
                <div className="study-card-header">
                  <Clock3 size={16} />
                  <h3>Problems pending when left</h3>
                </div>
                {pendingList.length === 0 ? (
                  <p className="study-empty">No base problems were left pending.</p>
                ) : (
                  <div className="exercise-tags">
                    {pendingList.map((item) => (
                      <span key={item.key} className="exercise-tag pending review-long">
                        {item.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
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
            <span>{saveMessage || 'Result ready.'}</span>
          </div>

          <div className="results-actions">
            <button type="button" className="btn btn-primary" onClick={startGame}>
              <RotateCcw size={16} />
              <span>New word problems</span>
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleBackToTests}>
              <ArrowLeft size={16} />
              <span>Back to test types</span>
            </button>
          </div>
        </div>
      </section>
    )
  }

  const currentQuestion = queue[0]
  const progressPercentage = Math.round((perfectOriginalCount / questionCount) * 100)
  const currentPotentialPoints = currentQuestion?.isRetry ? 0 : calculatePoints(attemptsOnCurrent)

  return (
    <section className={`game-shell ${isFullscreen ? 'is-fullscreen' : ''}`}>
      <CoinBurst visible={showCoinAnimation} />

      <div className="game-topbar">
        <div className="hud-pill">
          <span className="hud-label">Points</span>
          <strong>x{String(totalScore).padStart(3, '0')}</strong>
        </div>

        <div className="hud-progress">
          <div className="hud-row">
            <span>Hello, {studentName || 'Student'}</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
          </div>
          <small>Math · Word Problems · Questions in queue: {queue.length}</small>
          <TestLeaderboardChip topRecord={topTestRecord} />
        </div>

        <div className="hud-actions">
          <button
            type="button"
            className="btn btn-ghost icon-only"
            onClick={() => void handleFullscreenToggle()}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button
            type="button"
            className="btn btn-ghost icon-only"
            onClick={handleSoundToggle}
            aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            type="button"
            className="btn btn-danger-soft"
            onClick={handleAbandonTest}
            disabled={saveStatus === 'saving' || feedback === 'correct'}
            title="Save partial result and leave the test"
          >
            <ArrowLeft size={16} />
            <span>Leave test</span>
          </button>
        </div>
      </div>

      {currentQuestion ? (
        <div className="game-board reading-board">
          <div className="story-card">
            <div className="story-card-header">
              <div className="story-card-title">
                <MessageSquareText size={18} />
                <div>
                  <small>Math story problem</small>
                  <h3>{currentQuestion.operationLabel}</h3>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className={currentQuestion.isRetry ? 'badge badge-soon' : 'badge badge-live'}>
                  {currentQuestion.isRetry ? 'Reinforcement (0 pts)' : 'Scored question'}
                </span>
                <span className="badge badge-live">{questionCount} questions</span>
              </div>
            </div>
            <div className="story-card-body">
              <p>{currentQuestion.storyText}</p>
            </div>
            <div className="story-start-actions">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleReplayProblem}
                disabled={!soundEnabled}
                title={soundEnabled ? 'Hear the story and question again' : 'Enable sound first'}
              >
                <Volume2 size={16} />
                <span>{soundEnabled ? 'Hear problem again' : 'Sound is muted'}</span>
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleReplayExplanation}
                disabled={!soundEnabled || feedback !== 'correct'}
                title={
                  !soundEnabled
                    ? 'Enable sound first'
                    : feedback === 'correct'
                      ? 'Hear the explanation again'
                      : 'Answer correctly to hear the explanation'
                }
              >
                <BookOpen size={16} />
                <span>Hear explanation</span>
              </button>
            </div>
          </div>

          <div className="stars-row" aria-label="Possible points for this question">
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
            <span className="badge badge-live">Choose the best answer</span>
          </div>

          <div className={`question-card reading-question-card ${feedback ? `feedback-${feedback}` : ''}`}>
            <div className="reading-question-content">
              <span className="reading-question-kicker">Question</span>
              <p>{currentQuestion.questionPrompt}</p>
            </div>
          </div>

          {feedback === 'correct' && currentExplanationText && (
            <div className="story-start-panel">
              <p>
                <strong>How we solved it:</strong> {currentExplanationText}
              </p>
            </div>
          )}

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
      ) : (
        <div className="game-board">
          <div className="empty-state">
            <div className="spinner" aria-hidden="true" />
            <p>Loading word problems...</p>
          </div>
        </div>
      )}
    </section>
  )
}

function ReadingChallenge({ onBack, onSaveResult, studentName, testConfig, topTestRecord }) {
  const config = testConfig ?? READING_TEST_CONFIGS['reading-english']

  const [phase, setPhase] = useState('reading')
  const [story, setStory] = useState(null)
  const [queue, setQueue] = useState([])
  const [currentOptions, setCurrentOptions] = useState([])
  const [attemptsOnCurrent, setAttemptsOnCurrent] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [totalScore, setTotalScore] = useState(0)
  const [perfectOriginalCount, setPerfectOriginalCount] = useState(0)
  const [showCoinAnimation, setShowCoinAnimation] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const [lastResult, setLastResult] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [reviewQuestions, setReviewQuestions] = useState([])

  const clearFeedbackTimerRef = useRef(null)
  const advanceTimerRef = useRef(null)
  const coinTimerRef = useRef(null)
  const finishInProgressRef = useRef(false)
  const autoStartRef = useRef(false)
  const reviewQuestionsRef = useRef([])

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

  useLayoutEffect(() => {
    if (autoStartRef.current) return
    autoStartRef.current = true
    startGame({ playStartSound: false })
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
    if (!question) {
      setCurrentOptions([])
      setAttemptsOnCurrent(0)
      setFeedback(null)
      return
    }
    setCurrentOptions(question.options.map((value) => ({ value, isHidden: false })))
    setAttemptsOnCurrent(0)
    setFeedback(null)
  }

  function addReviewQuestion(question) {
    if (!question || question.isRetry) return

    const nextList = mergeExerciseRecords(reviewQuestionsRef.current, [readingQuestionRecordFromQuestion(question)])
    reviewQuestionsRef.current = nextList
    setReviewQuestions(nextList)
  }

  async function enterFullscreenMode() {
    if (typeof document === 'undefined') return
    if (document.fullscreenElement) return
    if (!document.documentElement?.requestFullscreen) return

    try {
      await document.documentElement.requestFullscreen()
    } catch (error) {
      console.warn('Could not enter fullscreen mode:', error)
    }
  }

  async function exitFullscreenMode() {
    if (typeof document === 'undefined') return
    if (!document.fullscreenElement || !document.exitFullscreen) return

    try {
      await document.exitFullscreen()
    } catch (error) {
      console.warn('Could not exit fullscreen mode:', error)
    }
  }

  function handleBackToTests() {
    void (async () => {
      await exitFullscreenMode()
      onBack()
    })()
  }

  function startGame(options = {}) {
    const shouldPlayStartSound = options.playStartSound ?? true
    clearTimers()
    finishInProgressRef.current = false
    if (shouldPlayStartSound) {
      playSound('start', true)
    }
    void enterFullscreenMode()

    const nextStory = getNextReadingStory(config)
    const initialQueue = generateReadingQuestions(nextStory, config.testId, READING_QUESTION_COUNT)
    const storyWithParagraph = nextStory
      ? {
          ...nextStory,
          displayParagraph: buildExpandedReadingParagraph(nextStory, config.languageLabel),
        }
      : null

    setStory(storyWithParagraph)
    setQueue(initialQueue)
    setTotalScore(0)
    setPerfectOriginalCount(0)
    setShowCoinAnimation(false)
    setSaveStatus('idle')
    setSaveMessage('')
    setLastResult(null)
    reviewQuestionsRef.current = []
    setReviewQuestions([])
    setupQuestion(initialQueue[0])
    setPhase('reading')
  }

  function beginQuestions() {
    if (!story || !queue.length) return
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
    const answeredOriginalCount = READING_QUESTION_COUNT - remainingOriginalCount
    const pendingExercises = completionMode === 'abandoned' ? getPendingReadingQuestions(queueSnapshot) : []
    const reviewExercisesSummary = mergeExerciseRecords(
      reviewQuestionsRef.current,
      options.extraReviewExercises ?? [],
    )

    clearTimers()
    setShowCoinAnimation(false)

    if (completionMode === 'completed') {
      playSound('win', true)
    } else {
      playSound('bump', true)
    }

    const maxScore = READING_QUESTION_COUNT * 5
    const percentage = Math.min(Math.round((finalScore / maxScore) * 100), 100)
    const gradeInfo = getGrade(percentage)

    const summary = {
      subjectId: config.subjectId,
      subjectName: config.subjectName,
      testId: config.testId,
      testName: config.testName,
      mode: 'reading',
      languageLabel: config.languageLabel,
      storyId: story?.id ?? null,
      storyTitle: story?.title ?? null,
      totalScore: finalScore,
      maxScore,
      percentage,
      grade: gradeInfo.grade,
      perfectOriginalCount: finalPerfectCount,
      questionCount: READING_QUESTION_COUNT,
      answeredOriginalCount,
      remainingOriginalCount,
      remainingQueueCount,
      attemptStatus: completionMode,
      isAbandoned: completionMode === 'abandoned',
      reviewExercises: reviewExercisesSummary,
      pendingExercises,
      finishedAtMs: Date.now(),
    }

    setLastResult(summary)
    setPhase('finished')
    setSaveStatus('saving')
    setSaveMessage(
      completionMode === 'abandoned'
        ? 'Saving partial result (remaining questions = 0 pts)...'
        : 'Saving result...',
    )

    try {
      await onSaveResult(summary)
      setSaveStatus('saved')
      setSaveMessage(
        completionMode === 'abandoned'
          ? 'Test abandoned: progress and score saved to Firebase.'
          : 'Result saved to Firebase.',
      )
    } catch (error) {
      setSaveStatus('error')
      setSaveMessage(mapFirebaseError(error, 'save'))
    }
  }

  function handleGuess(guessedValue) {
    if (feedback === 'correct') return
    if (phase !== 'playing') return
    const currentQuestion = queue[0]
    if (!currentQuestion) return

    if (guessedValue === currentQuestion.answer) {
      if (clearFeedbackTimerRef.current) window.clearTimeout(clearFeedbackTimerRef.current)
      playSound('coin', true)

      const pointsEarned = currentQuestion.isRetry ? 0 : calculatePoints(attemptsOnCurrent)
      const nextScore = totalScore + pointsEarned

      if (attemptsOnCurrent > 0) {
        addReviewQuestion(currentQuestion)
      }

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
            id: `retry_read_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            options: shuffleArray([...currentQuestion.options]),
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

    playSound('bump', true)
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
    if (!queue.length) return
    if (feedback === 'correct') return
    if (finishInProgressRef.current) return

    const confirmed = window.confirm(
      'If you leave the test now, your current score will be saved and all remaining questions will count as 0 points. Do you want to continue?',
    )

    if (!confirmed) return

    const queueSnapshot = [...queue]
    const currentQuestion = queue[0]
    const extraReviewExercises =
      phase === 'playing' && currentQuestion && !currentQuestion.isRetry && attemptsOnCurrent > 0
        ? [readingQuestionRecordFromQuestion(currentQuestion)]
        : []

    void finishGame(totalScore, perfectOriginalCount, {
      completionMode: 'abandoned',
      queueSnapshot,
      extraReviewExercises,
    })
  }

  async function handleFullscreenToggle() {
    if (document.fullscreenElement) {
      await exitFullscreenMode()
      return
    }

    await enterFullscreenMode()
  }

  if (phase === 'finished') {
    const summary = lastResult ?? {
      totalScore,
      maxScore: READING_QUESTION_COUNT * 5,
      percentage: 0,
      grade: 'F',
      perfectOriginalCount,
      questionCount: READING_QUESTION_COUNT,
      reviewExercises: reviewQuestions,
      pendingExercises: [],
      storyTitle: story?.title ?? null,
    }
    const gradeInfo = getGrade(summary.percentage)
    const isAbandoned = summary.attemptStatus === 'abandoned'
    const reviewList = summary.reviewExercises ?? []
    const pendingList = summary.pendingExercises ?? []

    return (
      <section className={`game-shell ${isFullscreen ? 'is-fullscreen' : ''}`}>
        <div className="results-card">
          <div className={`results-trophy ${gradeInfo.color}`}>
            {isAbandoned ? <CircleAlert size={34} /> : <Trophy size={34} />}
          </div>
          <h1 className={`results-grade ${gradeInfo.color}`}>{summary.grade}</h1>
          <p className="results-message">
            {isAbandoned
              ? 'Test abandoned. Progress was saved with the current score.'
              : gradeInfo.message}
          </p>

          {summary.storyTitle && (
            <div className="story-result-chip">
              <BookOpen size={14} />
              <span>{summary.storyTitle}</span>
            </div>
          )}

          <div className="score-panel">
            <div className="score-labels">
              <span>Final score</span>
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
                  ? `${summary.answeredOriginalCount ?? 0} of ${READING_QUESTION_COUNT} questions answered`
                  : `${summary.perfectOriginalCount} perfect (out of ${READING_QUESTION_COUNT})`}
              </span>
            </div>
          </div>

          <div className="study-panels">
            <div className="study-card">
              <div className="study-card-header">
                <BookOpen size={16} />
                <h3>Questions to review</h3>
              </div>
              {reviewList.length === 0 ? (
                <p className="study-empty">
                  {isAbandoned
                    ? 'No missed questions have been recorded in this attempt yet.'
                    : 'Excellent: there were no missed questions in this test.'}
                </p>
              ) : (
                <div className="exercise-tags">
                  {reviewList.map((item) => (
                    <span key={item.key} className="exercise-tag review-long">
                      {item.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {isAbandoned && (
              <div className="study-card">
                <div className="study-card-header">
                  <Clock3 size={16} />
                  <h3>Questions pending when left</h3>
                </div>
                {pendingList.length === 0 ? (
                  <p className="study-empty">No base questions were left pending.</p>
                ) : (
                  <div className="exercise-tags">
                    {pendingList.map((item) => (
                      <span key={item.key} className="exercise-tag pending review-long">
                        {item.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
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
            <span>{saveMessage || 'Result ready.'}</span>
          </div>

          <div className="results-actions">
            <button type="button" className="btn btn-primary" onClick={startGame}>
              <RotateCcw size={16} />
              <span>Read another story</span>
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleBackToTests}>
              <ArrowLeft size={16} />
              <span>Back to test types</span>
            </button>
          </div>
        </div>
      </section>
    )
  }

  const currentQuestion = queue[0]
  const progressPercentage = Math.round((perfectOriginalCount / READING_QUESTION_COUNT) * 100)
  const currentPotentialPoints = currentQuestion?.isRetry ? 0 : calculatePoints(attemptsOnCurrent)

  return (
    <section className={`game-shell ${isFullscreen ? 'is-fullscreen' : ''}`}>
      <CoinBurst visible={showCoinAnimation} />

      <div className="game-topbar">
        <div className="hud-pill">
          <span className="hud-label">Points</span>
          <strong>x{String(totalScore).padStart(3, '0')}</strong>
        </div>

        <div className="hud-progress">
          <div className="hud-row">
            <span>Hello, {studentName || 'Student'}</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
          </div>
          <small>
            Reading · {config.languageLabel} · Questions in queue: {queue.length}
          </small>
          <TestLeaderboardChip topRecord={topTestRecord} />
        </div>

        <div className="hud-actions">
          <button
            type="button"
            className="btn btn-ghost icon-only"
            onClick={() => void handleFullscreenToggle()}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button
            type="button"
            className="btn btn-danger-soft"
            onClick={handleAbandonTest}
            disabled={saveStatus === 'saving' || feedback === 'correct'}
            title="Save partial result and leave the test"
          >
            <ArrowLeft size={16} />
            <span>Leave test</span>
          </button>
        </div>
      </div>

      <div className="game-board reading-board">
        {story ? (
          <div className="story-card">
            <div className="story-card-header">
              <div className="story-card-title">
                <BookOpen size={18} />
                <div>
                  <small>{config.languageLabel} story</small>
                  <h3>{story.title}</h3>
                </div>
              </div>
              <span className="badge badge-live">{READING_QUESTION_COUNT} questions</span>
            </div>
            <div className="story-card-body">
              <p>{story.displayParagraph || story.paragraphs?.join(' ')}</p>
            </div>
          </div>
        ) : (
          <div className="empty-state">
            <div className="spinner" aria-hidden="true" />
            <p>Loading story...</p>
          </div>
        )}

        {phase === 'reading' ? (
          <div className="story-start-panel">
            <p>Read the story carefully. The quiz has 5 questions about this story.</p>
            <div className="story-start-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={beginQuestions}
                disabled={!story || !queue.length}
              >
                <BookOpen size={16} />
                <span>Start questions</span>
              </button>
              <button type="button" className="btn btn-ghost" onClick={startGame}>
                <RotateCcw size={16} />
                <span>New story</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {currentQuestion ? (
              <>
                <div className="stars-row" aria-label="Possible points for this question">
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
                    <span className="badge badge-soon">Reinforcement (0 pts)</span>
                  ) : (
                    <span className="badge badge-live">Scored question</span>
                  )}
                </div>

                <div className={`question-card reading-question-card ${feedback ? `feedback-${feedback}` : ''}`}>
                  <div className="reading-question-content">
                    <span className="reading-question-kicker">Question</span>
                    <p>{currentQuestion.prompt}</p>
                  </div>
                </div>

                <div className="answers-grid">
                  {currentOptions.map((option, index) => (
                    <button
                      key={`${currentQuestion.id}_${index}`}
                      type="button"
                      className={`answer-btn answer-text ${option.isHidden ? 'is-hidden' : ''}`}
                      disabled={option.isHidden || feedback === 'correct'}
                      onClick={() => handleGuess(option.value)}
                    >
                      {option.value}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <div className="spinner" aria-hidden="true" />
                <p>Loading questions...</p>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

function SpellingChallenge({ onBack, onSaveResult, studentName, testConfig, topTestRecord }) {
  const config = testConfig ?? SPELLING_TEST_CONFIGS['spelling-english']
  const isPastTenseMode = config.mode === 'past-tense'
  const baseQuestionCount = config.questionCount ?? 15

  const [phase, setPhase] = useState('playing')
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
  const [reviewWords, setReviewWords] = useState([])

  const clearFeedbackTimerRef = useRef(null)
  const advanceTimerRef = useRef(null)
  const coinTimerRef = useRef(null)
  const speechTimerRef = useRef(null)
  const finishInProgressRef = useRef(false)
  const autoStartRef = useRef(false)
  const reviewWordsRef = useRef([])
  const speechSequenceTokenRef = useRef(Symbol('spelling-speech-seq'))
  const reviewAutoplayDoneRef = useRef(false)

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
      if (speechTimerRef.current) window.clearTimeout(speechTimerRef.current)
      speechSequenceTokenRef.current = Symbol('spelling-speech-seq')
      stopSpeechPlayback()
      document.removeEventListener('fullscreenchange', syncFullscreenState)
    }
  }, [])

  useLayoutEffect(() => {
    if (autoStartRef.current) return
    autoStartRef.current = true
    startGame({ playStartSound: false })
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
    if (speechTimerRef.current) {
      window.clearTimeout(speechTimerRef.current)
      speechTimerRef.current = null
    }
    speechSequenceTokenRef.current = Symbol('spelling-speech-seq')
  }

  function speakCurrentWord(question) {
    const spokenWord = question?.baseWord || question?.word
    if (!spokenWord) return
    speakDictationWord(spokenWord, config.voiceLang, soundEnabled)
  }

  function queueWordSpeech(question) {
    if (!question?.word) return
    if (speechTimerRef.current) window.clearTimeout(speechTimerRef.current)
    speechTimerRef.current = window.setTimeout(() => {
      speakCurrentWord(question)
    }, 120)
  }

  function setupQuestion(question) {
    setCurrentOptions(question.options.map((value) => ({ value, isHidden: false })))
    setAttemptsOnCurrent(0)
    setFeedback(null)
    queueWordSpeech(question)
  }

  function addReviewWord(question) {
    if (!question || question.isRetry) return

    const nextList = mergeExerciseRecords(reviewWordsRef.current, [spellingRecordFromQuestion(question)])
    reviewWordsRef.current = nextList
    setReviewWords(nextList)
  }

  async function enterFullscreenMode() {
    if (typeof document === 'undefined') return
    if (document.fullscreenElement) return
    if (!document.documentElement?.requestFullscreen) return

    try {
      await document.documentElement.requestFullscreen()
    } catch (error) {
      console.warn('Could not enter fullscreen mode:', error)
    }
  }

  async function exitFullscreenMode() {
    if (typeof document === 'undefined') return
    if (!document.fullscreenElement || !document.exitFullscreen) return

    try {
      await document.exitFullscreen()
    } catch (error) {
      console.warn('Could not exit fullscreen mode:', error)
    }
  }

  function handleBackToTests() {
    void (async () => {
      speechSequenceTokenRef.current = Symbol('spelling-speech-seq')
      stopSpeechPlayback()
      await exitFullscreenMode()
      onBack()
    })()
  }

  function startGame(options = {}) {
    const shouldPlayStartSound = options.playStartSound ?? true
    clearTimers()
    speechSequenceTokenRef.current = Symbol('spelling-speech-seq')
    stopSpeechPlayback()
    finishInProgressRef.current = false
    if (shouldPlayStartSound) {
      playSound('start', soundEnabled)
    }
    void enterFullscreenMode()
    const initialQueue = generateSpellingQuestions(config, baseQuestionCount)
    setQueue(initialQueue)
    setTotalScore(0)
    setPerfectOriginalCount(0)
    setShowCoinAnimation(false)
    setSaveStatus('idle')
    setSaveMessage('')
    setLastResult(null)
    reviewWordsRef.current = []
    reviewAutoplayDoneRef.current = false
    setReviewWords([])
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
    const answeredOriginalCount = baseQuestionCount - remainingOriginalCount
    const pendingExercises = completionMode === 'abandoned' ? getPendingSpellingWords(queueSnapshot) : []
    const reviewExercisesSummary = mergeExerciseRecords(
      reviewWordsRef.current,
      options.extraReviewExercises ?? [],
    )

    clearTimers()
    speechSequenceTokenRef.current = Symbol('spelling-speech-seq')
    stopSpeechPlayback()
    setShowCoinAnimation(false)

    if (completionMode === 'completed') {
      playSound('win', soundEnabled)
    } else {
      playSound('bump', soundEnabled)
    }

    const maxScore = baseQuestionCount * 5
    const percentage = Math.min(Math.round((finalScore / maxScore) * 100), 100)
    const gradeInfo = getGrade(percentage)

    const summary = {
      subjectId: config.subjectId,
      subjectName: config.subjectName,
      testId: config.testId,
      testName: config.testName,
      mode: 'spelling',
      languageLabel: config.languageLabel,
      totalScore: finalScore,
      maxScore,
      percentage,
      grade: gradeInfo.grade,
      perfectOriginalCount: finalPerfectCount,
      questionCount: baseQuestionCount,
      answeredOriginalCount,
      remainingOriginalCount,
      remainingQueueCount,
      attemptStatus: completionMode,
      isAbandoned: completionMode === 'abandoned',
      reviewExercises: reviewExercisesSummary,
      pendingExercises,
      finishedAtMs: Date.now(),
    }

    setLastResult(summary)
    setPhase('finished')
    setSaveStatus('saving')
    setSaveMessage(
      completionMode === 'abandoned'
        ? 'Saving partial result (remaining questions = 0 pts)...'
        : 'Saving result...',
    )

    try {
      await onSaveResult(summary)
      setSaveStatus('saved')
      setSaveMessage(
        completionMode === 'abandoned'
          ? 'Test abandoned: progress and score saved to Firebase.'
          : 'Result saved to Firebase.',
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

    if (speechTimerRef.current) {
      window.clearTimeout(speechTimerRef.current)
      speechTimerRef.current = null
    }
    stopSpeechPlayback()

    if (guessedValue === currentQuestion.answer) {
      if (clearFeedbackTimerRef.current) window.clearTimeout(clearFeedbackTimerRef.current)
      playSound('coin', soundEnabled)
      if (isPastTenseMode) {
        if (speechTimerRef.current) {
          window.clearTimeout(speechTimerRef.current)
        }
        speechTimerRef.current = window.setTimeout(() => {
          speakDictationWord(currentQuestion.answer, config.voiceLang, soundEnabled)
          speechTimerRef.current = null
        }, 90)
      }

      const pointsEarned = currentQuestion.isRetry ? 0 : calculatePoints(attemptsOnCurrent)
      const nextScore = totalScore + pointsEarned

      if (attemptsOnCurrent > 0) {
        addReviewWord(currentQuestion)
      }

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
          const nextOptions = isPastTenseMode
            ? generatePastTenseOptions(currentQuestion.baseWord || currentQuestion.word).options
            : generateSpellingOptions(currentQuestion.answer, config.testId)
          const retryQuestion = {
            ...currentQuestion,
            id: `retry_word_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            options: nextOptions,
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
      'If you leave the test now, your current score will be saved and all remaining questions will count as 0 points. Do you want to continue?',
    )

    if (!confirmed) return

    const queueSnapshot = [...queue]
    const currentQuestion = queue[0]
    const extraReviewExercises =
      currentQuestion && !currentQuestion.isRetry && attemptsOnCurrent > 0
        ? [spellingRecordFromQuestion(currentQuestion)]
        : []

    void finishGame(totalScore, perfectOriginalCount, {
      completionMode: 'abandoned',
      queueSnapshot,
      extraReviewExercises,
    })
  }

  async function handleFullscreenToggle() {
    if (document.fullscreenElement) {
      await exitFullscreenMode()
      return
    }

    await enterFullscreenMode()
  }

  function handleSoundToggle() {
    setSoundEnabled((value) => {
      const next = !value
      if (!next) {
        speechSequenceTokenRef.current = Symbol('spelling-speech-seq')
        if (speechTimerRef.current) {
          window.clearTimeout(speechTimerRef.current)
          speechTimerRef.current = null
        }
        stopSpeechPlayback()
      } else if (queue[0]?.word) {
        if (speechTimerRef.current) {
          window.clearTimeout(speechTimerRef.current)
        }
        speechTimerRef.current = window.setTimeout(() => {
          speakCurrentWord(queue[0])
          speechTimerRef.current = null
        }, 80)
      }
      return next
    })
  }

  function handleReplayWord() {
    speakCurrentWord(queue[0])
  }

  function playPastTenseReviewAudio(items, options = {}) {
    if (!isPastTenseMode) return false

    const lines = []
    items.forEach((item) => {
      if (item?.baseWord) lines.push(item.baseWord)
      if (item?.word) lines.push(item.word)
    })

    return speakTextSequence(lines, config.voiceLang, soundEnabled, {
      cancelFirst: options.cancelFirst ?? true,
      runTokenRef: speechSequenceTokenRef,
      onDone: options.onDone,
    })
  }

  useEffect(() => {
    if (!isPastTenseMode) return
    if (phase !== 'finished') return
    if (reviewAutoplayDoneRef.current) return

    const reviewList = (lastResult?.reviewExercises ?? reviewWords).filter((item) => item?.baseWord && item?.word)
    if (!reviewList.length) return

    reviewAutoplayDoneRef.current = true

    if (speechTimerRef.current) {
      window.clearTimeout(speechTimerRef.current)
      speechTimerRef.current = null
    }

    speechTimerRef.current = window.setTimeout(() => {
      playPastTenseReviewAudio(reviewList, { cancelFirst: true })
    }, 950)

    return () => {
      if (speechTimerRef.current) {
        window.clearTimeout(speechTimerRef.current)
        speechTimerRef.current = null
      }
    }
  }, [isPastTenseMode, phase, lastResult, reviewWords, soundEnabled])

  if (phase === 'finished') {
    const summary = lastResult ?? {
      totalScore,
      maxScore: baseQuestionCount * 5,
      percentage: 0,
      grade: 'F',
      perfectOriginalCount,
      questionCount: baseQuestionCount,
      reviewExercises: reviewWords,
      pendingExercises: [],
    }
    const gradeInfo = getGrade(summary.percentage)
    const isAbandoned = summary.attemptStatus === 'abandoned'
    const reviewList = summary.reviewExercises ?? []
    const pendingList = summary.pendingExercises ?? []

    return (
      <section className={`game-shell ${isFullscreen ? 'is-fullscreen' : ''}`}>
        <div className="results-card">
          <div className={`results-trophy ${gradeInfo.color}`}>
            {isAbandoned ? <CircleAlert size={34} /> : <Trophy size={34} />}
          </div>
          <h1 className={`results-grade ${gradeInfo.color}`}>{summary.grade}</h1>
          <p className="results-message">
            {isAbandoned
              ? 'Test abandoned. Progress was saved with the current score.'
              : gradeInfo.message}
          </p>

          <div className="score-panel">
            <div className="score-labels">
              <span>Final score</span>
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
                  ? `${summary.answeredOriginalCount ?? 0} of ${summary.questionCount ?? baseQuestionCount} base questions answered`
                  : `${summary.perfectOriginalCount} perfect (out of ${summary.questionCount ?? baseQuestionCount})`}
              </span>
            </div>
          </div>

          <div className="study-panels">
            <div className="study-card">
              <div className="study-card-header">
                <BookOpen size={16} />
                <h3>Words to study</h3>
              </div>
              {reviewList.length === 0 ? (
                <p className="study-empty">
                  {isAbandoned
                    ? 'No missed words have been recorded in this attempt yet.'
                    : 'Excellent: there were no missed words in this test.'}
                </p>
              ) : (
                <>
                  <div className="exercise-tags">
                    {reviewList.map((item) => (
                      <span key={item.key} className="exercise-tag">
                        {item.label}
                      </span>
                    ))}
                  </div>
                  {isPastTenseMode && (
                    <button
                      type="button"
                      className="btn btn-ghost review-audio-btn"
                      onClick={() => {
                        reviewAutoplayDoneRef.current = true
                        void playPastTenseReviewAudio(reviewList)
                      }}
                      disabled={!soundEnabled}
                      title={soundEnabled ? 'Play missed verbs (base and past)' : 'Enable sound first'}
                    >
                      <Volume2 size={16} />
                      <span>
                        {soundEnabled ? 'Play missed verbs (base + past)' : 'Sound is muted'}
                      </span>
                    </button>
                  )}
                </>
              )}
            </div>

            {isAbandoned && (
              <div className="study-card">
                <div className="study-card-header">
                  <Clock3 size={16} />
                  <h3>Words pending when left</h3>
                </div>
                {pendingList.length === 0 ? (
                  <p className="study-empty">No base words were left pending.</p>
                ) : (
                  <div className="exercise-tags">
                    {pendingList.map((item) => (
                      <span key={item.key} className="exercise-tag pending">
                        {item.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
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
            <span>{saveMessage || 'Result ready.'}</span>
          </div>

          <div className="results-actions">
            <button type="button" className="btn btn-primary" onClick={startGame}>
              <RotateCcw size={16} />
              <span>Play again</span>
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleBackToTests}>
              <ArrowLeft size={16} />
              <span>Back to test types</span>
            </button>
          </div>
        </div>
      </section>
    )
  }

  const currentQuestion = queue[0]
  const progressPercentage = Math.round((perfectOriginalCount / baseQuestionCount) * 100)
  const currentPotentialPoints = currentQuestion?.isRetry ? 0 : calculatePoints(attemptsOnCurrent)

  return (
    <section className={`game-shell ${isFullscreen ? 'is-fullscreen' : ''}`}>
      <CoinBurst visible={showCoinAnimation} />

      <div className="game-topbar">
        <div className="hud-pill">
          <span className="hud-label">Points</span>
          <strong>x{String(totalScore).padStart(3, '0')}</strong>
        </div>

        <div className="hud-progress">
          <div className="hud-row">
            <span>Hello, {studentName || 'Student'}</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
          </div>
          <small>
            {config.languageLabel} {isPastTenseMode ? 'Past Tense' : 'Spelling'} · Questions in queue: {queue.length}
          </small>
          <TestLeaderboardChip topRecord={topTestRecord} />
        </div>

        <div className="hud-actions">
          <button
            type="button"
            className="btn btn-ghost icon-only"
            onClick={() => void handleFullscreenToggle()}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button
            type="button"
            className="btn btn-ghost icon-only"
            onClick={handleSoundToggle}
            aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            type="button"
            className="btn btn-danger-soft"
            onClick={handleAbandonTest}
            disabled={saveStatus === 'saving' || feedback === 'correct'}
            title="Save partial result and leave the test"
          >
            <ArrowLeft size={16} />
            <span>Leave test</span>
          </button>
        </div>
      </div>

      {currentQuestion ? (
        <div className="game-board">
          <div className="stars-row" aria-label="Possible points for this question">
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
              <span className="badge badge-soon">Reinforcement (0 pts)</span>
            ) : (
              <span className="badge badge-live">Scored question</span>
            )}
          </div>

          <div className={`question-card spelling-card ${feedback ? `feedback-${feedback}` : ''}`}>
            <div className="spelling-card-content">
              <span className="spelling-kicker">
                {isPastTenseMode ? `${config.languageLabel} verbs` : `${config.languageLabel} dictation`}
              </span>
              {isPastTenseMode ? (
                <>
                  <h2>Choose the past tense form</h2>
                  <div className="spelling-base-word">{currentQuestion.baseWord}</div>
                  <p>Tap the speaker to hear the base verb again.</p>
                </>
              ) : (
                <>
                  <h2>Listen and choose the correct spelling</h2>
                  <p>Tap the speaker if you want to hear the word again.</p>
                </>
              )}
              <button
                type="button"
                className="dictation-replay-btn"
                onClick={handleReplayWord}
                disabled={!soundEnabled}
                title={soundEnabled ? 'Hear word again' : 'Enable sound to hear the word'}
              >
                <Volume2 size={18} />
                <span>
                  {soundEnabled
                    ? isPastTenseMode
                      ? 'Hear base word again'
                      : 'Hear word again'
                    : 'Sound is muted'}
                </span>
              </button>
            </div>
          </div>

          <div className="answers-grid">
            {currentOptions.map((option, index) => (
              <button
                key={`${currentQuestion.id}_${index}`}
                type="button"
                className={`answer-btn answer-word ${option.isHidden ? 'is-hidden' : ''}`}
                disabled={option.isHidden || feedback === 'correct'}
                onClick={() => handleGuess(option.value)}
              >
                {option.value}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="game-board">
          <div className="empty-state">
            <div className="spinner" aria-hidden="true" />
            <p>Loading test...</p>
          </div>
        </div>
      )}
    </section>
  )
}

function FullTestChallenge({ onBack, onSaveResult, studentName, topTestRecord }) {
  const questionCount = FULL_TEST_QUESTION_COUNT

  const [phase, setPhase] = useState('playing')
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
  const [reviewExercises, setReviewExercises] = useState([])
  const [currentExplanationText, setCurrentExplanationText] = useState('')

  const clearFeedbackTimerRef = useRef(null)
  const advanceTimerRef = useRef(null)
  const coinTimerRef = useRef(null)
  const finishInProgressRef = useRef(false)
  const autoStartRef = useRef(false)
  const reviewExercisesRef = useRef([])

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

  useLayoutEffect(() => {
    if (autoStartRef.current) return
    autoStartRef.current = true
    startGame({ playStartSound: false })
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
    if (!question) {
      setCurrentOptions([])
      setAttemptsOnCurrent(0)
      setFeedback(null)
      setCurrentExplanationText('')
      return
    }

    setCurrentOptions((question.options ?? []).map((value) => ({ value, isHidden: false })))
    setAttemptsOnCurrent(0)
    setFeedback(null)
    setCurrentExplanationText('')
  }

  function addReviewExercise(question) {
    if (!question || question.isRetry) return
    const nextList = mergeExerciseRecords(reviewExercisesRef.current, [fullTestRecordFromQuestion(question)])
    reviewExercisesRef.current = nextList
    setReviewExercises(nextList)
  }

  async function enterFullscreenMode() {
    if (typeof document === 'undefined') return
    if (document.fullscreenElement) return
    if (!document.documentElement?.requestFullscreen) return

    try {
      await document.documentElement.requestFullscreen()
    } catch (error) {
      console.warn('Could not enter fullscreen mode:', error)
    }
  }

  async function exitFullscreenMode() {
    if (typeof document === 'undefined') return
    if (!document.fullscreenElement || !document.exitFullscreen) return

    try {
      await document.exitFullscreen()
    } catch (error) {
      console.warn('Could not exit fullscreen mode:', error)
    }
  }

  function handleBackToDashboard() {
    void (async () => {
      await exitFullscreenMode()
      onBack()
    })()
  }

  function startGame(options = {}) {
    const shouldPlayStartSound = options.playStartSound ?? true
    clearTimers()
    finishInProgressRef.current = false
    if (shouldPlayStartSound) {
      playSound('start', soundEnabled)
    }
    void enterFullscreenMode()

    const initialQueue = generateFullTestQuestions(questionCount)
    setQueue(initialQueue)
    setTotalScore(0)
    setPerfectOriginalCount(0)
    setShowCoinAnimation(false)
    setSaveStatus('idle')
    setSaveMessage('')
    setLastResult(null)
    reviewExercisesRef.current = []
    setReviewExercises([])
    setCurrentExplanationText('')
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
    const answeredOriginalCount = questionCount - remainingOriginalCount
    const pendingExercises = completionMode === 'abandoned' ? getPendingFullTestQuestions(queueSnapshot) : []
    const reviewExercisesSummary = mergeExerciseRecords(
      reviewExercisesRef.current,
      options.extraReviewExercises ?? [],
    )

    clearTimers()
    setShowCoinAnimation(false)

    if (completionMode === 'completed') {
      playSound('win', soundEnabled)
    } else {
      playSound('bump', soundEnabled)
    }

    const maxScore = questionCount * 5
    const percentage = Math.min(Math.round((finalScore / maxScore) * 100), 100)
    const gradeInfo = getGrade(percentage)

    const summary = {
      subjectId: 'full',
      subjectName: 'Full Test',
      testId: 'full-test',
      testName: 'Full Test',
      mode: 'full-test',
      languageLabel: 'Mixed',
      totalScore: finalScore,
      maxScore,
      percentage,
      grade: gradeInfo.grade,
      perfectOriginalCount: finalPerfectCount,
      questionCount,
      answeredOriginalCount,
      remainingOriginalCount,
      remainingQueueCount,
      attemptStatus: completionMode,
      isAbandoned: completionMode === 'abandoned',
      reviewExercises: reviewExercisesSummary,
      pendingExercises,
      finishedAtMs: Date.now(),
    }

    setLastResult(summary)
    setPhase('finished')
    setSaveStatus('saving')
    setSaveMessage(
      completionMode === 'abandoned'
        ? 'Saving partial result (remaining questions = 0 pts)...'
        : 'Saving result...',
    )

    try {
      await onSaveResult(summary)
      setSaveStatus('saved')
      setSaveMessage(
        completionMode === 'abandoned'
          ? 'Test abandoned: progress and score saved to Firebase.'
          : 'Result saved to Firebase.',
      )
    } catch (error) {
      setSaveStatus('error')
      setSaveMessage(mapFirebaseError(error, 'save'))
    }
  }

  function advanceAfterCorrect(currentQuestion, nextScore, nextPerfectOriginalCount) {
    const remainingQueue = queue.slice(1)
    const shouldRepeat = attemptsOnCurrent > 0
    let nextQueue = remainingQueue

    if (shouldRepeat) {
      nextQueue = [...remainingQueue, buildFullTestRetryQuestion(currentQuestion)]
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
  }

  function handleGuess(guessedValue) {
    if (feedback === 'correct') return
    if (phase !== 'playing') return

    const currentQuestion = queue[0]
    if (!currentQuestion) return

    if (guessedValue === currentQuestion.answer) {
      if (clearFeedbackTimerRef.current) window.clearTimeout(clearFeedbackTimerRef.current)
      playSound('coin', soundEnabled)

      const pointsEarned = currentQuestion.isRetry ? 0 : calculatePoints(attemptsOnCurrent)
      const nextScore = totalScore + pointsEarned

      if (attemptsOnCurrent > 0) {
        addReviewExercise(currentQuestion)
      }

      const isPerfectOriginal = !currentQuestion.isRetry && attemptsOnCurrent === 0
      const nextPerfectOriginalCount = isPerfectOriginal
        ? perfectOriginalCount + 1
        : perfectOriginalCount

      setTotalScore(nextScore)
      setFeedback('correct')
      setCurrentExplanationText(currentQuestion.explanation ?? '')
      setShowCoinAnimation(true)

      if (coinTimerRef.current) window.clearTimeout(coinTimerRef.current)
      coinTimerRef.current = window.setTimeout(() => {
        setShowCoinAnimation(false)
      }, 850)

      if (advanceTimerRef.current) window.clearTimeout(advanceTimerRef.current)
      advanceTimerRef.current = window.setTimeout(() => {
        advanceAfterCorrect(currentQuestion, nextScore, nextPerfectOriginalCount)
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
      'If you leave the test now, your current score will be saved and all remaining questions will count as 0 points. Do you want to continue?',
    )
    if (!confirmed) return

    const queueSnapshot = [...queue]
    const currentQuestion = queue[0]
    const extraReviewExercises =
      currentQuestion && !currentQuestion.isRetry && attemptsOnCurrent > 0
        ? [fullTestRecordFromQuestion(currentQuestion)]
        : []

    void finishGame(totalScore, perfectOriginalCount, {
      completionMode: 'abandoned',
      queueSnapshot,
      extraReviewExercises,
    })
  }

  async function handleFullscreenToggle() {
    if (document.fullscreenElement) {
      await exitFullscreenMode()
      return
    }
    await enterFullscreenMode()
  }

  if (phase === 'finished') {
    const summary = lastResult ?? {
      totalScore,
      maxScore: questionCount * 5,
      percentage: 0,
      grade: 'F',
      perfectOriginalCount,
      questionCount,
      reviewExercises,
      pendingExercises: [],
    }
    const gradeInfo = getGrade(summary.percentage)
    const isAbandoned = summary.attemptStatus === 'abandoned'
    const reviewList = summary.reviewExercises ?? []
    const pendingList = summary.pendingExercises ?? []

    return (
      <section className={`game-shell ${isFullscreen ? 'is-fullscreen' : ''}`}>
        <div className="results-card">
          <div className={`results-trophy ${gradeInfo.color}`}>
            {isAbandoned ? <CircleAlert size={34} /> : <Trophy size={34} />}
          </div>
          <h1 className={`results-grade ${gradeInfo.color}`}>{summary.grade}</h1>
          <p className="results-message">
            {isAbandoned
              ? 'Test abandoned. Progress was saved with the current score.'
              : gradeInfo.message}
          </p>

          <div className="story-result-chip">
            <Sparkles size={14} />
            <span>Full Test · Mixed (15)</span>
          </div>

          <div className="score-panel">
            <div className="score-labels">
              <span>Final score</span>
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
                  ? `${summary.answeredOriginalCount ?? 0} of ${questionCount} base questions answered`
                  : `${summary.perfectOriginalCount} perfect (out of ${questionCount})`}
              </span>
            </div>
          </div>

          <div className="study-panels">
            <div className="study-card">
              <div className="study-card-header">
                <BookOpen size={16} />
                <h3>Exercises to review</h3>
              </div>
              {reviewList.length === 0 ? (
                <p className="study-empty">
                  {isAbandoned
                    ? 'No missed exercises have been recorded in this attempt yet.'
                    : 'Excellent: there were no missed exercises in this test.'}
                </p>
              ) : (
                <div className="exercise-tags">
                  {reviewList.map((item) => (
                    <span key={item.key} className="exercise-tag review-long">
                      {item.label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {isAbandoned && (
              <div className="study-card">
                <div className="study-card-header">
                  <Clock3 size={16} />
                  <h3>Pending when abandoned</h3>
                </div>
                {pendingList.length === 0 ? (
                  <p className="study-empty">No base questions were left pending.</p>
                ) : (
                  <div className="exercise-tags">
                    {pendingList.map((item) => (
                      <span key={item.key} className="exercise-tag pending review-long">
                        {item.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
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
            <span>{saveMessage || 'Result ready.'}</span>
          </div>

          <div className="results-actions">
            <button type="button" className="btn btn-primary" onClick={startGame}>
              <RotateCcw size={16} />
              <span>New full test</span>
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleBackToDashboard}>
              <ArrowLeft size={16} />
              <span>Back to home</span>
            </button>
          </div>
        </div>
      </section>
    )
  }

  const currentQuestion = queue[0]
  const progressPercentage = Math.round((perfectOriginalCount / questionCount) * 100)
  const currentPotentialPoints = currentQuestion?.isRetry ? 0 : calculatePoints(attemptsOnCurrent)

  return (
    <section className={`game-shell ${isFullscreen ? 'is-fullscreen' : ''}`}>
      <CoinBurst visible={showCoinAnimation} />

      <div className="game-topbar">
        <div className="hud-pill">
          <span className="hud-label">Points</span>
          <strong>x{String(totalScore).padStart(3, '0')}</strong>
        </div>

        <div className="hud-progress">
          <div className="hud-row">
            <span>Hello, {studentName || 'Student'}</span>
            <span>{progressPercentage}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${progressPercentage}%` }} />
          </div>
          <small>Full Test · Mixed challenge · Questions in queue: {queue.length}</small>
          <TestLeaderboardChip topRecord={topTestRecord} />
        </div>

        <div className="hud-actions">
          <button
            type="button"
            className="btn btn-ghost icon-only"
            onClick={() => void handleFullscreenToggle()}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button
            type="button"
            className="btn btn-ghost icon-only"
            onClick={() => setSoundEnabled((value) => !value)}
            aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button
            type="button"
            className="btn btn-danger-soft"
            onClick={handleAbandonTest}
            disabled={saveStatus === 'saving' || feedback === 'correct'}
            title="Save partial result and leave the test"
          >
            <ArrowLeft size={16} />
            <span>Leave test</span>
          </button>
        </div>
      </div>

      {currentQuestion ? (
        <div className="game-board reading-board">
          <div className="story-card">
            <div className="story-card-header">
              <div className="story-card-title">
                <Sparkles size={18} />
                <div>
                  <small>Mixed question source</small>
                  <h3>{currentQuestion.sourceLabel}</h3>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <span className={currentQuestion.isRetry ? 'badge badge-soon' : 'badge badge-live'}>
                  {currentQuestion.isRetry ? 'Reinforcement (0 pts)' : 'Scored question'}
                </span>
                <span className="badge badge-live">{questionCount} questions</span>
              </div>
            </div>
            {currentQuestion.context && (
              <div className="story-card-body">
                <p>{currentQuestion.context}</p>
              </div>
            )}
          </div>

          <div className="stars-row" aria-label="Possible points for this question">
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
            <span className="badge badge-live">Choose the best answer</span>
          </div>

          <div className={`question-card reading-question-card ${feedback ? `feedback-${feedback}` : ''}`}>
            <div className="reading-question-content">
              <span className="reading-question-kicker">Question</span>
              <p>{currentQuestion.prompt}</p>
            </div>
          </div>

          {feedback === 'correct' && currentExplanationText && (
            <div className="story-start-panel">
              <p>
                <strong>How we solved it:</strong> {currentExplanationText}
              </p>
            </div>
          )}

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
      ) : (
        <div className="game-board">
          <div className="empty-state">
            <div className="spinner" aria-hidden="true" />
            <p>Loading full test...</p>
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
  const [personalResultsLoading, setPersonalResultsLoading] = useState(false)
  const [globalResultsLoading, setGlobalResultsLoading] = useState(false)
  const [personalResults, setPersonalResults] = useState([])
  const [globalResults, setGlobalResults] = useState([])
  const [globalResultsError, setGlobalResultsError] = useState('')
  const [screen, setScreen] = useState('dashboard')
  const [selectedSubjectId, setSelectedSubjectId] = useState(null)
  const [selectedTestId, setSelectedTestId] = useState(null)

  async function loadGlobalResults() {
    setGlobalResultsLoading(true)
    setGlobalResultsError('')

    try {
      const globalResultsRef = collection(db, GLOBAL_RESULTS_COLLECTION)
      const snapshot = await getDocs(globalResultsRef)
      const mappedResults = sortResultsByNewest(snapshot.docs.map(toResultRecord))
      setGlobalResults(mappedResults)
    } catch (error) {
      console.error('Error loading global results:', error)
      setGlobalResults([])
      setGlobalResultsError(
        error?.code === 'permission-denied'
          ? 'Global leaderboard is blocked by Firestore rules. Allow authenticated access to publicResults.'
          : 'Could not load the global leaderboard right now.',
      )
    } finally {
      setGlobalResultsLoading(false)
    }
  }

  async function mirrorResultsToPublicCollection(userId, resultRecords) {
    if (!userId || !resultRecords?.length) return

    const writes = resultRecords.map(async (record) => {
      const sourceResultId = record.sourceResultId || record.id
      if (!sourceResultId) return

      const publicDocId = getPublicResultDocId(userId, sourceResultId)
      const publicPayload = toPublicResultPayload(record, userId, sourceResultId)

      try {
        await setDoc(doc(db, GLOBAL_RESULTS_COLLECTION, publicDocId), publicPayload, { merge: true })
      } catch (error) {
        console.warn('Could not mirror result to global collection:', error)
        if (error?.code === 'permission-denied') {
          setGlobalResultsError(
            'Global leaderboard is blocked by Firestore rules. Allow authenticated access to publicResults.',
          )
        }
      }
    })

    await Promise.allSettled(writes)
  }

  async function loadStudentData(user) {
    setPersonalResultsLoading(true)

    try {
      const profileRef = doc(db, 'students', user.uid)
      const resultsRef = collection(db, 'students', user.uid, 'results')

      const [profileSnapshot, resultSnapshot] = await Promise.all([
        getDoc(profileRef),
        getDocs(resultsRef),
      ])

      if (profileSnapshot.exists()) {
        setStudentProfile(profileSnapshot.data())
      } else {
        const fallbackAlias = user.email?.split('@')[0] ?? 'Student'
        setStudentProfile({ alias: fallbackAlias })
      }

      const nextPersonalResults = sortResultsByNewest(resultSnapshot.docs.map(toResultRecord)).slice(0, 20)
      setPersonalResults(nextPersonalResults)
      void mirrorResultsToPublicCollection(user.uid, nextPersonalResults).then(() => {
        void loadGlobalResults()
      })
    } catch (error) {
      console.error('Error loading student data:', error)
      setPersonalResults([])
    } finally {
      setPersonalResultsLoading(false)
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user)

      if (!user) {
        setStudentProfile(null)
        setPersonalResults([])
      setGlobalResults([])
      setGlobalResultsError('')
      setScreen('dashboard')
        setSelectedSubjectId(null)
        setSelectedTestId(null)
        setAuthReady(true)
        return
      }

      setAuthReady(true)
      void loadStudentData(user)
      void loadGlobalResults()
    })

    return unsubscribe
  }, [])

  async function handleRegister(alias, password) {
    setAuthBusy(true)
    setAuthError('')

    try {
      const email = aliasToEmail(alias)

      if (!email) {
        setAuthError('That nickname is not valid.')
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
        setAuthError('That nickname is not valid.')
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

    const studentName = getStudentDisplayName(studentProfile, currentUser)
    const payload = {
      ...summary,
      studentAlias: studentName,
      studentName,
      score: summary.totalScore,
      createdAtMs: Date.now(),
      createdAt: serverTimestamp(),
    }

    const docRef = await addDoc(collection(db, 'students', currentUser.uid, 'results'), payload)
    const savedRecord = { id: docRef.id, ...payload }

    setPersonalResults((previous) => upsertResultRecord(previous, savedRecord))

    const publicRecordId = getPublicResultDocId(currentUser.uid, docRef.id)
    const publicRecordPayload = toPublicResultPayload(savedRecord, currentUser.uid, docRef.id)

    try {
      await setDoc(doc(db, GLOBAL_RESULTS_COLLECTION, publicRecordId), publicRecordPayload, { merge: true })
      const publicRecord = { id: publicRecordId, ...publicRecordPayload }
      setGlobalResults((previous) => upsertResultRecord(previous, publicRecord))
      setGlobalResultsError('')
    } catch (error) {
      console.warn('Could not save public result record:', error)
      if (error?.code === 'permission-denied') {
        setGlobalResultsError(
          'Global leaderboard is blocked by Firestore rules. Allow authenticated access to publicResults.',
        )
      }
    }

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

  function openFullTest() {
    setSelectedSubjectId(null)
    setSelectedTestId(null)
    setScreen('full-test')
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
  const selectedReadingConfig = selectedTest ? READING_TEST_CONFIGS[selectedTest.id] ?? null : null
  const selectedSpellingConfig = selectedTest ? SPELLING_TEST_CONFIGS[selectedTest.id] ?? null : null
  const studentDisplayName = getStudentDisplayName(studentProfile, currentUser)
  const rankingSourceResults = globalResults.length ? globalResults : personalResults
  const fullTestTopRecord = getTopRecordForTest(rankingSourceResults, 'full', 'full-test')
  const selectedTestTopRecord =
    selectedSubject && selectedTest
      ? getTopRecordForTest(rankingSourceResults, selectedSubject.id, selectedTest.id)
      : null

  return (
    <div className="app-shell">
      <header className="top-nav">
        <button type="button" className="brand-brand" onClick={goToDashboard}>
          <div className="brand-mark">
            <Sparkles size={18} />
          </div>
          <div>
            <strong>Joy App Full</strong>
            <small>Subject-based learning</small>
          </div>
        </button>

        <div className="nav-user">
          <div className="user-chip">
            <User size={16} />
            <span>{studentDisplayName}</span>
          </div>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      <main className="app-main">
        {screen === 'dashboard' && (
          <Dashboard
            studentProfile={
              studentProfile
                ? { ...studentProfile, alias: studentDisplayName }
                : { alias: studentDisplayName }
            }
            personalResults={personalResults}
            globalResults={globalResults}
            personalResultsLoading={personalResultsLoading}
            globalResultsLoading={globalResultsLoading}
            globalResultsError={globalResultsError}
            onStartFullTest={openFullTest}
            onSelectSubject={openSubject}
          />
        )}

        {screen === 'full-test' && (
          <FullTestChallenge
            onBack={goToDashboard}
            onSaveResult={saveAssessmentResult}
            studentName={studentDisplayName}
            topTestRecord={fullTestTopRecord}
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
          <MultiplicationChallenge
            onBack={goToSubjectMenu}
            onSaveResult={saveAssessmentResult}
            studentName={studentDisplayName}
            topTestRecord={selectedTestTopRecord}
          />
        )}

        {screen === 'test' && selectedSubject && selectedTest?.id === 'word-problems' && (
          <WordProblemsChallenge
            onBack={goToSubjectMenu}
            onSaveResult={saveAssessmentResult}
            studentName={studentDisplayName}
            topTestRecord={selectedTestTopRecord}
          />
        )}

        {screen === 'test' && selectedSubject && selectedReadingConfig && (
          <ReadingChallenge
            onBack={goToSubjectMenu}
            onSaveResult={saveAssessmentResult}
            studentName={studentDisplayName}
            testConfig={selectedReadingConfig}
            topTestRecord={selectedTestTopRecord}
          />
        )}

        {screen === 'test' && selectedSubject && selectedSpellingConfig && (
          <SpellingChallenge
            onBack={goToSubjectMenu}
            onSaveResult={saveAssessmentResult}
            studentName={studentDisplayName}
            testConfig={selectedSpellingConfig}
            topTestRecord={selectedTestTopRecord}
          />
        )}

        {screen === 'test' && (!selectedSubject || !selectedTest) && (
          <section className="panel-card">
            <div className="empty-state">
              <CircleAlert size={20} />
              <p>The selected test could not be found.</p>
              <button type="button" className="btn btn-primary" onClick={goToDashboard}>
                Back to home
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

export default App
