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
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'
import { auth, db } from './firebase'
import { READING_STORY_BANKS } from './readingStories'

const INITIAL_QUESTION_COUNT = 25
const GLOBAL_RESULTS_COLLECTION = 'publicResults'
const APP_DOMAIN = 'joyapp.student'

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
      description: 'Coming soon: reading and solving real-life situations.',
      available: false,
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
      description: 'Listen to a word and choose the correct spelling.',
      available: true,
      accentClass: 'test-language',
      icon: Volume2,
    },
  ],
}

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
    words: [
      'cat',
      'dog',
      'fish',
      'bird',
      'duck',
      'horse',
      'mouse',
      'house',
      'home',
      'table',
      'chair',
      'book',
      'pencil',
      'school',
      'friend',
      'apple',
      'grape',
      'banana',
      'orange',
      'bread',
      'milk',
      'cheese',
      'water',
      'soup',
      'sun',
      'moon',
      'star',
      'cloud',
      'rain',
      'wind',
      'beach',
      'sand',
      'tree',
      'leaf',
      'flower',
      'stone',
      'door',
      'window',
      'shirt',
      'shoe',
      'hat',
      'red',
      'blue',
      'green',
      'yellow',
      'black',
      'white',
      'big',
      'small',
      'happy',
      'sad',
      'fast',
      'slow',
      'jump',
      'run',
      'play',
      'sing',
      'dance',
      'smile',
      'light',
      'train',
      'plane',
      'truck',
      'bread',
      'cookie',
      'garden',
      'paper',
      'pillow',
      'rocket',
      'winter',
    ],
  },
}

const READING_QUESTION_COUNT = 5
const readingStoryDecksByTest = {}

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

function generateSpellingQuestions(testConfig, count = INITIAL_QUESTION_COUNT) {
  const words = getWordSequence(testConfig.words, count)

  return words.map((word, index) => ({
    id: `sp_${testConfig.testId}_${index}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    word,
    answer: word,
    options: generateSpellingOptions(word, testConfig.testId),
    isRetry: false,
  }))
}

function spellingRecordFromQuestion(question) {
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

function getPendingReadingQuestions(queueItems) {
  return mergeExerciseRecords(
    queueItems
      .filter((item) => !item.isRetry)
      .map((item) => readingQuestionRecordFromQuestion(item)),
  )
}

function getPendingSpellingWords(queueItems) {
  return mergeExerciseRecords(
    queueItems
      .filter((item) => !item.isRetry)
      .map((item) => spellingRecordFromQuestion(item)),
  )
}

function stopSpeechPlayback() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return
  window.speechSynthesis.cancel()
}

function getPreferredSpeechVoice(voiceLang) {
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

  const scored = pool
    .map((voice) => {
      const name = String(voice.name || '').toLowerCase()
      const lang = String(voice.lang || '').toLowerCase()
      let score = 0

      if (lang === requested) score += 40
      else if (requestedBase && lang.startsWith(`${requestedBase}-`)) score += 24
      else if (requestedBase && lang === requestedBase) score += 20

      if (name.includes('google')) score += 60
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

function getResultDisplayLabels(result) {
  const subjectName = getSubjectById(result.subjectId)?.name ?? result.subjectName ?? 'Subject'
  const testName =
    getTestById(result.subjectId, result.testId)?.name ?? result.testName ?? 'Test'

  return { subjectName, testName }
}

function getSavedStudentName(result) {
  return result.studentName || result.studentAlias || 'Student'
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
  onSelectSubject,
}) {
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

      <ResultsList results={globalResults} loading={globalResultsLoading || personalResultsLoading} />
      <RecordsPanel results={globalResults} />
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

function MultiplicationChallenge({ onBack, onSaveResult, studentName }) {
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
    const initialQueue = generateMultiplicationQuestions(INITIAL_QUESTION_COUNT)
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
    const answeredOriginalCount = INITIAL_QUESTION_COUNT - remainingOriginalCount
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

    const maxScore = INITIAL_QUESTION_COUNT * 5
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
      questionCount: INITIAL_QUESTION_COUNT,
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
      maxScore: INITIAL_QUESTION_COUNT * 5,
      percentage: 0,
      grade: 'F',
      perfectOriginalCount,
      questionCount: INITIAL_QUESTION_COUNT,
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
                  ? `${summary.answeredOriginalCount ?? 0} of 25 base questions answered`
                  : `${summary.perfectOriginalCount} perfect (out of 25)`}
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
  const progressPercentage = Math.round((perfectOriginalCount / INITIAL_QUESTION_COUNT) * 100)
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

function ReadingChallenge({ onBack, onSaveResult, studentName, testConfig }) {
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

    setStory(nextStory)
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
              {story.paragraphs.map((paragraph, index) => (
                <p key={`${story.id}_${index}`}>{paragraph}</p>
              ))}
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

function SpellingChallenge({ onBack, onSaveResult, studentName, testConfig }) {
  const config = testConfig ?? SPELLING_TEST_CONFIGS['spelling-english']

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
  }

  function speakCurrentWord(question) {
    if (!question?.word) return
    speakDictationWord(question.word, config.voiceLang, soundEnabled)
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
      stopSpeechPlayback()
      await exitFullscreenMode()
      onBack()
    })()
  }

  function startGame(options = {}) {
    const shouldPlayStartSound = options.playStartSound ?? true
    clearTimers()
    stopSpeechPlayback()
    finishInProgressRef.current = false
    if (shouldPlayStartSound) {
      playSound('start', soundEnabled)
    }
    void enterFullscreenMode()
    const initialQueue = generateSpellingQuestions(config, INITIAL_QUESTION_COUNT)
    setQueue(initialQueue)
    setTotalScore(0)
    setPerfectOriginalCount(0)
    setShowCoinAnimation(false)
    setSaveStatus('idle')
    setSaveMessage('')
    setLastResult(null)
    reviewWordsRef.current = []
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
    const answeredOriginalCount = INITIAL_QUESTION_COUNT - remainingOriginalCount
    const pendingExercises = completionMode === 'abandoned' ? getPendingSpellingWords(queueSnapshot) : []
    const reviewExercisesSummary = mergeExerciseRecords(
      reviewWordsRef.current,
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

    const maxScore = INITIAL_QUESTION_COUNT * 5
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
      questionCount: INITIAL_QUESTION_COUNT,
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
          const retryQuestion = {
            ...currentQuestion,
            id: `retry_word_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            options: generateSpellingOptions(currentQuestion.answer, config.testId),
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
          speakDictationWord(queue[0].word, config.voiceLang, true)
        }, 80)
      }
      return next
    })
  }

  function handleReplayWord() {
    speakCurrentWord(queue[0])
  }

  if (phase === 'finished') {
    const summary = lastResult ?? {
      totalScore,
      maxScore: INITIAL_QUESTION_COUNT * 5,
      percentage: 0,
      grade: 'F',
      perfectOriginalCount,
      questionCount: INITIAL_QUESTION_COUNT,
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
                  ? `${summary.answeredOriginalCount ?? 0} of 25 base questions answered`
                  : `${summary.perfectOriginalCount} perfect (out of 25)`}
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
                <div className="exercise-tags">
                  {reviewList.map((item) => (
                    <span key={item.key} className="exercise-tag">
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
  const progressPercentage = Math.round((perfectOriginalCount / INITIAL_QUESTION_COUNT) * 100)
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
            {config.languageLabel} Spelling · Questions in queue: {queue.length}
          </small>
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
              <span className="spelling-kicker">{config.languageLabel} dictation</span>
              <h2>Listen and choose the correct spelling</h2>
              <p>Tap the speaker if you want to hear the word again.</p>
              <button
                type="button"
                className="dictation-replay-btn"
                onClick={handleReplayWord}
                disabled={!soundEnabled}
                title={soundEnabled ? 'Hear word again' : 'Enable sound to hear the word'}
              >
                <Volume2 size={18} />
                <span>{soundEnabled ? 'Hear word again' : 'Sound is muted'}</span>
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
  const [screen, setScreen] = useState('dashboard')
  const [selectedSubjectId, setSelectedSubjectId] = useState(null)
  const [selectedTestId, setSelectedTestId] = useState(null)

  async function loadGlobalResults() {
    setGlobalResultsLoading(true)

    try {
      const globalResultsRef = collection(db, GLOBAL_RESULTS_COLLECTION)
      const globalQuery = query(globalResultsRef, orderBy('createdAtMs', 'desc'))
      const snapshot = await getDocs(globalQuery)
      setGlobalResults(snapshot.docs.map(toResultRecord))
    } catch (error) {
      console.error('Error loading global results:', error)
      setGlobalResults([])
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
      }
    })

    await Promise.allSettled(writes)
  }

  async function loadStudentData(user) {
    setPersonalResultsLoading(true)

    try {
      const profileRef = doc(db, 'students', user.uid)
      const resultsRef = collection(db, 'students', user.uid, 'results')
      const resultsQuery = query(resultsRef, orderBy('createdAtMs', 'desc'), limit(20))

      const [profileSnapshot, resultSnapshot] = await Promise.all([
        getDoc(profileRef),
        getDocs(resultsQuery),
      ])

      if (profileSnapshot.exists()) {
        setStudentProfile(profileSnapshot.data())
      } else {
        const fallbackAlias = user.email?.split('@')[0] ?? 'Student'
        setStudentProfile({ alias: fallbackAlias })
      }

      const nextPersonalResults = resultSnapshot.docs.map(toResultRecord)
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
    } catch (error) {
      console.warn('Could not save public result record:', error)
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
          <MultiplicationChallenge
            onBack={goToSubjectMenu}
            onSaveResult={saveAssessmentResult}
            studentName={studentDisplayName}
          />
        )}

        {screen === 'test' && selectedSubject && selectedReadingConfig && (
          <ReadingChallenge
            onBack={goToSubjectMenu}
            onSaveResult={saveAssessmentResult}
            studentName={studentDisplayName}
            testConfig={selectedReadingConfig}
          />
        )}

        {screen === 'test' && selectedSubject && selectedSpellingConfig && (
          <SpellingChallenge
            onBack={goToSubjectMenu}
            onSaveResult={saveAssessmentResult}
            studentName={studentDisplayName}
            testConfig={selectedSpellingConfig}
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
