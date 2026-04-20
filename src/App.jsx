import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  BookOpen,
  Calculator,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Gamepad2,
  Lock,
  LogOut,
  Maximize2,
  MessageSquareText,
  Minimize2,
  Minus,
  Music2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Trophy,
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
      description: 'Fast addition mission with score, stars, and retry practice.',
      available: true,
      accentClass: 'test-addition',
      icon: Plus,
    },
    {
      id: 'subtraction',
      name: 'Subtraction',
      description: 'Subtraction challenge with step-by-step feedback and rewards.',
      available: true,
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

const GAMES_CARD = {
  id: 'snake',
  name: 'Games',
  description: 'Play Snake. Every crash unlocks a mixed challenge question to keep going.',
  available: true,
  accentClass: 'test-games',
  icon: Gamepad2,
}

const DAILY_MISSIONS_STORAGE_KEY = 'joyapp_daily_missions_v2'
const CLAIMED_TEST_REWARDS_STORAGE_KEY = 'joyapp_claimed_test_rewards_v1'
const COIN_WALLET_STORAGE_KEY = 'joyapp_coin_wallet_v1'
const SNAKE_ONBOARDING_DISMISSED_KEY = 'joyapp_snake_onboarding_dismissed_v1'
const DAILY_MISSIONS = [
  { id: 'mission-1', label: 'Complete 1 Math challenge', goal: 1, reward: 10 },
  { id: 'mission-2', label: 'Get 3 perfect answers in one test', goal: 3, reward: 12 },
  { id: 'mission-3', label: 'Complete 1 Snake run', goal: 1, reward: 8 },
]

const AVATAR_BASE_CHARACTER_IDS = ['avatar-sunny']
const AVATAR_BASE_ITEM_IDS = ['top-classic', 'shoes-classic']
const AVATAR_CHARACTER_CATALOG = [
  {
    id: 'avatar-sunny',
    name: 'Sunny',
    price: 0,
    unlockLabel: 'Starter avatar',
    style: {
      skin: '#ffd8c0',
      hair: '#4c3567',
      blush: '#ff9e80',
      stageGlow: '#ffe48e',
      accent: '#5b8cff',
    },
  },
  {
    id: 'avatar-river',
    name: 'River',
    price: 28,
    unlockLabel: 'Shop avatar',
    style: {
      skin: '#d6a07a',
      hair: '#24345a',
      blush: '#d87f69',
      stageGlow: '#8fe4ff',
      accent: '#4c6fff',
    },
  },
  {
    id: 'avatar-luna',
    name: 'Luna',
    price: 32,
    unlockLabel: 'Shop avatar',
    style: {
      skin: '#f2c9b0',
      hair: '#2b1f52',
      blush: '#f0a48d',
      stageGlow: '#d9b8ff',
      accent: '#7b52ff',
    },
  },
  {
    id: 'avatar-ember',
    name: 'Ember',
    price: 35,
    unlockLabel: 'Shop avatar',
    style: {
      skin: '#a86f50',
      hair: '#2a1d17',
      blush: '#ce7c5d',
      stageGlow: '#ffc28f',
      accent: '#ff8a3d',
    },
  },
  {
    id: 'avatar-sage',
    name: 'Sage',
    price: 38,
    unlockLabel: 'Shop avatar',
    style: {
      skin: '#e6c4a2',
      hair: '#345b4b',
      blush: '#dc9c7d',
      stageGlow: '#b9f4c5',
      accent: '#2eb872',
    },
  },
]

const AVATAR_REWARD_CATALOG = [
  {
    id: 'hat-red-cap',
    slot: 'hat',
    name: 'Red Cap',
    rewardLabel: 'Unlocked at 10 runs',
    style: { fill: '#ff6f61', accent: '#c94b45', trim: '#ffd9cf' },
  },
  {
    id: 'top-mint-hoodie',
    slot: 'top',
    name: 'Mint Hoodie',
    rewardLabel: 'Unlocked at 20 runs',
    style: { fill: '#5fd8be', accent: '#2f9f8d', trim: '#e8fff9' },
  },
  {
    id: 'accessory-star-glasses',
    slot: 'accessory',
    name: 'Star Glasses',
    rewardLabel: 'Unlocked at 30 runs',
    style: { fill: '#ffd54f', accent: '#7a5b00', trim: '#fff7d2' },
  },
  {
    id: 'shoes-rocket',
    slot: 'shoes',
    name: 'Rocket Shoes',
    rewardLabel: 'Unlocked at 40 runs',
    style: { fill: '#5b8cff', accent: '#2e4ba7', trim: '#e6eeff' },
  },
  {
    id: 'hat-explorer',
    slot: 'hat',
    name: 'Explorer Hat',
    rewardLabel: 'Unlocked at 50 runs',
    style: { fill: '#d6a15f', accent: '#8b5e2c', trim: '#f9ead6' },
  },
  {
    id: 'top-sun-jacket',
    slot: 'top',
    name: 'Sun Jacket',
    rewardLabel: 'Unlocked at 60 runs',
    style: { fill: '#ffb24d', accent: '#d77700', trim: '#fff0d9' },
  },
  {
    id: 'accessory-rainbow-scarf',
    slot: 'accessory',
    name: 'Rainbow Scarf',
    rewardLabel: 'Unlocked at 70 runs',
    style: { fill: '#ff7ab6', accent: '#7e57c2', trim: '#ffe3f2' },
  },
  {
    id: 'shoes-trail-boots',
    slot: 'shoes',
    name: 'Trail Boots',
    rewardLabel: 'Unlocked at 80 runs',
    style: { fill: '#8d6e63', accent: '#5d4037', trim: '#eee1dc' },
  },
  {
    id: 'hat-headphones',
    slot: 'hat',
    name: 'Headphones',
    rewardLabel: 'Unlocked at 90 runs',
    style: { fill: '#7c4dff', accent: '#4527a0', trim: '#efe7ff' },
  },
  {
    id: 'accessory-gold-cape',
    slot: 'accessory',
    name: 'Gold Cape',
    rewardLabel: 'Unlocked at 100 runs',
    style: { fill: '#ffd166', accent: '#cc8f00', trim: '#fff4d8' },
  },
]

const AVATAR_CATALOG = [
  {
    id: 'top-classic',
    slot: 'top',
    name: 'Classic Tee',
    rewardLabel: 'Starter item',
    style: { fill: '#5b8cff', accent: '#3857be', trim: '#e6eeff' },
  },
  {
    id: 'shoes-classic',
    slot: 'shoes',
    name: 'Classic Sneakers',
    rewardLabel: 'Starter item',
    style: { fill: '#546e7a', accent: '#37474f', trim: '#dfe7ea' },
  },
  {
    id: 'top-striped-tee',
    slot: 'top',
    name: 'Striped Tee',
    rewardLabel: 'Buy for 16 coins',
    purchasePrice: 16,
    style: { fill: '#ffd166', accent: '#ff6f61', trim: '#e6fff5' },
  },
  {
    id: 'top-denim-jacket',
    slot: 'top',
    name: 'Denim Jacket',
    rewardLabel: 'Buy for 26 coins',
    purchasePrice: 26,
    style: { fill: '#74a8ff', accent: '#3158d4', trim: '#edf3ff' },
  },
  {
    id: 'top-dino-shirt',
    slot: 'top',
    name: 'Dino Shirt',
    rewardLabel: 'Buy for 18 coins',
    purchasePrice: 18,
    style: { fill: '#444', accent: '#9be37c', trim: '#ffe082' },
  },
  {
    id: 'top-flower-dress',
    slot: 'top',
    name: 'Flower Dress',
    rewardLabel: 'Buy for 24 coins',
    purchasePrice: 24,
    style: { fill: '#ff8fb1', accent: '#ffcd5d', trim: '#fff3e0' },
  },
  {
    id: 'top-cosmic-hoodie',
    slot: 'top',
    name: 'Cosmic Hoodie',
    rewardLabel: 'Buy for 22 coins',
    purchasePrice: 22,
    style: { fill: '#7c4dff', accent: '#4527a0', trim: '#efe7ff' },
  },
  {
    id: 'top-cloud-jacket',
    slot: 'top',
    name: 'Cloud Jacket',
    rewardLabel: 'Buy for 24 coins',
    purchasePrice: 24,
    style: { fill: '#90caf9', accent: '#3c78d8', trim: '#eef7ff' },
  },
  {
    id: 'hat-sport-visor',
    slot: 'hat',
    name: 'Sport Visor',
    rewardLabel: 'Buy for 18 coins',
    purchasePrice: 18,
    style: { fill: '#ff8a65', accent: '#d45c38', trim: '#ffe5db' },
  },
  {
    id: 'hat-sun-cap',
    slot: 'hat',
    name: 'Sun Cap',
    rewardLabel: 'Buy for 14 coins',
    purchasePrice: 14,
    style: { fill: '#ffd54f', accent: '#e09b00', trim: '#fff4c2' },
  },
  {
    id: 'hat-cozy-beanie',
    slot: 'hat',
    name: 'Cozy Beanie',
    rewardLabel: 'Buy for 15 coins',
    purchasePrice: 15,
    style: { fill: '#d17b49', accent: '#9a4d20', trim: '#ffe2c9' },
  },
  {
    id: 'accessory-lightning-badge',
    slot: 'accessory',
    name: 'Lightning Badge',
    rewardLabel: 'Buy for 16 coins',
    purchasePrice: 16,
    style: { fill: '#ffe066', accent: '#b67d00', trim: '#fff7d1' },
  },
  {
    id: 'accessory-school-backpack',
    slot: 'accessory',
    name: 'School Backpack',
    rewardLabel: 'Buy for 20 coins',
    purchasePrice: 20,
    style: { fill: '#63c2a1', accent: '#2f8f73', trim: '#e8fff8' },
  },
  {
    id: 'accessory-violet-glasses',
    slot: 'accessory',
    name: 'Violet Glasses',
    rewardLabel: 'Buy for 14 coins',
    purchasePrice: 14,
    style: { fill: '#b388ff', accent: '#6a1b9a', trim: '#f4ecff' },
  },
  {
    id: 'accessory-water-bottle',
    slot: 'accessory',
    name: 'Water Bottle',
    rewardLabel: 'Buy for 11 coins',
    purchasePrice: 11,
    style: { fill: '#5bc0eb', accent: '#1976d2', trim: '#e8f8ff' },
  },
  {
    id: 'accessory-story-book',
    slot: 'accessory',
    name: 'Story Book',
    rewardLabel: 'Buy for 13 coins',
    purchasePrice: 13,
    style: { fill: '#ffb74d', accent: '#ef6c00', trim: '#fff1df' },
  },
  {
    id: 'shoes-sky-runners',
    slot: 'shoes',
    name: 'Sky Runners',
    rewardLabel: 'Buy for 20 coins',
    purchasePrice: 20,
    style: { fill: '#4fc3f7', accent: '#0277bd', trim: '#dff7ff' },
  },
  {
    id: 'shoes-red-runners',
    slot: 'shoes',
    name: 'Red Runners',
    rewardLabel: 'Buy for 18 coins',
    purchasePrice: 18,
    style: { fill: '#ff6f61', accent: '#c63c35', trim: '#ffe0dc' },
  },
  {
    id: 'shoes-cloud-boots',
    slot: 'shoes',
    name: 'Cloud Boots',
    rewardLabel: 'Buy for 21 coins',
    purchasePrice: 21,
    style: { fill: '#eceff1', accent: '#90a4ae', trim: '#ffffff' },
  },
  ...AVATAR_REWARD_CATALOG,
]

const AVATAR_ITEM_MAP = Object.fromEntries(AVATAR_CATALOG.map((item) => [item.id, item]))
const AVATAR_CHARACTER_MAP = Object.fromEntries(
  AVATAR_CHARACTER_CATALOG.map((character) => [character.id, character]),
)
const AVATAR_SLOT_LABELS = {
  hat: 'Hat',
  top: 'Top',
  accessory: 'Accessory',
  shoes: 'Shoes',
}

const STICKER_CATALOG = [
  {
    id: 'sticker-dino-club',
    name: 'Dino Club',
    price: 8,
    palette: ['#9be37c', '#4a8f2d'],
  },
  {
    id: 'sticker-star-burst',
    name: 'Star Burst',
    price: 10,
    palette: ['#ffd54f', '#c88a00'],
  },
  {
    id: 'sticker-book-buddy',
    name: 'Book Buddy',
    price: 9,
    palette: ['#90caf9', '#3158d4'],
  },
  {
    id: 'sticker-rocket-club',
    name: 'Rocket Club',
    price: 12,
    palette: ['#ff9f43', '#d35400'],
  },
  {
    id: 'sticker-rainbow-smile',
    name: 'Rainbow Smile',
    price: 11,
    palette: ['#ff7ab6', '#7e57c2'],
  },
]

const STICKER_MAP = Object.fromEntries(STICKER_CATALOG.map((sticker) => [sticker.id, sticker]))
const AVATAR_CLOSET_TABS = [
  { id: 'avatars', label: 'Avatars' },
  { id: 'clothes', label: 'Clothes' },
  { id: 'items', label: 'Items' },
  { id: 'shoes', label: 'Shoes' },
]
const AVATAR_STORE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'avatars', label: 'Avatars' },
  { id: 'clothes', label: 'Clothes' },
  { id: 'items', label: 'Items' },
  { id: 'shoes', label: 'Shoes' },
  { id: 'stickers', label: 'Stickers' },
]

function getAvatarCategoryFromSlot(slot) {
  if (slot === 'top') return 'clothes'
  if (slot === 'shoes') return 'shoes'
  return 'items'
}

function getDefaultAvatarState() {
  return {
    totalCompletedRuns: 0,
    coins: 0,
    unlockedItemIds: [...AVATAR_BASE_ITEM_IDS],
    ownedCharacterIds: [...AVATAR_BASE_CHARACTER_IDS],
    selectedCharacterId: AVATAR_BASE_CHARACTER_IDS[0],
    ownedStickerIds: [],
    equipped: {
      hat: '',
      top: 'top-classic',
      accessory: '',
      shoes: 'shoes-classic',
    },
  }
}

function countCompletedRuns(results) {
  return results.filter((result) => result.attemptStatus !== 'abandoned').length
}

function getAvatarRewardForRunCount(totalCompletedRuns) {
  if (totalCompletedRuns < 10 || totalCompletedRuns % 10 !== 0) return null
  return AVATAR_REWARD_CATALOG[(totalCompletedRuns / 10) - 1] ?? null
}

function buildUnlockedAvatarItemIds(totalCompletedRuns, existingItemIds = []) {
  const unlockedItems = new Set(AVATAR_BASE_ITEM_IDS)

  existingItemIds.forEach((itemId) => {
    if (AVATAR_ITEM_MAP[itemId]) unlockedItems.add(itemId)
  })

  AVATAR_REWARD_CATALOG.slice(0, Math.floor(totalCompletedRuns / 10)).forEach((item) => {
    unlockedItems.add(item.id)
  })

  return Array.from(unlockedItems)
}

function normalizeAvatarState(rawAvatar, totalCompletedRuns) {
  const fallbackAvatar = getDefaultAvatarState()
  const nextRunCount = Math.max(0, Number(totalCompletedRuns ?? rawAvatar?.totalCompletedRuns ?? 0))
  const unlockedItemIds = buildUnlockedAvatarItemIds(nextRunCount, rawAvatar?.unlockedItemIds ?? [])
  const unlockedSet = new Set(unlockedItemIds)
  const ownedCharacterIds = Array.from(
    new Set([
      ...AVATAR_BASE_CHARACTER_IDS,
      ...(rawAvatar?.ownedCharacterIds ?? []).filter((characterId) => AVATAR_CHARACTER_MAP[characterId]),
    ]),
  )
  const ownedStickerIds = Array.from(
    new Set((rawAvatar?.ownedStickerIds ?? []).filter((stickerId) => STICKER_MAP[stickerId])),
  )
  const selectedCharacterId = ownedCharacterIds.includes(rawAvatar?.selectedCharacterId)
    ? rawAvatar.selectedCharacterId
    : fallbackAvatar.selectedCharacterId
  const equipped = {
    hat: unlockedSet.has(rawAvatar?.equipped?.hat) ? rawAvatar.equipped.hat : fallbackAvatar.equipped.hat,
    top: unlockedSet.has(rawAvatar?.equipped?.top) ? rawAvatar.equipped.top : fallbackAvatar.equipped.top,
    accessory: unlockedSet.has(rawAvatar?.equipped?.accessory)
      ? rawAvatar.equipped.accessory
      : fallbackAvatar.equipped.accessory,
    shoes: unlockedSet.has(rawAvatar?.equipped?.shoes) ? rawAvatar.equipped.shoes : fallbackAvatar.equipped.shoes,
  }

  return {
    totalCompletedRuns: nextRunCount,
    coins: Math.max(0, Number(rawAvatar?.coins ?? 0)),
    unlockedItemIds,
    ownedCharacterIds,
    selectedCharacterId,
    ownedStickerIds,
    equipped,
  }
}

function normalizeStudentProfileWithAvatar(profile, totalCompletedRuns) {
  const safeProfile = profile ?? {}
  return {
    ...safeProfile,
    avatar: normalizeAvatarState(safeProfile.avatar, totalCompletedRuns),
  }
}

function getAvatarItemsForSlot(slot, avatarState) {
  const unlockedSet = new Set(avatarState?.unlockedItemIds ?? AVATAR_BASE_ITEM_IDS)
  return AVATAR_CATALOG
    .filter((item) => item.slot === slot)
    .map((item) => ({
      ...item,
      isUnlocked: unlockedSet.has(item.id),
    }))
}

function getNextAvatarReward(totalCompletedRuns) {
  return AVATAR_REWARD_CATALOG[Math.floor(totalCompletedRuns / 10)] ?? null
}

function getCoinsForAssessment(summary) {
  if (summary?.mode === 'snake') {
    const bestAppleStreak = Math.max(0, Number(summary?.bestAppleStreak ?? summary?.applesEaten ?? 0))
    const reachedGoalBonus = bestAppleStreak >= SNAKE_GOAL_APPLES ? 18 : 0
    const baseSnakeReward = 20
    const streakBonus = bestAppleStreak * 4
    return baseSnakeReward + streakBonus + reachedGoalBonus
  }

  const totalScore = Math.max(0, Number(summary?.totalScore ?? 0))
  const percentage = Math.max(0, Number(summary?.percentage ?? 0))
  const baseReward = summary?.attemptStatus === 'abandoned' ? 1 : 4
  const scoreReward = Math.round(totalScore / 12)
  const accuracyReward = Math.round(percentage / 25)

  return Math.max(baseReward, baseReward + scoreReward + accuracyReward)
}

function getAvatarProgressSummary(avatarState) {
  const totalCompletedRuns = avatarState?.totalCompletedRuns ?? 0
  const nextReward = getNextAvatarReward(totalCompletedRuns)
  const progressInBlock = totalCompletedRuns % 10

  if (!nextReward) {
    return {
      totalCompletedRuns,
      nextReward: null,
      progressPercent: 100,
      remainingRuns: 0,
      coins: avatarState?.coins ?? 0,
      ownedCharacters: avatarState?.ownedCharacterIds?.length ?? AVATAR_BASE_CHARACTER_IDS.length,
      ownedStickers: avatarState?.ownedStickerIds?.length ?? 0,
      unlockedCount: new Set(avatarState?.unlockedItemIds ?? AVATAR_BASE_ITEM_IDS).size,
    }
  }

  return {
    totalCompletedRuns,
    nextReward,
    progressPercent: progressInBlock * 10,
    remainingRuns: progressInBlock === 0 ? 10 : 10 - progressInBlock,
    coins: avatarState?.coins ?? 0,
    ownedCharacters: avatarState?.ownedCharacterIds?.length ?? AVATAR_BASE_CHARACTER_IDS.length,
    ownedStickers: avatarState?.ownedStickerIds?.length ?? 0,
    unlockedCount: new Set(avatarState?.unlockedItemIds ?? AVATAR_BASE_ITEM_IDS).size,
  }
}

function getShopWardrobeItems(avatarState) {
  const unlockedSet = new Set(avatarState?.unlockedItemIds ?? AVATAR_BASE_ITEM_IDS)
  return AVATAR_CATALOG.filter((item) => item.purchasePrice).map((item) => ({
    ...item,
    isOwned: unlockedSet.has(item.id),
  }))
}

function getShopCharacters(avatarState) {
  const ownedCharacters = new Set(avatarState?.ownedCharacterIds ?? AVATAR_BASE_CHARACTER_IDS)
  return AVATAR_CHARACTER_CATALOG.map((character) => ({
    ...character,
    isOwned: ownedCharacters.has(character.id),
  }))
}

function getShopStickers(avatarState) {
  const ownedStickers = new Set(avatarState?.ownedStickerIds ?? [])
  return STICKER_CATALOG.map((sticker) => ({
    ...sticker,
    isOwned: ownedStickers.has(sticker.id),
  }))
}

const FULL_TEST_SOURCE_TESTS = [
  { testId: 'multiplication', label: 'Multiplication' },
  { testId: 'word-problems', label: 'Word Problems' },
  { testId: 'reading-english', label: 'Reading English' },
  { testId: 'reading-spanish', label: 'Reading Spanish' },
  { testId: 'spelling-spanish', label: 'Spelling Spanish' },
  { testId: 'spelling-english', label: 'Spelling English' },
]

const SNAKE_BOARD_SIZE = 14
const SNAKE_GOAL_APPLES = 10
const SNAKE_BASE_SPEED_MS = 160
const SNAKE_DIRECTION_VECTORS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

const SPELLING_TEST_CONFIGS = {
  'spelling-spanish': {
    subjectId: 'language',
    subjectName: 'Language',
    testId: 'spelling-spanish',
    testName: 'Spanish',
    languageLabel: 'Spanish',
    voiceLang: 'es-MX',
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
      'shake',
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
let activeMusicTheme = ''
let backgroundMusicTimerId = null
let masterAudioMuted = false
let masterAudioVolume = 0.65
let audioUnlocked = false
let audioUnlockPromise = null
let lastUiSoundAt = 0

function setMasterAudioMuted(value) {
  masterAudioMuted = Boolean(value)
}

function setMasterAudioVolume(value) {
  const numericValue = Number(value)
  masterAudioVolume = Number.isFinite(numericValue)
    ? Math.max(0, Math.min(1, numericValue))
    : 0.65
}

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

    if (audioCtx.state === 'running') {
      audioUnlocked = true
    }

    return true
  } catch (error) {
    console.warn('Audio is not available right now:', error)
    return false
  }
}

function isAudioPrimed() {
  return Boolean(audioCtx && audioCtx.state === 'running' && audioUnlocked)
}

async function primeAudioEngine() {
  if (!initAudio()) return false
  if (isAudioPrimed()) return true

  if (!audioUnlockPromise) {
    audioUnlockPromise = audioCtx
      .resume()
      .then(() => {
        audioUnlocked = audioCtx.state === 'running'
        return audioUnlocked
      })
      .catch((error) => {
        console.warn('Could not unlock audio context:', error)
        return false
      })
      .finally(() => {
        audioUnlockPromise = null
      })
  }

  return audioUnlockPromise
}

function playSound(type, enabled, allowRetry = true) {
  try {
    if (!enabled || masterAudioMuted || masterAudioVolume <= 0) return
    if (!initAudio()) return

    if (audioCtx.state !== 'running') {
      if (allowRetry) {
        void primeAudioEngine().then((ready) => {
          if (ready) playSound(type, enabled, false)
        })
      }
      return
    }

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
      gainNode.gain.linearRampToValueAtTime(0.14 * masterAudioVolume, now + 0.04)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.45)
      osc.start(now)
      osc.stop(now + 0.46)
      return
    }

    if (type === 'bump') {
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(180, now)
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.18)
      gainNode.gain.setValueAtTime(0.08 * masterAudioVolume, now)
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
      gainNode.gain.setValueAtTime(0.08 * masterAudioVolume, now)
      gainNode.gain.linearRampToValueAtTime(0.09 * masterAudioVolume, now + 0.35)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.65)
      osc.start(now)
      osc.stop(now + 0.66)
      return
    }

    if (type === 'coin') {
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(660, now)
      osc.frequency.setValueAtTime(990, now + 0.06)
      osc.frequency.setValueAtTime(1320, now + 0.12)
      gainNode.gain.setValueAtTime(0.001, now)
      gainNode.gain.linearRampToValueAtTime(0.08 * masterAudioVolume, now + 0.03)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.25)
      osc.start(now)
      osc.stop(now + 0.26)
      return
    }

    if (type === 'transition') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(420, now)
      osc.frequency.exponentialRampToValueAtTime(690, now + 0.16)
      gainNode.gain.setValueAtTime(0.001, now)
      gainNode.gain.linearRampToValueAtTime(0.03 * masterAudioVolume, now + 0.025)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.19)
      osc.start(now)
      osc.stop(now + 0.2)
      return
    }

    if (type === 'ui') {
      const nowMs = Date.now()
      if (nowMs - lastUiSoundAt < 70) return
      lastUiSoundAt = nowMs

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(700, now)
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.08)
      gainNode.gain.setValueAtTime(0.001, now)
      gainNode.gain.linearRampToValueAtTime(0.02 * masterAudioVolume, now + 0.015)
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
      osc.start(now)
      osc.stop(now + 0.11)
    }
  } catch (error) {
    console.warn('Could not play sound:', error)
  }
}

const BACKGROUND_MUSIC_PATTERNS = {
  snake: {
    stepMs: 190,
    notes: [
      659.25,
      783.99,
      987.77,
      783.99,
      880,
      1046.5,
      1174.66,
      1046.5,
      783.99,
      880,
      987.77,
      783.99,
      739.99,
      659.25,
      587.33,
      659.25,
      null,
      783.99,
      987.77,
      1174.66,
      987.77,
      880,
      783.99,
      739.99,
      null,
    ],
  },
}

function playMusicNote(frequency, startOffsetMs = 0, durationMs = 170, options = {}, allowRetry = true) {
  if (!frequency) return
  if (masterAudioMuted || masterAudioVolume <= 0) return
  if (!initAudio()) return

  if (audioCtx.state !== 'running') {
    if (allowRetry) {
      void primeAudioEngine().then((ready) => {
        if (ready) playMusicNote(frequency, startOffsetMs, durationMs, options, false)
      })
    }
    return
  }

  try {
    const osc = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()
    const now = audioCtx.currentTime + startOffsetMs / 1000
    const duration = durationMs / 1000

    osc.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    osc.type = options.type ?? 'triangle'
    osc.frequency.setValueAtTime(frequency, now)
    gainNode.gain.setValueAtTime(0.001, now)
    gainNode.gain.linearRampToValueAtTime((options.volume ?? 0.035) * masterAudioVolume, now + 0.02)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration)

    osc.start(now)
    osc.stop(now + duration + 0.03)
  } catch (error) {
    console.warn('Could not play music note:', error)
  }
}

function stopBackgroundMusic() {
  activeMusicTheme = ''
  if (backgroundMusicTimerId) {
    window.clearTimeout(backgroundMusicTimerId)
    backgroundMusicTimerId = null
  }
}

function scheduleBackgroundMusic(theme) {
  const pattern = BACKGROUND_MUSIC_PATTERNS[theme]
  if (!pattern) return

  pattern.notes.forEach((frequency, index) => {
    playMusicNote(frequency, index * pattern.stepMs, pattern.stepMs - 35, {
      type: 'triangle',
      volume: 0.028,
    })
  })

  backgroundMusicTimerId = window.setTimeout(() => {
    if (activeMusicTheme !== theme) return
    scheduleBackgroundMusic(theme)
  }, pattern.notes.length * pattern.stepMs)
}

function startBackgroundMusic(theme, enabled) {
  if (!enabled) {
    stopBackgroundMusic()
    return false
  }

  if (!theme) return false
  if (!initAudio()) return false

  if (audioCtx.state !== 'running') {
    void primeAudioEngine().then((ready) => {
      if (ready) startBackgroundMusic(theme, enabled)
    })
    return false
  }

  if (activeMusicTheme === theme && backgroundMusicTimerId) return true

  stopBackgroundMusic()
  activeMusicTheme = theme
  scheduleBackgroundMusic(theme)
  return true
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

function generateArithmeticQuestions(operation = 'multiply', count = MULTIPLICATION_QUESTION_COUNT) {
  if (operation === 'multiply') {
    return generateMultiplicationQuestions(count).map((question) => ({
      ...question,
      operation: 'multiply',
      operationSymbol: '×',
    }))
  }

  return Array.from({ length: count }, (_, index) => {
    const n1 = Math.floor(Math.random() * 40) + 10
    const n2 = Math.floor(Math.random() * 30) + 1
    const safeN2 = operation === 'subtract' ? Math.min(n2, n1) : n2
    const answer = operation === 'add' ? n1 + n2 : n1 - safeN2

    return {
      id: `q_${operation}_${index}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      n1,
      n2: operation === 'subtract' ? safeN2 : n2,
      answer,
      options: generateOptions(answer),
      isRetry: false,
      operation,
      operationSymbol: operation === 'add' ? '+' : '−',
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

function generateSpellingLetterPool(answer, languageId) {
  const normalized = String(answer ?? '').trim().toLowerCase()
  if (!normalized) return []

  const extraCount = Math.max(2, Math.min(4, Math.ceil(normalized.length / 3)))
  const extras = []
  const distractorWords = mutateSpellingWord(normalized, languageId)

  for (const candidate of distractorWords) {
    for (const letter of candidate) {
      if (extras.length >= extraCount) break
      if (!/^[a-z]$/.test(letter)) continue
      if (!normalized.includes(letter) || extras.filter((item) => item === letter).length < 1) {
        extras.push(letter)
      }
    }
    if (extras.length >= extraCount) break
  }

  const fallbackAlphabet =
    languageId === 'spelling-spanish'
      ? ['a', 'e', 'i', 'o', 'u', 'l', 'm', 'n', 'p', 'r', 's', 't']
      : ['a', 'd', 'e', 'g', 'i', 'l', 'n', 'o', 'r', 's', 't', 'u']

  while (extras.length < extraCount) {
    const letter = fallbackAlphabet[Math.floor(Math.random() * fallbackAlphabet.length)]
    extras.push(letter)
  }

  return shuffleArray([...normalized.split(''), ...extras])
}

function buildSpellingQuestion(word, testConfig, index, responseMode = 'choice') {
  const normalizedWord = String(word ?? '').trim().toLowerCase()
  const baseId = `sp_${testConfig.testId}_${index}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`

  if (testConfig.mode === 'past-tense') {
    const pastTense = generatePastTenseOptions(normalizedWord)
    return {
      id: baseId,
      word: normalizedWord,
      baseWord: normalizedWord,
      promptWord: normalizedWord,
      answer: pastTense.answer,
      responseMode,
      options: responseMode === 'choice' ? pastTense.options : [],
      letterPool:
        responseMode === 'build'
          ? generateSpellingLetterPool(pastTense.answer, testConfig.testId)
          : [],
      isRetry: false,
    }
  }

  return {
    id: baseId,
    word: normalizedWord,
    answer: normalizedWord,
    responseMode,
    options: responseMode === 'choice' ? generateSpellingOptions(normalizedWord, testConfig.testId) : [],
    letterPool:
      responseMode === 'build'
        ? generateSpellingLetterPool(normalizedWord, testConfig.testId)
        : [],
    isRetry: false,
  }
}

function generateSpellingQuestions(testConfig, count = INITIAL_QUESTION_COUNT, options = {}) {
  const allowBuildMode = options.allowBuildMode ?? true
  const words = getWordSequence(testConfig.words, count)
  const buildQuestionCount = allowBuildMode ? Math.max(1, Math.floor(count / 3)) : 0
  const buildIndexes = new Set(shuffleArray(Array.from({ length: count }, (_, index) => index)).slice(0, buildQuestionCount))

  return words.map((word, index) =>
    buildSpellingQuestion(word, testConfig, index, buildIndexes.has(index) ? 'build' : 'choice'),
  )
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
    return generateSpellingQuestions(config, count, { allowBuildMode: false }).map((question, index) => ({
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

function createInitialSnake() {
  return [
    { x: 4, y: 7 },
    { x: 3, y: 7 },
    { x: 2, y: 7 },
  ]
}

function createSnakeRunState() {
  const snake = createInitialSnake()
  return {
    snake,
    direction: 'right',
    apple: getRandomOpenSnakeCell(snake),
  }
}

function getRandomOpenSnakeCell(snake) {
  const occupied = new Set((snake ?? []).map((cell) => `${cell.x},${cell.y}`))
  const openCells = []

  for (let y = 0; y < SNAKE_BOARD_SIZE; y += 1) {
    for (let x = 0; x < SNAKE_BOARD_SIZE; x += 1) {
      const key = `${x},${y}`
      if (!occupied.has(key)) {
        openCells.push({ x, y })
      }
    }
  }

  return pickRandom(openCells) ?? { x: 0, y: 0 }
}

function isSnakeOutOfBounds(cell) {
  return (
    !cell ||
    cell.x < 0 ||
    cell.y < 0 ||
    cell.x >= SNAKE_BOARD_SIZE ||
    cell.y >= SNAKE_BOARD_SIZE
  )
}

function snakeCellsMatch(a, b) {
  return Boolean(a && b && a.x === b.x && a.y === b.y)
}

function isOppositeSnakeDirection(nextDirection, currentDirection) {
  return (
    (nextDirection === 'up' && currentDirection === 'down') ||
    (nextDirection === 'down' && currentDirection === 'up') ||
    (nextDirection === 'left' && currentDirection === 'right') ||
    (nextDirection === 'right' && currentDirection === 'left')
  )
}

function getSnakeDirectionFromKey(key) {
  switch (key) {
    case 'ArrowUp':
    case 'w':
    case 'W':
      return 'up'
    case 'ArrowDown':
    case 's':
    case 'S':
      return 'down'
    case 'ArrowLeft':
    case 'a':
    case 'A':
      return 'left'
    case 'ArrowRight':
    case 'd':
    case 'D':
      return 'right'
    default:
      return ''
  }
}

function getSnakeDirectionLabel(direction) {
  switch (direction) {
    case 'up':
      return 'Up'
    case 'down':
      return 'Down'
    case 'left':
      return 'Left'
    case 'right':
      return 'Right'
    default:
      return 'Right'
  }
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
        if (lang === 'es-mx') score += 48
        if (lang === 'es-us') score += 34
        if (lang === 'es-419') score += 34
        if (lang.startsWith('es-mx')) score += 24
        if (lang.startsWith('es-us')) score += 18
        if (lang.startsWith('es-419')) score += 18
        if (
          name.includes('mexico') ||
          name.includes('mexican') ||
          name.includes('latam') ||
          name.includes('latin')
        ) {
          score += 20
        }
        if (name.includes('us') || name.includes('america')) score += 8
        if (lang === 'es-es' || name.includes('spain') || name.includes('castilian')) score -= 20
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
    const preferredVoice = getPreferredSpeechVoice(voiceLang, { preferGoogle: true })

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
    uid: userId,
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

function getLocalDateKey(value = Date.now()) {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function isResultCompleted(result) {
  return result?.attemptStatus !== 'abandoned'
}

function getResultClaimId(result) {
  return `${result?.sourceResultId ?? result?.id ?? 'result'}_${result?.createdAtMs ?? 0}`
}

function getResultRewardCoins(result) {
  if (!isResultCompleted(result)) return 0
  const score = Math.max(0, Number(result?.totalScore ?? 0))
  const percentage = Math.max(0, Number(result?.percentage ?? 0))
  return Math.max(6, Math.min(30, Math.round(score / 4) + Math.round(percentage / 25)))
}

function getScopedStorageKey(baseKey, scopeKey) {
  const normalizedScope = String(scopeKey || 'global')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')

  return `${baseKey}_${normalizedScope || 'global'}`
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

function mixHexColors(colorA, colorB, weight = 0.5) {
  const safeWeight = Math.max(0, Math.min(1, weight))
  const normalizeHex = (value) => {
    if (typeof value !== 'string') return null
    const clean = value.replace('#', '').trim()
    if (clean.length === 3) {
      return clean.split('').map((part) => `${part}${part}`).join('')
    }
    return clean.length === 6 ? clean : null
  }

  const parseHex = (value) => {
    const hex = normalizeHex(value)
    if (!hex) return null
    return {
      r: Number.parseInt(hex.slice(0, 2), 16),
      g: Number.parseInt(hex.slice(2, 4), 16),
      b: Number.parseInt(hex.slice(4, 6), 16),
    }
  }

  const colorOne = parseHex(colorA)
  const colorTwo = parseHex(colorB)
  if (!colorOne || !colorTwo) return colorA || colorB || '#000000'

  const mixChannel = (first, second) => Math.round(first * (1 - safeWeight) + second * safeWeight)
  return `#${[mixChannel(colorOne.r, colorTwo.r), mixChannel(colorOne.g, colorTwo.g), mixChannel(colorOne.b, colorTwo.b)]
    .map((channel) => channel.toString(16).padStart(2, '0'))
    .join('')}`
}

function colorWithAlpha(hexColor, alpha) {
  const normalized = mixHexColors(hexColor, '#000000', 0)
  const clean = normalized.replace('#', '')
  const red = Number.parseInt(clean.slice(0, 2), 16)
  const green = Number.parseInt(clean.slice(2, 4), 16)
  const blue = Number.parseInt(clean.slice(4, 6), 16)
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}

function AvatarPreview({ avatar, studentName }) {
  const safeAvatar = normalizeAvatarState(avatar, avatar?.totalCompletedRuns ?? 0)
  const character =
    AVATAR_CHARACTER_MAP[safeAvatar.selectedCharacterId] ?? AVATAR_CHARACTER_MAP[AVATAR_BASE_CHARACTER_IDS[0]]
  const topItem = AVATAR_ITEM_MAP[safeAvatar.equipped.top] ?? AVATAR_ITEM_MAP['top-classic']
  const shoesItem = AVATAR_ITEM_MAP[safeAvatar.equipped.shoes] ?? AVATAR_ITEM_MAP['shoes-classic']
  const hatItem = safeAvatar.equipped.hat ? AVATAR_ITEM_MAP[safeAvatar.equipped.hat] : null
  const accessoryItem = safeAvatar.equipped.accessory ? AVATAR_ITEM_MAP[safeAvatar.equipped.accessory] : null
  const quickItems = [
    { label: 'Avatar', name: character.name, accent: character.style.accent },
    { label: 'Clothes', name: topItem.name, accent: topItem.style.fill },
    { label: 'Items', name: accessoryItem?.name || hatItem?.name || 'No extras', accent: accessoryItem?.style.fill || hatItem?.style.fill || '#c9d3f5' },
    { label: 'Shoes', name: shoesItem.name, accent: shoesItem.style.fill },
  ]
  const gradientSeed = `avatar_${character.id}_${topItem.id}_${shoesItem.id}`
  const skinLight = mixHexColors(character.style.skin, '#ffffff', 0.32)
  const skinShade = mixHexColors(character.style.skin, '#8f5a47', 0.24)
  const hairLight = mixHexColors(character.style.hair, '#ffffff', 0.14)
  const hairShade = mixHexColors(character.style.hair, '#000000', 0.28)
  const topLight = mixHexColors(topItem.style.fill, '#ffffff', 0.22)
  const topShade = mixHexColors(topItem.style.accent, '#000000', 0.12)
  const topTrim = mixHexColors(topItem.style.trim, '#ffffff', 0.18)
  const shortsBase = mixHexColors(character.style.accent, '#243a74', 0.48)
  const shortsShade = mixHexColors(shortsBase, '#000000', 0.22)
  const sockTone = mixHexColors(shoesItem.style.trim, '#ffffff', 0.35)
  const shoeLight = mixHexColors(shoesItem.style.fill, '#ffffff', 0.18)
  const shoeShade = mixHexColors(shoesItem.style.accent, '#000000', 0.18)
  const mouthTone = mixHexColors(character.style.blush, '#b25659', 0.38)
  const stageShadow = colorWithAlpha(character.style.accent, 0.14)

  return (
    <div className="avatar-stage" style={{ '--avatar-stage-glow': character.style.stageGlow }}>
      <div className="avatar-classroom-bg" aria-hidden="true">
        <div className="avatar-bunting">
          {['#ff6f61', '#ffd166', '#5bc0eb', '#70d39a', '#b388ff'].map((color, index) => (
            <span key={`${color}_${index}`} style={{ '--bunting-color': color }} />
          ))}
        </div>
        <div className="avatar-chalkboard">
          <small>WELCOME</small>
          <strong>3RD GRADE</strong>
        </div>
        <div className="avatar-classroom-shelf">
          <span className="shelf-book blue" />
          <span className="shelf-book gold" />
          <span className="shelf-book coral" />
          <span className="shelf-block">A</span>
          <span className="shelf-block">3</span>
        </div>
        <div className="avatar-floor" />
      </div>

      <div className="avatar-figure-wrap">
        <div className="avatar-stage-glow" aria-hidden="true" />
        <svg className="avatar-canvas" viewBox="0 0 220 260" role="img" aria-label={`${studentName} avatar`}>
          <defs>
            <linearGradient id={`${gradientSeed}_skin`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={skinLight} />
              <stop offset="100%" stopColor={skinShade} />
            </linearGradient>
            <linearGradient id={`${gradientSeed}_hair`} x1="0" y1="0" x2="0.9" y2="1">
              <stop offset="0%" stopColor={hairLight} />
              <stop offset="100%" stopColor={hairShade} />
            </linearGradient>
            <linearGradient id={`${gradientSeed}_top`} x1="0" y1="0" x2="0.9" y2="1">
              <stop offset="0%" stopColor={topLight} />
              <stop offset="100%" stopColor={topShade} />
            </linearGradient>
            <linearGradient id={`${gradientSeed}_shorts`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={shortsBase} />
              <stop offset="100%" stopColor={shortsShade} />
            </linearGradient>
            <linearGradient id={`${gradientSeed}_shoe`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={shoeLight} />
              <stop offset="100%" stopColor={shoeShade} />
            </linearGradient>
            <filter id={`${gradientSeed}_shadow`} x="-30%" y="-20%" width="160%" height="180%">
              <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor={colorWithAlpha('#16204f', 0.22)} />
            </filter>
          </defs>

          <ellipse cx="110" cy="228" rx="58" ry="14" fill={stageShadow} />

          {accessoryItem?.id === 'accessory-gold-cape' && (
            <path
              d="M75 116 C78 160, 82 194, 66 216 L100 207 L120 219 L142 207 L174 216 C159 194, 162 160, 145 116 Z"
              fill={accessoryItem.style.fill}
              opacity="0.96"
            />
          )}

          {accessoryItem?.id === 'accessory-school-backpack' && (
            <>
              <path d="M76 122 C72 136, 71 158, 74 184 L89 184 L92 123 Z" fill={accessoryItem.style.accent} opacity="0.92" />
              <path d="M146 122 C149 136, 150 158, 147 184 L132 184 L129 123 Z" fill={accessoryItem.style.accent} opacity="0.92" />
              <path d="M72 136 C74 128, 82 124, 90 126 L90 177 C81 180, 74 175, 72 166 Z" fill={accessoryItem.style.fill} />
            </>
          )}

          <g filter={`url(#${gradientSeed}_shadow)`}>
            <path d="M80 85 C76 56, 92 40, 111 40 C132 40, 146 55, 142 88 L136 134 H84 Z" fill={`url(#${gradientSeed}_hair)`} />
            <path d="M98 104 H122 V120 H98 Z" fill={`url(#${gradientSeed}_skin)`} />
            <ellipse cx="82" cy="87" rx="6" ry="9" fill={`url(#${gradientSeed}_skin)`} />
            <ellipse cx="138" cy="87" rx="6" ry="9" fill={`url(#${gradientSeed}_skin)`} />
            <ellipse cx="110" cy="84" rx="31" ry="35" fill={`url(#${gradientSeed}_skin)`} />
            <ellipse cx="100" cy="78" rx="10" ry="6" fill="rgba(255,255,255,0.22)" />
            <path d="M78 83 C82 53, 102 46, 114 47 C134 49, 145 60, 142 87 C135 75, 125 66, 110 65 C96 65, 86 72, 78 90 Z" fill={`url(#${gradientSeed}_hair)`} />
            <path d="M77 80 C82 60, 73 57, 71 87 C72 102, 77 110, 86 116 Z" fill={`url(#${gradientSeed}_hair)`} />
            <path d="M143 80 C139 60, 149 57, 151 88 C149 102, 144 109, 135 116 Z" fill={`url(#${gradientSeed}_hair)`} />

            {['hat-red-cap', 'hat-sun-cap'].includes(hatItem?.id) && (
              <>
                <path d="M82 52 C91 34, 126 30, 140 51 L140 64 L82 64 Z" fill={hatItem.style.fill} />
                <path d="M131 61 C146 62, 156 67, 161 76 L127 75 Z" fill={hatItem.style.accent} />
              </>
            )}

            {hatItem?.id === 'hat-explorer' && (
              <>
                <ellipse cx="110" cy="55" rx="41" ry="12" fill={hatItem.style.accent} />
                <path d="M86 58 C88 36, 134 35, 137 58 L137 73 L86 73 Z" fill={hatItem.style.fill} />
                <ellipse cx="110" cy="73" rx="46" ry="11" fill={hatItem.style.trim} />
              </>
            )}

            {hatItem?.id === 'hat-cozy-beanie' && (
              <>
                <path d="M82 57 C87 35, 133 35, 138 57 L138 72 L82 72 Z" fill={hatItem.style.fill} />
                <rect x="80" y="68" width="60" height="10" rx="5" fill={hatItem.style.accent} />
                <circle cx="110" cy="43" r="8" fill={hatItem.style.trim} />
              </>
            )}

            {hatItem?.id === 'hat-headphones' && (
              <>
                <path d="M82 82 C82 54, 138 54, 138 82" stroke={hatItem.style.fill} strokeWidth="7" fill="none" strokeLinecap="round" />
                <rect x="73" y="82" width="11" height="24" rx="6" fill={hatItem.style.accent} />
                <rect x="136" y="82" width="11" height="24" rx="6" fill={hatItem.style.accent} />
              </>
            )}

            <path d="M90 82 C93 79, 98 79, 101 82" stroke="#25315d" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <path d="M119 82 C122 79, 127 79, 130 82" stroke="#25315d" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <ellipse cx="98" cy="86" rx="4.2" ry="4.6" fill="#20305b" />
            <ellipse cx="122" cy="86" rx="4.2" ry="4.6" fill="#20305b" />
            <circle cx="99.4" cy="84.8" r="1.1" fill="rgba(255,255,255,0.8)" />
            <circle cx="123.4" cy="84.8" r="1.1" fill="rgba(255,255,255,0.8)" />
            <ellipse cx="91" cy="97" rx="5" ry="4.2" fill={character.style.blush} opacity="0.38" />
            <ellipse cx="129" cy="97" rx="5" ry="4.2" fill={character.style.blush} opacity="0.38" />
            <path d="M109 89 C108 95, 108 99, 112 102" stroke={skinShade} strokeWidth="2.1" strokeLinecap="round" fill="none" opacity="0.7" />
            <path d="M99 103 C104 108, 116 108, 121 103" stroke={mouthTone} strokeWidth="3" strokeLinecap="round" fill="none" />

            {['accessory-star-glasses', 'accessory-violet-glasses'].includes(accessoryItem?.id) && (
              <>
                <rect x="84" y="82" width="18" height="12" rx="5" stroke={accessoryItem.style.accent} strokeWidth="3" fill="none" />
                <rect x="118" y="82" width="18" height="12" rx="5" stroke={accessoryItem.style.accent} strokeWidth="3" fill="none" />
                <path d="M102 88 H118" stroke={accessoryItem.style.accent} strokeWidth="3" strokeLinecap="round" />
              </>
            )}

            <path d="M78 127 C73 137, 71 154, 77 170 C80 179, 90 183, 97 177 L94 122 C87 120, 81 122, 78 127 Z" fill={`url(#${gradientSeed}_skin)`} />
            <path d="M142 127 C147 137, 149 154, 143 170 C140 179, 130 183, 123 177 L126 122 C133 120, 139 122, 142 127 Z" fill={`url(#${gradientSeed}_skin)`} />
            <path d="M93 121 C95 114, 100 110, 108 110 H112 C120 110, 126 114, 128 121" stroke={topTrim} strokeWidth="10" strokeLinecap="round" opacity="0.72" />
            <path d="M78 121 C83 107, 95 101, 110 101 C125 101, 137 107, 142 121 L147 179 C137 185, 83 185, 73 179 Z" fill={`url(#${gradientSeed}_top)`} />
            <path d="M86 123 C93 133, 127 133, 134 123" stroke={topTrim} strokeWidth="7" strokeLinecap="round" opacity="0.62" />
            <path d="M88 129 C100 138, 120 138, 132 129" stroke={topShade} strokeWidth="2" strokeLinecap="round" opacity="0.22" />

            {topItem.id === 'top-mint-hoodie' && (
              <>
                <path d="M91 114 C94 101, 126 101, 129 114" stroke={topItem.style.accent} strokeWidth="5" fill="none" strokeLinecap="round" />
                <path d="M110 125 V153" stroke={topItem.style.accent} strokeWidth="2.6" strokeLinecap="round" />
              </>
            )}

            {topItem.id === 'top-sun-jacket' && (
              <>
                <path d="M110 112 V180" stroke={topItem.style.accent} strokeWidth="4" strokeLinecap="round" />
                <path d="M91 139 H101" stroke={topItem.style.accent} strokeWidth="4" strokeLinecap="round" />
                <path d="M119 139 H129" stroke={topItem.style.accent} strokeWidth="4" strokeLinecap="round" />
              </>
            )}

            {topItem.id === 'top-striped-tee' && (
              <>
                {['#ff6f61', '#70d39a', '#5bc0eb', '#ffd166'].map((stripeColor, index) => (
                  <path
                    key={`${stripeColor}_${index}`}
                    d={`M84 ${126 + index * 11} H136`}
                    stroke={stripeColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                ))}
              </>
            )}

            {topItem.id === 'top-denim-jacket' && (
              <>
                <path d="M110 112 V181" stroke={topItem.style.accent} strokeWidth="4" strokeLinecap="round" />
                <path d="M92 129 H101" stroke={topItem.style.trim} strokeWidth="4" strokeLinecap="round" />
                <path d="M119 129 H128" stroke={topItem.style.trim} strokeWidth="4" strokeLinecap="round" />
              </>
            )}

            {topItem.id === 'top-dino-shirt' && (
              <>
                <path d="M101 142 C109 134, 121 138, 122 148 C118 154, 111 155, 104 151 Z" fill={topItem.style.accent} />
                <circle cx="121" cy="145" r="2" fill="#223d2f" />
              </>
            )}

            {topItem.id === 'top-flower-dress' && (
              <>
                <path d="M78 155 C95 149, 125 149, 142 155 L151 199 C134 207, 86 207, 69 199 Z" fill={`url(#${gradientSeed}_top)`} />
                {[88, 104, 120, 136].map((cx, index) => (
                  <g key={`flower_${cx}_${index}`}>
                    <circle cx={cx} cy={170 + (index % 2) * 11} r="4.6" fill={topItem.style.accent} />
                    <circle cx={cx - 5} cy={170 + (index % 2) * 11} r="2.5" fill={topItem.style.trim} />
                    <circle cx={cx + 5} cy={170 + (index % 2) * 11} r="2.5" fill={topItem.style.trim} />
                    <circle cx={cx} cy={165 + (index % 2) * 11} r="2.5" fill={topItem.style.trim} />
                    <circle cx={cx} cy={175 + (index % 2) * 11} r="2.5" fill={topItem.style.trim} />
                  </g>
                ))}
              </>
            )}

            {accessoryItem?.id === 'accessory-rainbow-scarf' && (
              <>
                <rect x="84" y="122" width="52" height="13" rx="6" fill={accessoryItem.style.fill} />
                <path d="M128 124 L139 165" stroke={accessoryItem.style.accent} strokeWidth="9" strokeLinecap="round" />
                <path d="M84 128 H136" stroke={accessoryItem.style.trim} strokeWidth="3" strokeLinecap="round" />
              </>
            )}

            {accessoryItem?.id === 'accessory-lightning-badge' && (
              <path d="M111 139 L103 153 H110 L106 165 L120 149 H113 L118 139 Z" fill={accessoryItem.style.fill} />
            )}

            {accessoryItem?.id === 'accessory-water-bottle' && (
              <>
                <rect x="139" y="145" width="13" height="29" rx="6" fill={accessoryItem.style.fill} />
                <rect x="142" y="139" width="7" height="8" rx="2" fill={accessoryItem.style.accent} />
              </>
            )}

            {accessoryItem?.id === 'accessory-story-book' && (
              <>
                <rect x="67" y="146" width="18" height="24" rx="4" fill={accessoryItem.style.fill} />
                <path d="M76 149 V166" stroke={accessoryItem.style.trim} strokeWidth="2" strokeLinecap="round" />
              </>
            )}

            <path d="M84 180 C92 176, 100 176, 108 180 L104 226 C97 229, 90 229, 86 225 Z" fill={`url(#${gradientSeed}_skin)`} />
            <path d="M112 180 C120 176, 128 176, 136 180 L134 225 C130 229, 122 229, 115 226 Z" fill={`url(#${gradientSeed}_skin)`} />
            <path d="M82 179 C93 176, 101 176, 110 179" stroke={shortsShade} strokeWidth="2" strokeLinecap="round" opacity="0.35" />
            <path d="M110 179 C119 176, 127 176, 138 179" stroke={shortsShade} strokeWidth="2" strokeLinecap="round" opacity="0.35" />
            <path d="M80 175 C90 170, 130 170, 140 175 L138 194 C126 198, 94 198, 82 194 Z" fill={`url(#${gradientSeed}_shorts)`} />
            <path d="M80 175 C92 179, 128 179, 140 175" stroke="rgba(255,255,255,0.22)" strokeWidth="3" strokeLinecap="round" />
            <path d="M89 196 H103 V222 H86 Z" fill={sockTone} />
            <path d="M118 196 H132 V222 H117 Z" fill={sockTone} />

            <path d="M82 222 C93 218, 106 219, 110 228 C103 233, 86 234, 79 231 C79 226, 80 223, 82 222 Z" fill={`url(#${gradientSeed}_shoe)`} />
            <path d="M110 228 C118 221, 129 219, 138 222 C141 223, 142 226, 142 231 C135 234, 118 233, 110 228 Z" fill={`url(#${gradientSeed}_shoe)`} />
            <path d="M83 228 H109" stroke={shoesItem.style.trim} strokeWidth="3" strokeLinecap="round" />
            <path d="M111 228 H138" stroke={shoesItem.style.trim} strokeWidth="3" strokeLinecap="round" />

            {shoesItem.id === 'shoes-rocket' && (
              <>
                <path d="M78 229 L72 235 L82 234 Z" fill="#ff9f43" />
                <path d="M142 229 L148 235 L138 234 Z" fill="#ff9f43" />
              </>
            )}

            {['shoes-trail-boots', 'shoes-cloud-boots'].includes(shoesItem.id) && (
              <>
                <path d="M85 220 H106" stroke={shoesItem.style.accent} strokeWidth="3" strokeLinecap="round" />
                <path d="M114 220 H135" stroke={shoesItem.style.accent} strokeWidth="3" strokeLinecap="round" />
              </>
            )}

            {shoesItem.id === 'shoes-red-runners' && (
              <>
                <path d="M87 221 H103" stroke={shoesItem.style.trim} strokeWidth="3" strokeLinecap="round" />
                <path d="M117 221 H133" stroke={shoesItem.style.trim} strokeWidth="3" strokeLinecap="round" />
              </>
            )}
          </g>
        </svg>
      </div>

      <div className="avatar-quick-column">
        {quickItems.map((quickItem) => (
          <div key={quickItem.label} className="avatar-quick-card">
            <span className="avatar-quick-dot" style={{ '--quick-accent': quickItem.accent }} />
            <div>
              <small>{quickItem.label}</small>
              <strong>{quickItem.name}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="avatar-stage-caption">
        <strong>
          {studentName} as {character.name}
        </strong>
        <span>Earn coins from tests, buy gear, and unlock free clothes every 10 completed runs.</span>
      </div>
    </div>
  )
}

function AvatarStudio({
  studentName,
  avatar,
  onEquipItem,
  onSelectCharacter,
  onPurchaseItem,
  requestedPanel,
  panelFocusKey,
  storeNotice,
  onDismissStoreNotice,
}) {
  const safeAvatar = normalizeAvatarState(avatar, avatar?.totalCompletedRuns ?? 0)
  const progress = getAvatarProgressSummary(safeAvatar)
  const [activePanel, setActivePanel] = useState('closet')
  const [activeClosetTab, setActiveClosetTab] = useState('avatars')
  const [activeStoreFilter, setActiveStoreFilter] = useState('all')
  const panelRef = useRef(null)
  const selectedCharacterId = safeAvatar.selectedCharacterId ?? AVATAR_BASE_CHARACTER_IDS[0]
  const shopWardrobeItems = getShopWardrobeItems(safeAvatar)
  const shopCharacters = getShopCharacters(safeAvatar)
  const shopStickers = getShopStickers(safeAvatar)
  const clothesItems = getAvatarItemsForSlot('top', safeAvatar)
  const itemItems = [...getAvatarItemsForSlot('hat', safeAvatar), ...getAvatarItemsForSlot('accessory', safeAvatar)]
  const shoeItems = getAvatarItemsForSlot('shoes', safeAvatar)
  const storeEntries = [
    ...shopCharacters
      .filter((character) => activeStoreFilter === 'all' || activeStoreFilter === 'avatars')
      .map((character) => ({ kind: 'character', id: character.id, title: character.name, price: character.price, isOwned: character.isOwned, accent: character.style.accent, subtitle: character.unlockLabel })),
    ...shopWardrobeItems
      .filter((item) => activeStoreFilter === 'all' || getAvatarCategoryFromSlot(item.slot) === activeStoreFilter)
      .map((item) => ({ kind: 'item', id: item.id, title: item.name, price: item.purchasePrice ?? 0, isOwned: item.isOwned, accent: item.style.fill, subtitle: item.rewardLabel, slot: item.slot })),
    ...shopStickers
      .filter((sticker) => activeStoreFilter === 'all' || activeStoreFilter === 'stickers')
      .map((sticker) => ({ kind: 'sticker', id: sticker.id, title: sticker.name, price: sticker.price, isOwned: sticker.isOwned, accent: sticker.palette[0], subtitle: 'Sticker' })),
  ].filter((entry) => activeStoreFilter === 'all' || entry.kind === 'sticker' || entry.kind === 'character' || entry.kind === 'item')

  useEffect(() => {
    if (!requestedPanel) return
    setActivePanel(requestedPanel)
  }, [requestedPanel])

  useEffect(() => {
    if (requestedPanel !== 'store') return
    setActivePanel('store')
    setActiveStoreFilter('all')
    panelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [panelFocusKey, requestedPanel])

  function renderClosetCards(items, options = {}) {
    return (
      <div className="avatar-catalog-grid">
        {options.includeNone && (
          <button
            type="button"
            className={`avatar-catalog-card ${(options.selectedIds ?? []).includes('') ? 'is-selected' : ''}`}
            onClick={() => options.onClear?.()}
          >
            <span className="avatar-item-swatch is-none" />
            <strong>No extra item</strong>
            <small>Clear the slot</small>
          </button>
        )}

        {items.map((item) => {
          const isSelected = options.selectedIds?.includes(item.id)
          return (
            <button
              key={item.id}
              type="button"
              className={`avatar-catalog-card ${isSelected ? 'is-selected' : ''} ${item.isUnlocked ? '' : 'is-locked'}`}
              onClick={() => item.isUnlocked && onEquipItem(item.slot, item.id)}
              disabled={!item.isUnlocked}
            >
              <span
                className="avatar-item-swatch"
                style={{
                  '--swatch-fill': item.style.fill,
                  '--swatch-accent': item.style.accent,
                  '--swatch-trim': item.style.trim,
                }}
              />
              <strong>{item.name}</strong>
              <small>{item.rewardLabel}</small>
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <section ref={panelRef} className="panel-card avatar-panel avatar-panel-showroom">
      <div className="avatar-panel-top">
        <div>
          <div className="brand-pill">
            <Sparkles size={16} />
            <span>My Avatar</span>
          </div>
          <h2>Build a classroom look and spend coins in the store.</h2>
          <p>Every 10 completed tests unlocks a free clothing piece. The store uses the coins the student wins.</p>
        </div>
        <div className="avatar-progress-chip avatar-progress-chip-large">
          <Sparkles size={16} />
          <span>{progress.coins} coins ready to spend</span>
        </div>
      </div>

      <div className="avatar-summary-grid avatar-summary-grid-showroom">
        <div className="avatar-summary-card">
          <span>Completed runs</span>
          <strong>{progress.totalCompletedRuns}</strong>
        </div>
        <div className="avatar-summary-card">
          <span>Next free gift</span>
          <strong>{progress.nextReward?.name ?? 'Everything unlocked'}</strong>
        </div>
        <div className="avatar-summary-card">
          <span>Owned avatars</span>
          <strong>{progress.ownedCharacters}</strong>
        </div>
        <div className="avatar-summary-card">
          <span>Stickers collected</span>
          <strong>{progress.ownedStickers}</strong>
        </div>
      </div>

      <div className="avatar-progress-bar avatar-progress-bar-showroom" aria-hidden="true">
        <div style={{ width: `${progress.progressPercent}%` }} />
      </div>
      <p className="avatar-progress-copy avatar-progress-copy-showroom">
        {progress.nextReward
          ? `${progress.remainingRuns} more completed runs to unlock ${progress.nextReward.name}.`
          : 'All milestone rewards are already unlocked.'}
      </p>

      <div className="avatar-layout avatar-layout-showroom">
        <AvatarPreview avatar={safeAvatar} studentName={studentName} />

        <div className="avatar-catalog-panel">
          <div className="avatar-mode-tabs">
            <button
              type="button"
              className={activePanel === 'closet' ? 'is-active' : ''}
              onClick={() => setActivePanel('closet')}
            >
              Closet
            </button>
            <button
              type="button"
              className={activePanel === 'store' ? 'is-active' : ''}
              onClick={() => setActivePanel('store')}
            >
              Store
            </button>
          </div>

          {activePanel === 'closet' ? (
            <div className="avatar-catalog-surface">
              <div className="avatar-catalog-tabs">
                {AVATAR_CLOSET_TABS.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    className={activeClosetTab === tab.id ? `is-active tab-${tab.id}` : `tab-${tab.id}`}
                    onClick={() => setActiveClosetTab(tab.id)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeClosetTab === 'avatars' && (
                <div className="avatar-catalog-grid avatar-catalog-grid-characters">
                  {shopCharacters.map((character) => (
                    <button
                      key={character.id}
                      type="button"
                      className={`avatar-character-card avatar-showroom-character ${selectedCharacterId === character.id ? 'is-selected' : ''} ${character.isOwned ? '' : 'is-locked'}`}
                      onClick={() => (character.isOwned ? onSelectCharacter(character.id) : onPurchaseItem('character', character.id))}
                    >
                      <span
                        className="avatar-character-swatch"
                        style={{
                          '--character-skin': character.style.skin,
                          '--character-hair': character.style.hair,
                          '--character-accent': character.style.accent,
                        }}
                      />
                      <strong>{character.name}</strong>
                      <small>{character.isOwned ? 'Owned avatar' : `${character.price} coins`}</small>
                    </button>
                  ))}
                </div>
              )}

              {activeClosetTab === 'clothes' && renderClosetCards(clothesItems, { selectedIds: [safeAvatar.equipped.top] })}

              {activeClosetTab === 'items' && (
                <>
                  <div className="avatar-inline-actions">
                    <button
                      type="button"
                      className={`btn btn-ghost ${safeAvatar.equipped.hat === '' ? 'is-active-soft' : ''}`}
                      onClick={() => onEquipItem('hat', '')}
                    >
                      Clear hat
                    </button>
                    <button
                      type="button"
                      className={`btn btn-ghost ${safeAvatar.equipped.accessory === '' ? 'is-active-soft' : ''}`}
                      onClick={() => onEquipItem('accessory', '')}
                    >
                      Clear item
                    </button>
                  </div>
                  {renderClosetCards(itemItems, { selectedIds: [safeAvatar.equipped.hat, safeAvatar.equipped.accessory] })}
                </>
              )}

              {activeClosetTab === 'shoes' && renderClosetCards(shoeItems, { selectedIds: [safeAvatar.equipped.shoes] })}
            </div>
          ) : (
            <div className="avatar-catalog-surface">
              <div className="avatar-catalog-tabs avatar-catalog-tabs-store">
                {AVATAR_STORE_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    className={activeStoreFilter === filter.id ? 'is-active' : ''}
                    onClick={() => setActiveStoreFilter(filter.id)}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="avatar-store-note">
                Spend coins earned from tests. Snake coins are based on the best consecutive apple streak.
              </div>

              <div className="avatar-catalog-grid avatar-store-grid">
                {storeEntries.length === 0 ? (
                  <div className="empty-state compact">
                    <Sparkles size={16} />
                    <span>Everything in this section is already owned.</span>
                  </div>
                ) : (
                  storeEntries.map((entry) => {
                    const canAfford = entry.isOwned || progress.coins >= (entry.price ?? 0)
                    const missingCoins = Math.max(0, (entry.price ?? 0) - progress.coins)
                    const actionLabel =
                      entry.kind === 'character'
                        ? entry.isOwned
                          ? 'Use avatar'
                          : canAfford
                            ? `Buy for ${entry.price} coins`
                            : `Need ${missingCoins} more`
                        : entry.kind === 'sticker'
                          ? entry.isOwned
                            ? 'Owned'
                            : canAfford
                              ? `Buy for ${entry.price} coins`
                              : `Need ${missingCoins} more`
                          : entry.isOwned
                            ? 'Equip item'
                            : canAfford
                              ? `Buy for ${entry.price} coins`
                              : `Need ${missingCoins} more`

                    return (
                    <article
                      key={`${entry.kind}_${entry.id}`}
                      className={`avatar-catalog-card avatar-store-card ${entry.isOwned ? 'is-owned' : ''}`}
                    >
                      <span className="avatar-store-pill" style={{ '--store-accent': entry.accent }}>
                        {entry.kind === 'character'
                          ? 'Avatar'
                          : entry.kind === 'sticker'
                            ? 'Sticker'
                            : getAvatarCategoryFromSlot(entry.slot)}
                      </span>
                      <strong>{entry.title}</strong>
                      <small>{entry.subtitle}</small>
                      <span className="avatar-store-price">
                        {entry.isOwned ? 'Owned' : `${entry.price} coins`}
                      </span>
                      <button
                        type="button"
                        className={`btn ${entry.isOwned ? 'btn-ghost' : 'btn-primary'} avatar-store-action`}
                        onClick={() => {
                          if (entry.kind === 'character') {
                            entry.isOwned ? onSelectCharacter(entry.id) : onPurchaseItem('character', entry.id)
                            return
                          }
                          if (entry.kind === 'sticker') {
                            if (!entry.isOwned) onPurchaseItem('sticker', entry.id)
                            return
                          }
                          entry.isOwned
                            ? onEquipItem(entry.slot, entry.id)
                            : onPurchaseItem('item', entry.id)
                        }}
                        disabled={!entry.isOwned && !canAfford}
                      >
                        {actionLabel}
                      </button>
                    </article>
                  )})
                )}
              </div>

              <div className="avatar-store-wallet">
                <strong>{progress.coins} coins</strong>
                <span>Use the buy buttons below to unlock new avatar items.</span>
              </div>

              {storeNotice && (
                <div className="banner success avatar-store-banner">
                  <CheckCircle2 size={16} />
                  <span>
                    +{storeNotice.coinsEarned} coins added from {storeNotice.sourceLabel}. Your new balance is {progress.coins}.
                  </span>
                  <button type="button" className="btn btn-ghost" onClick={onDismissStoreNotice}>
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
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
  onStartSnakeGame,
  onSelectSubject,
  storageScopeKey,
}) {
  const usingGlobalPanels = globalResults.length > 0 || !personalResults.length
  const panelResults = usingGlobalPanels ? globalResults : personalResults
  const panelLoading = usingGlobalPanels ? globalResultsLoading : personalResultsLoading
  const [activeTip, setActiveTip] = useState('focus')
  const rewardStars = Math.min(5, Math.max(1, Math.floor((personalResults.length || 0) / 2) + 1))
  const [dailyMissionsState, setDailyMissionsState] = useState(null)
  const [coinWallet, setCoinWallet] = useState(0)
  const [claimedTestRewardIds, setClaimedTestRewardIds] = useState([])

  const missionsStorageKey = getScopedStorageKey(DAILY_MISSIONS_STORAGE_KEY, storageScopeKey)
  const walletStorageKey = getScopedStorageKey(COIN_WALLET_STORAGE_KEY, storageScopeKey)
  const claimsStorageKey = getScopedStorageKey(CLAIMED_TEST_REWARDS_STORAGE_KEY, storageScopeKey)

  const todayKey = getLocalDateKey()
  const completedResults = personalResults.filter(isResultCompleted)
  const todayCompletedResults = completedResults.filter(
    (result) => getLocalDateKey(result.createdAtMs) === todayKey,
  )
  const todayMathCompletions = todayCompletedResults.filter((result) => result.subjectId === 'math').length
  const todayBestPerfectCount = todayCompletedResults.reduce(
    (bestCount, result) => Math.max(bestCount, Number(result?.perfectOriginalCount ?? 0)),
    0,
  )
  const todaySnakeCompletions = todayCompletedResults.filter(
    (result) => result.subjectId === 'games' && result.testId === 'snake',
  ).length

  const missionProgressMap = {
    'mission-1': Math.min(todayMathCompletions, DAILY_MISSIONS[0].goal),
    'mission-2': Math.min(todayBestPerfectCount, DAILY_MISSIONS[1].goal),
    'mission-3': Math.min(todaySnakeCompletions, DAILY_MISSIONS[2].goal),
  }

  useEffect(() => {
    const defaultMissionsState = {
      dateKey: todayKey,
      claimed: false,
    }

    if (typeof window === 'undefined') {
      setDailyMissionsState(defaultMissionsState)
      return
    }

    try {
      const rawMissions = window.localStorage.getItem(missionsStorageKey)
      const parsedMissions = rawMissions ? JSON.parse(rawMissions) : null
      const missionsState =
        parsedMissions?.dateKey === todayKey
          ? {
              dateKey: todayKey,
              claimed: Boolean(parsedMissions?.claimed),
            }
          : defaultMissionsState

      const rawWallet = window.localStorage.getItem(walletStorageKey)
      const parsedWallet = Number(rawWallet)
      const nextWallet = Number.isFinite(parsedWallet) ? Math.max(0, Math.floor(parsedWallet)) : 0

      const rawClaims = window.localStorage.getItem(claimsStorageKey)
      const parsedClaims = rawClaims ? JSON.parse(rawClaims) : []
      const nextClaimedIds = Array.isArray(parsedClaims)
        ? parsedClaims.filter((claimId) => typeof claimId === 'string')
        : []

      setDailyMissionsState(missionsState)
      setCoinWallet(nextWallet)
      setClaimedTestRewardIds(nextClaimedIds)
    } catch (error) {
      console.warn('Could not load missions and rewards state:', error)
      setDailyMissionsState(defaultMissionsState)
      setCoinWallet(0)
      setClaimedTestRewardIds([])
    }
  }, [claimsStorageKey, missionsStorageKey, todayKey, walletStorageKey])

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      if (dailyMissionsState) {
        window.localStorage.setItem(missionsStorageKey, JSON.stringify(dailyMissionsState))
      }
      window.localStorage.setItem(walletStorageKey, String(Math.max(0, Math.floor(coinWallet))))
      window.localStorage.setItem(claimsStorageKey, JSON.stringify(claimedTestRewardIds))
    } catch (error) {
      console.warn('Could not save missions and rewards state:', error)
    }
  }, [claimedTestRewardIds, claimsStorageKey, coinWallet, dailyMissionsState, missionsStorageKey, walletStorageKey])

  const pendingTestRewards = completedResults
    .map((result) => ({
      id: getResultClaimId(result),
      coins: getResultRewardCoins(result),
    }))
    .filter((rewardEntry) => rewardEntry.coins > 0 && !claimedTestRewardIds.includes(rewardEntry.id))

  const pendingTestRewardCoins = pendingTestRewards.reduce(
    (total, rewardEntry) => total + rewardEntry.coins,
    0,
  )

  const completedMissionCount = DAILY_MISSIONS.filter(
    (mission) => (missionProgressMap[mission.id] ?? 0) >= mission.goal,
  ).length
  const allMissionsCompleted = completedMissionCount === DAILY_MISSIONS.length
  const totalMissionReward = DAILY_MISSIONS.reduce((sum, mission) => sum + mission.reward, 0)

  function claimCompletedTestRewards() {
    if (!pendingTestRewards.length) return

    setClaimedTestRewardIds((currentIds) =>
      Array.from(new Set([...currentIds, ...pendingTestRewards.map((rewardEntry) => rewardEntry.id)])),
    )
    setCoinWallet((currentCoins) => currentCoins + pendingTestRewardCoins)
    playSound('coin', true)
  }

  function claimDailyReward() {
    if (!allMissionsCompleted || dailyMissionsState?.claimed) return

    setDailyMissionsState({
      dateKey: todayKey,
      claimed: true,
    })
    setCoinWallet((currentCoins) => currentCoins + totalMissionReward)
    playSound('win', true)
  }

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
            Choose a subject, pick a challenge, and keep your streak going.
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
            <span>Coins wallet</span>
            <strong>{coinWallet}</strong>
          </div>
          <div className="mini-stat">
            <span>Pending claim</span>
            <strong>+{pendingTestRewardCoins}</strong>
          </div>
        </div>
      </section>

      <section className="panel-card kids-guide-card" aria-label="Quick guide for students">
        <div className="panel-card-header">
          <div>
            <h2>How to play and learn</h2>
            <p>Clear steps for ages 7 to 10, with quick rewards while learning.</p>
          </div>
          <div className="kids-stars" aria-hidden="true">{'⭐'.repeat(rewardStars)}</div>
        </div>

        <div className="kids-guide-grid">
          <button type="button" className={`kids-tip ${activeTip === 'focus' ? 'is-active' : ''}`} onClick={() => setActiveTip('focus')}>
            🎯 Focus Mode
          </button>
          <button type="button" className={`kids-tip ${activeTip === 'practice' ? 'is-active' : ''}`} onClick={() => setActiveTip('practice')}>
            🧠 Smart Practice
          </button>
          <button type="button" className={`kids-tip ${activeTip === 'streak' ? 'is-active' : ''}`} onClick={() => setActiveTip('streak')}>
            🚀 Streak Boost
          </button>
        </div>

        <p className="kids-tip-copy">
          {activeTip === 'focus' && 'Read the question first, then choose your answer calmly. Speed comes after accuracy.'}
          {activeTip === 'practice' && 'Wrong answer? No problem. Try again and use feedback to improve in the next round.'}
          {activeTip === 'streak' && 'Complete games and tests in a row to build confidence and collect more coins.'}
        </p>
      </section>

      <section className="panel-card" aria-label="Completed tests rewards">
        <div className="panel-card-header">
          <div>
            <h2>Completed Test Rewards</h2>
            <p>Coins are tracked automatically when a real test is finished. Just claim them here.</p>
          </div>
          <span className="mission-progress-chip">{pendingTestRewards.length} pending</span>
        </div>

        <div className="mission-footer">
          <button
            type="button"
            className="btn btn-primary"
            onClick={claimCompletedTestRewards}
            disabled={pendingTestRewardCoins <= 0}
          >
            {pendingTestRewardCoins > 0
              ? `Claim +${pendingTestRewardCoins} coins from completed tests`
              : 'No coins pending right now'}
          </button>
        </div>
      </section>

      <section className="panel-card mission-panel" aria-label="Daily mini missions">
        <div className="panel-card-header">
          <div>
            <h2>Daily Mini Missions (Now Live)</h2>
            <p>Small goals, big confidence. Finish all 3 missions to unlock today&apos;s reward.</p>
          </div>
          <span className="mission-progress-chip">{completedMissionCount}/3 done</span>
        </div>

        <div className="mission-grid">
          {DAILY_MISSIONS.map((mission) => {
            const progressValue = missionProgressMap[mission.id] ?? 0
            const done = progressValue >= mission.goal

            return (
              <article key={mission.id} className={`mission-card ${done ? 'is-done' : ''}`}>
                <strong>{mission.label}</strong>
                <small>Reward: +{mission.reward} coins</small>
                <div className="mission-track">
                  <div style={{ width: `${Math.round((progressValue / mission.goal) * 100)}%` }} />
                </div>
                <div className="mission-row">
                  <span>
                    {progressValue}/{mission.goal}
                  </span>
                  <span className="mission-status-chip">
                    {done ? 'Completed ✅' : 'Auto-tracked from real tests'}
                  </span>
                </div>
              </article>
            )
          })}
        </div>

        <div className="mission-footer">
          <button
            type="button"
            className="btn btn-primary"
            disabled={!allMissionsCompleted || dailyMissionsState?.claimed}
            onClick={claimDailyReward}
          >
            {dailyMissionsState?.claimed ? 'Reward claimed 🎉' : `Claim +${totalMissionReward} coins`}
          </button>
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
            <h2>Special Modes</h2>
            <p>Jump into a mixed challenge or the new arcade games area.</p>
          </div>
        </div>
        <div className="tests-grid special-modes-grid">
          <TestCard test={FULL_TEST_CARD} onSelect={onStartFullTest} />
          <TestCard test={GAMES_CARD} onSelect={onStartSnakeGame} />
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

function MultiplicationChallenge({
  onBack,
  onSaveResult,
  studentName,
  topTestRecord,
  operation = 'multiply',
  testId = 'multiplication',
  testName = 'Multiplication',
}) {
  const questionCount = MULTIPLICATION_QUESTION_COUNT
  const OperationIcon = operation === 'add' ? Plus : operation === 'subtract' ? Minus : X
  const operationLabel = operation === 'add' ? 'Addition' : operation === 'subtract' ? 'Subtraction' : 'Multiplication'
  const [phase, setPhase] = useState('playing')
  const [queue, setQueue] = useState([])
  const [currentOptions, setCurrentOptions] = useState([])
  const [attemptsOnCurrent, setAttemptsOnCurrent] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [totalScore, setTotalScore] = useState(0)
  const [perfectOriginalCount, setPerfectOriginalCount] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const [lastResult, setLastResult] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [reviewExercises, setReviewExercises] = useState([])

  const clearFeedbackTimerRef = useRef(null)
  const advanceTimerRef = useRef(null)
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
    const initialQueue = generateArithmeticQuestions(operation, questionCount)
    setQueue(initialQueue)
    setTotalScore(0)
    setPerfectOriginalCount(0)
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
    const answeredOriginalCount = questionCount - remainingOriginalCount
    const pendingExercises = completionMode === 'abandoned' ? getPendingOriginalExercises(queueSnapshot) : []
    const reviewExercisesSummary = mergeExerciseRecords(
      reviewExercisesRef.current,
      options.extraReviewExercises ?? [],
    )

    clearTimers()

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
      testId,
      testName,
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

  function handleGuess(guessedValue) {
    if (feedback === 'correct') return
    const currentQuestion = queue[0]
    if (!currentQuestion) return

    if (guessedValue === currentQuestion.answer) {
      if (clearFeedbackTimerRef.current) window.clearTimeout(clearFeedbackTimerRef.current)

      const pointsEarned = currentQuestion.isRetry ? 0 : calculatePoints(attemptsOnCurrent)
      const nextScore = totalScore + pointsEarned

      if (attemptsOnCurrent > 0) {
        addReviewExercise(currentQuestion)
      }

      setTotalScore(nextScore)
      setFeedback('correct')

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
  const progressPercentage = Math.round((perfectOriginalCount / questionCount) * 100)

  return (
    <section className={`game-shell ${isFullscreen ? 'is-fullscreen' : ''}`}>
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
            {operationLabel} World · Questions in queue: {queue.length}
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
          <div className="question-meta">
            {currentQuestion.isRetry ? (
              <span className="badge badge-soon">Reinforcement (0 pts)</span>
            ) : (
              <span className="badge badge-live">Scored question</span>
            )}
          </div>

          <div className={`question-card ${feedback ? `feedback-${feedback}` : ''}`}>
            <div className="question-number">{currentQuestion.n1}</div>
            <OperationIcon size={36} className="question-symbol" />
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
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const [lastResult, setLastResult] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [reviewProblems, setReviewProblems] = useState([])
  const [currentExplanationText, setCurrentExplanationText] = useState('')

  const clearFeedbackTimerRef = useRef(null)
  const advanceTimerRef = useRef(null)
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

  return (
    <section className={`game-shell ${isFullscreen ? 'is-fullscreen' : ''}`}>
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
  const [saveStatus, setSaveStatus] = useState('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const [lastResult, setLastResult] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [reviewQuestions, setReviewQuestions] = useState([])

  const clearFeedbackTimerRef = useRef(null)
  const advanceTimerRef = useRef(null)
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

      const pointsEarned = currentQuestion.isRetry ? 0 : calculatePoints(attemptsOnCurrent)
      const nextScore = totalScore + pointsEarned

      if (attemptsOnCurrent > 0) {
        addReviewQuestion(currentQuestion)
      }

      setTotalScore(nextScore)
      setFeedback('correct')

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

  return (
    <section className={`game-shell ${isFullscreen ? 'is-fullscreen' : ''}`}>
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
  const [currentLetterTiles, setCurrentLetterTiles] = useState([])
  const [selectedLetterTileIds, setSelectedLetterTileIds] = useState([])
  const [attemptsOnCurrent, setAttemptsOnCurrent] = useState(0)
  const [feedback, setFeedback] = useState(null)
  const [totalScore, setTotalScore] = useState(0)
  const [perfectOriginalCount, setPerfectOriginalCount] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const [lastResult, setLastResult] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [reviewWords, setReviewWords] = useState([])

  const clearFeedbackTimerRef = useRef(null)
  const advanceTimerRef = useRef(null)
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
    if (question?.responseMode === 'build') {
      setCurrentOptions([])
      setCurrentLetterTiles(
        (question.letterPool ?? []).map((letter, index) => ({
          id: `${question.id}_tile_${index}_${letter}`,
          letter,
        })),
      )
      setSelectedLetterTileIds([])
    } else {
      setCurrentOptions((question?.options ?? []).map((value) => ({ value, isHidden: false })))
      setCurrentLetterTiles([])
      setSelectedLetterTileIds([])
    }
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
          const regeneratedQuestion = buildSpellingQuestion(
            currentQuestion.baseWord || currentQuestion.word,
            config,
            Date.now(),
            currentQuestion.responseMode ?? 'choice',
          )
          const retryQuestion = {
            ...currentQuestion,
            ...regeneratedQuestion,
            id: `retry_word_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
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
    if (currentQuestion.responseMode === 'build') {
      setSelectedLetterTileIds([])
      setCurrentLetterTiles((previous) => shuffleArray(previous))
    } else {
      setCurrentOptions((previous) =>
        previous.map((option) =>
          option.value === guessedValue ? { ...option, isHidden: true } : option,
        ),
      )
    }

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

  function handleLetterTilePick(tileId) {
    const currentQuestion = queue[0]
    if (!currentQuestion || currentQuestion.responseMode !== 'build') return
    if (feedback === 'correct') return
    if (selectedLetterTileIds.includes(tileId)) return
    if (selectedLetterTileIds.length >= currentQuestion.answer.length) return

    setSelectedLetterTileIds((previous) => [...previous, tileId])
  }

  function handleLetterBackspace() {
    if (feedback === 'correct') return
    setSelectedLetterTileIds((previous) => previous.slice(0, -1))
  }

  function handleLetterClear() {
    if (feedback === 'correct') return
    setSelectedLetterTileIds([])
  }

  function getBuiltAnswer(question) {
    if (!question || question.responseMode !== 'build') return ''
    const lettersById = new Map(currentLetterTiles.map((tile) => [tile.id, tile.letter]))
    return selectedLetterTileIds.map((tileId) => lettersById.get(tileId) ?? '').join('')
  }

  function handleBuiltAnswerSubmit() {
    const currentQuestion = queue[0]
    if (!currentQuestion || currentQuestion.responseMode !== 'build') return

    const builtAnswer = getBuiltAnswer(currentQuestion)
    if (builtAnswer.length !== currentQuestion.answer.length) return
    handleGuess(builtAnswer)
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
  const isBuildMode = currentQuestion?.responseMode === 'build'
  const builtAnswer = getBuiltAnswer(currentQuestion)
  const progressPercentage = Math.round((perfectOriginalCount / baseQuestionCount) * 100)
  return (
    <section className={`game-shell ${isFullscreen ? 'is-fullscreen' : ''}`}>
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
                  <h2>{isBuildMode ? 'Build the past tense form' : 'Choose the past tense form'}</h2>
                  <div className="spelling-base-word">{currentQuestion.baseWord}</div>
                  <p>
                    {isBuildMode
                      ? 'Tap letters to build the answer after hearing the base verb.'
                      : 'Tap the speaker to hear the base verb again.'}
                  </p>
                </>
              ) : (
                <>
                  <h2>{isBuildMode ? 'Listen and build the correct spelling' : 'Listen and choose the correct spelling'}</h2>
                  <p>
                    {isBuildMode
                      ? 'Fill the boxes with the letters to spell the word.'
                      : 'Tap the speaker if you want to hear the word again.'}
                  </p>
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

          {isBuildMode ? (
            <div className="spelling-build-panel">
              <div className="spelling-slot-row" aria-label="Build the answer one letter at a time">
                {Array.from({ length: currentQuestion.answer.length }, (_, index) => (
                  <div
                    key={`${currentQuestion.id}_slot_${index}`}
                    className={`spelling-slot ${builtAnswer[index] ? 'is-filled' : ''}`}
                  >
                    {builtAnswer[index] ?? ''}
                  </div>
                ))}
              </div>

              <div className="spelling-build-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleLetterBackspace}
                  disabled={!selectedLetterTileIds.length || feedback === 'correct'}
                >
                  <ArrowLeft size={16} />
                  <span>Backspace</span>
                </button>
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleLetterClear}
                  disabled={!selectedLetterTileIds.length || feedback === 'correct'}
                >
                  <RotateCcw size={16} />
                  <span>Clear</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleBuiltAnswerSubmit}
                  disabled={builtAnswer.length !== currentQuestion.answer.length || feedback === 'correct'}
                >
                  <CheckCircle2 size={16} />
                  <span>Check word</span>
                </button>
              </div>

              <div className="letter-bank-grid">
                {currentLetterTiles.map((tile) => {
                  const isUsed = selectedLetterTileIds.includes(tile.id)
                  return (
                    <button
                      key={tile.id}
                      type="button"
                      className={`letter-tile ${isUsed ? 'is-used' : ''}`}
                      disabled={
                        isUsed ||
                        feedback === 'correct' ||
                        selectedLetterTileIds.length >= currentQuestion.answer.length
                      }
                      onClick={() => handleLetterTilePick(tile.id)}
                    >
                      {tile.letter}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
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
          )}
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

function CoinBurst({ visible = false }) {
  if (!visible) return null

  const coins = Array.from({ length: 12 }, (_, index) => ({
    id: index,
    style: {
      '--coin-x': `${Math.random() * 180 - 90}px`,
      '--coin-delay': `${(index * 0.03).toFixed(2)}s`,
      '--coin-rot': `${Math.random() * 260 - 130}deg`,
    },
  }))

  return (
    <div className="coin-burst" aria-hidden="true">
      {coins.map((coin) => (
        <span key={coin.id} className="coin-burst-item" style={coin.style}>
          🪙
        </span>
      ))}
    </div>
  )
}

function SnakeChallenge({ onBack, onSaveResult, studentName, topTestRecord, storageScopeKey }) {
  const goalApples = SNAKE_GOAL_APPLES
  const mobileConsoleQuery = '(max-width: 1024px), (pointer: coarse) and (max-width: 1366px)'
  const snakeOnboardingStorageKey = getScopedStorageKey(
    SNAKE_ONBOARDING_DISMISSED_KEY,
    storageScopeKey,
  )

  const [phase, setPhase] = useState('playing')
  const [snake, setSnake] = useState([])
  const [direction, setDirection] = useState('right')
  const [apple, setApple] = useState({ x: 0, y: 0 })
  const [applesEaten, setApplesEaten] = useState(0)
  const [currentAppleStreak, setCurrentAppleStreak] = useState(0)
  const [bestAppleStreak, setBestAppleStreak] = useState(0)
  const [collisionQuestionCount, setCollisionQuestionCount] = useState(0)
  const [restartCount, setRestartCount] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(null)
  const [currentOptions, setCurrentOptions] = useState([])
  const [questionFeedback, setQuestionFeedback] = useState(null)
  const [reviewExercises, setReviewExercises] = useState([])
  const [showCoinAnimation, setShowCoinAnimation] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [musicEnabled, setMusicEnabled] = useState(true)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const [coinsAwarded, setCoinsAwarded] = useState(0)
  const [countdownValue, setCountdownValue] = useState(3)
  const [lastResult, setLastResult] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isMobileConsole, setIsMobileConsole] = useState(false)
  const [mobileBoardSize, setMobileBoardSize] = useState(null)
  const [showOnboarding, setShowOnboarding] = useState(() => {
    if (typeof window === 'undefined') return true
    return window.localStorage.getItem(snakeOnboardingStorageKey) !== '1'
  })
  const [snakeToast, setSnakeToast] = useState(null)

  const shellRef = useRef(null)
  const topbarRef = useRef(null)
  const stageCardRef = useRef(null)
  const stageHeaderRef = useRef(null)
  const controlsRef = useRef(null)
  const snakeRef = useRef([])
  const appleRef = useRef({ x: 0, y: 0 })
  const directionRef = useRef('right')
  const phaseRef = useRef('playing')
  const applesEatenRef = useRef(0)
  const currentAppleStreakRef = useRef(0)
  const bestAppleStreakRef = useRef(0)
  const collisionQuestionCountRef = useRef(0)
  const restartCountRef = useRef(0)
  const reviewExercisesRef = useRef([])
  const questionDeckRef = useRef([])
  const autoStartRef = useRef(false)
  const mobileFullscreenRef = useRef(false)
  const finishInProgressRef = useRef(false)
  const coinTimerRef = useRef(null)
  const storeRedirectTimerRef = useRef(null)
  const countdownTimerRef = useRef(null)
  const toastTimerRef = useRef(null)

  useEffect(() => {
    snakeRef.current = snake
  }, [snake])

  useEffect(() => {
    appleRef.current = apple
  }, [apple])

  useEffect(() => {
    directionRef.current = direction
  }, [direction])

  useEffect(() => {
    phaseRef.current = phase
  }, [phase])

  useEffect(() => {
    applesEatenRef.current = applesEaten
  }, [applesEaten])

  useEffect(() => {
    currentAppleStreakRef.current = currentAppleStreak
  }, [currentAppleStreak])

  useEffect(() => {
    bestAppleStreakRef.current = bestAppleStreak
  }, [bestAppleStreak])

  useEffect(() => {
    collisionQuestionCountRef.current = collisionQuestionCount
  }, [collisionQuestionCount])

  useEffect(() => {
    restartCountRef.current = restartCount
  }, [restartCount])

  useEffect(() => {
    reviewExercisesRef.current = reviewExercises
  }, [reviewExercises])

  useEffect(() => {
    function syncMobileConsole() {
      if (typeof window === 'undefined') return
      setIsMobileConsole(window.matchMedia(mobileConsoleQuery).matches)
    }

    syncMobileConsole()
    const mediaQuery = window.matchMedia(mobileConsoleQuery)
    mediaQuery.addEventListener?.('change', syncMobileConsole)

    function syncFullscreenState() {
      setIsFullscreen(Boolean(document.fullscreenElement))
    }

    document.addEventListener('fullscreenchange', syncFullscreenState)
    syncFullscreenState()

    return () => {
      if (coinTimerRef.current) window.clearTimeout(coinTimerRef.current)
      if (storeRedirectTimerRef.current) window.clearTimeout(storeRedirectTimerRef.current)
      if (countdownTimerRef.current) window.clearInterval(countdownTimerRef.current)
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
      stopBackgroundMusic()
      mediaQuery.removeEventListener?.('change', syncMobileConsole)
      document.removeEventListener('fullscreenchange', syncFullscreenState)
    }
  }, [])

  useEffect(() => {
    if (!isMobileConsole) return undefined

    const previousOverflow = document.body.style.overflow
    const previousTouchAction = document.body.style.touchAction
    document.body.style.overflow = 'hidden'
    document.body.style.touchAction = 'manipulation'

    return () => {
      document.body.style.overflow = previousOverflow
      document.body.style.touchAction = previousTouchAction
    }
  }, [isMobileConsole])

  useEffect(() => {
    if (!isMobileConsole || mobileFullscreenRef.current) return
    mobileFullscreenRef.current = true
    void enterFullscreenMode()
  }, [isMobileConsole])

  useLayoutEffect(() => {
    if (!isMobileConsole) {
      setMobileBoardSize(null)
      return undefined
    }

    let frameId = 0
    const observedElements = [
      shellRef.current,
      topbarRef.current,
      stageCardRef.current,
      stageHeaderRef.current,
      controlsRef.current,
    ].filter(Boolean)

    const syncBoardSize = () => {
      if (frameId) window.cancelAnimationFrame(frameId)

      frameId = window.requestAnimationFrame(() => {
        const stageCard = stageCardRef.current
        const stageHeader = stageHeaderRef.current
        if (!stageCard) return

        const cardStyles = window.getComputedStyle(stageCard)
        const paddingX = Number.parseFloat(cardStyles.paddingLeft || '0') + Number.parseFloat(cardStyles.paddingRight || '0')
        const paddingY = Number.parseFloat(cardStyles.paddingTop || '0') + Number.parseFloat(cardStyles.paddingBottom || '0')
        const contentWidth = Math.max(200, stageCard.clientWidth - paddingX)
        const contentHeight = Math.max(200, stageCard.clientHeight - paddingY - (stageHeader?.offsetHeight ?? 0) - 8)
        const nextBoardSize = Math.floor(Math.max(200, Math.min(contentWidth, contentHeight)))

        setMobileBoardSize((current) => {
          if (current && Math.abs(current - nextBoardSize) < 2) return current
          return nextBoardSize
        })
      })
    }

    syncBoardSize()

    let resizeObserver = null
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(syncBoardSize)
      observedElements.forEach((element) => resizeObserver.observe(element))
    }

    window.addEventListener('resize', syncBoardSize)
    window.addEventListener('orientationchange', syncBoardSize)

    return () => {
      if (frameId) window.cancelAnimationFrame(frameId)
      window.removeEventListener('resize', syncBoardSize)
      window.removeEventListener('orientationchange', syncBoardSize)
      resizeObserver?.disconnect()
    }
  }, [isMobileConsole, phase, saveStatus])

  useEffect(() => {
    if (typeof window === 'undefined') return
    setShowOnboarding(window.localStorage.getItem(snakeOnboardingStorageKey) !== '1')
  }, [snakeOnboardingStorageKey])

  useEffect(() => {
    if (!isMobileConsole || !showOnboarding) return
    setShowOnboarding(false)
  }, [isMobileConsole, showOnboarding])

  useLayoutEffect(() => {
    if (autoStartRef.current) return
    autoStartRef.current = true
    startGame({ playStartSound: false })
  }, [])

  function clearTimers() {
    if (coinTimerRef.current) {
      window.clearTimeout(coinTimerRef.current)
      coinTimerRef.current = null
    }
    if (storeRedirectTimerRef.current) {
      window.clearTimeout(storeRedirectTimerRef.current)
      storeRedirectTimerRef.current = null
    }
    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current)
      toastTimerRef.current = null
    }
  }

  function dismissSnakeOnboarding() {
    setShowOnboarding(false)
    if (typeof window === 'undefined') return

    try {
      window.localStorage.setItem(snakeOnboardingStorageKey, '1')
    } catch (error) {
      console.warn('Could not persist Snake onboarding preference:', error)
    }
  }

  function showSnakeToast(message, tone = 'info') {
    setSnakeToast({ message, tone })
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => {
      setSnakeToast(null)
    }, 1400)
  }

  function refillQuestionDeck() {
    questionDeckRef.current = [...questionDeckRef.current, ...generateFullTestQuestions(FULL_TEST_QUESTION_COUNT)]
  }

  function getNextCollisionQuestion() {
    if (!questionDeckRef.current.length) {
      refillQuestionDeck()
    }
    return questionDeckRef.current.shift() ?? null
  }

  function resetSnakeBoard(options = {}) {
    const nextState = createSnakeRunState()
    snakeRef.current = nextState.snake
    directionRef.current = nextState.direction
    appleRef.current = nextState.apple
    applesEatenRef.current = 0
    setSnake(nextState.snake)
    setDirection(nextState.direction)
    setApple(nextState.apple)
    setApplesEaten(0)
    setCurrentQuestion(null)
    setCurrentOptions([])
    setQuestionFeedback(null)
    setShowCoinAnimation(false)
    setPhase(options.phase ?? 'playing')
  }

  function beginCountdown() {
    if (countdownTimerRef.current) {
      window.clearInterval(countdownTimerRef.current)
      countdownTimerRef.current = null
    }

    setCountdownValue(3)
    setPhase('countdown')

    let nextValue = 3
    countdownTimerRef.current = window.setInterval(() => {
      nextValue -= 1

      if (nextValue <= 0) {
        window.clearInterval(countdownTimerRef.current)
        countdownTimerRef.current = null
        setCountdownValue(0)
        setPhase('playing')
        return
      }

      setCountdownValue(nextValue)
    }, 700)
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

  function startGame(options = {}) {
    const shouldPlayStartSound = options.playStartSound ?? true
    clearTimers()
    finishInProgressRef.current = false
    if (shouldPlayStartSound) {
      playSound('start', soundEnabled)
    }
    void enterFullscreenMode()

    questionDeckRef.current = []
    refillQuestionDeck()
    collisionQuestionCountRef.current = 0
    restartCountRef.current = 0
    currentAppleStreakRef.current = 0
    bestAppleStreakRef.current = 0
    reviewExercisesRef.current = []
    setCollisionQuestionCount(0)
    setRestartCount(0)
    setCurrentAppleStreak(0)
    setBestAppleStreak(0)
    setReviewExercises([])
    setSaveStatus('idle')
    setSaveMessage('')
    setCoinsAwarded(0)
    setLastResult(null)
    setSnakeToast(null)
    resetSnakeBoard({ phase: 'countdown' })
    beginCountdown()
  }

  function buildSnakeSummary(options = {}) {
    const isCompleted = options.attemptStatus !== 'abandoned'
    const maxScore = 100
    const applesCaptured = Math.max(0, applesEatenRef.current)
    const progressRatio = goalApples > 0 ? applesCaptured / goalApples : 0
    const penalty = collisionQuestionCountRef.current * 4 + restartCountRef.current * 12
    const totalScore = isCompleted
      ? Math.max(20, maxScore - penalty)
      : Math.max(0, Math.round(progressRatio * maxScore) - penalty)
    const percentage = isCompleted ? 100 : Math.min(100, Math.max(0, Math.round(progressRatio * 100)))
    const gradeInfo = isCompleted ? { letter: 'PLUS' } : getGrade(percentage)

    return {
      subjectId: 'games',
      subjectName: 'Games',
      testId: 'snake',
      testName: 'Snake',
      mode: 'snake',
      languageLabel: 'Arcade',
      totalScore,
      maxScore,
      percentage,
      grade: isCompleted ? 'PLUS' : gradeInfo.letter,
      perfectOriginalCount: applesCaptured,
      questionCount: goalApples,
      answeredOriginalCount: applesCaptured,
      remainingOriginalCount: isCompleted ? 0 : Math.max(0, goalApples - applesCaptured),
      remainingQueueCount: isCompleted ? 0 : Math.max(0, goalApples - applesCaptured),
      attemptStatus: options.attemptStatus ?? 'completed',
      isAbandoned: !isCompleted,
      reviewExercises: reviewExercisesRef.current,
      pendingExercises: [],
      applesGoal: goalApples,
      applesEaten: applesCaptured,
      bestAppleStreak: bestAppleStreakRef.current,
      collisionQuestionCount: collisionQuestionCountRef.current,
      restartCount: restartCountRef.current,
      finishedAtMs: Date.now(),
    }
  }

  async function saveSnakeRun(options = {}) {
    if (finishInProgressRef.current) return
    finishInProgressRef.current = true

    clearTimers()
    stopBackgroundMusic()
    setCurrentQuestion(null)
    setCurrentOptions([])
    setQuestionFeedback(null)

    const summary = buildSnakeSummary({
      attemptStatus: options.attemptStatus ?? 'completed',
    })

    setLastResult(summary)
    setSaveStatus('saving')
    setSaveMessage(options.saveMessage ?? 'Saving result...')
    setCoinsAwarded(0)
    setPhase(options.showFinishedScreen === false ? 'saving' : 'finished')

    if (options.playWinSound) {
      playSound('win', soundEnabled)
    }

    try {
      const savedRecord = await onSaveResult(summary)
      setSaveStatus('saved')
      setSaveMessage(options.successMessage?.() ?? 'Result saved.')

      if (options.destination === 'store') {
        storeRedirectTimerRef.current = window.setTimeout(() => {
          void (async () => {
            await exitFullscreenMode()
            stopBackgroundMusic()
            onBack()
          })()
        }, 1200)
        return
      }

      if (options.destination === 'dashboard') {
        storeRedirectTimerRef.current = window.setTimeout(() => {
          void (async () => {
            await exitFullscreenMode()
            stopBackgroundMusic()
            onBack()
          })()
        }, 700)
      }
    } catch (error) {
      setSaveStatus('error')
      setSaveMessage(mapFirebaseError(error, 'save'))
      finishInProgressRef.current = false
    }
  }

  async function finishGame() {
    await saveSnakeRun({
      attemptStatus: 'completed',
      destination: 'dashboard',
      showFinishedScreen: true,
      playWinSound: true,
      saveMessage: 'Saving result...',
      successMessage: () => 'Result saved. Returning to home...',
    })
  }

  function handleSnakeCollision() {
    const nextQuestion = getNextCollisionQuestion()
    if (!nextQuestion) {
      const nextRestartCount = restartCountRef.current + 1
      restartCountRef.current = nextRestartCount
      setRestartCount(nextRestartCount)
      playSound('bump', soundEnabled)
      resetSnakeBoard()
      return
    }

    const nextCollisionCount = collisionQuestionCountRef.current + 1
    collisionQuestionCountRef.current = nextCollisionCount
    setCollisionQuestionCount(nextCollisionCount)
    setCurrentQuestion(nextQuestion)
    setCurrentOptions((nextQuestion.options ?? []).map((value) => ({ value, isHidden: false })))
    setQuestionFeedback(null)
    playSound('bump', soundEnabled)
    showSnakeToast('Oops, crash. Solve 1 question to keep going.', 'warn')
    setPhase('question')
  }

  function moveSnakeStep() {
    if (phaseRef.current !== 'playing') return

    const currentSnake = snakeRef.current
    if (!currentSnake.length) return

    const directionVector = SNAKE_DIRECTION_VECTORS[directionRef.current] ?? SNAKE_DIRECTION_VECTORS.right
    const head = currentSnake[0]
    const nextHead = {
      x: head.x + directionVector.x,
      y: head.y + directionVector.y,
    }
    const willEatApple = snakeCellsMatch(nextHead, appleRef.current)
    const bodyToCheck = willEatApple ? currentSnake : currentSnake.slice(0, -1)

    if (isSnakeOutOfBounds(nextHead) || bodyToCheck.some((cell) => snakeCellsMatch(cell, nextHead))) {
      handleSnakeCollision()
      return
    }

    const nextSnake = [nextHead, ...currentSnake]
    if (!willEatApple) {
      nextSnake.pop()
    }

    snakeRef.current = nextSnake
    setSnake(nextSnake)

    if (!willEatApple) return

    playSound('coin', soundEnabled)
    showSnakeToast('Nice, apple collected.', 'success')
    setShowCoinAnimation(true)
    if (coinTimerRef.current) window.clearTimeout(coinTimerRef.current)
    coinTimerRef.current = window.setTimeout(() => {
      setShowCoinAnimation(false)
    }, 650)

    const nextAppleCount = applesEatenRef.current + 1
    applesEatenRef.current = nextAppleCount
    setApplesEaten(nextAppleCount)

    const nextAppleStreak = currentAppleStreakRef.current + 1
    currentAppleStreakRef.current = nextAppleStreak
    setCurrentAppleStreak(nextAppleStreak)

    if (nextAppleStreak > bestAppleStreakRef.current) {
      bestAppleStreakRef.current = nextAppleStreak
      setBestAppleStreak(nextAppleStreak)
    }

    if (nextAppleCount >= goalApples) {
      const nextApple = getRandomOpenSnakeCell(nextSnake)
      appleRef.current = nextApple
      setApple(nextApple)
      void finishGame()
      return
    }

    const nextApple = getRandomOpenSnakeCell(nextSnake)
    appleRef.current = nextApple
    setApple(nextApple)
  }

  function handleDirectionalInput(nextDirection) {
    if (!nextDirection) return
    if (phaseRef.current !== 'playing' && phaseRef.current !== 'resume') return

    void primeAudioEngine().then((ready) => {
      if (!ready || !musicEnabled) return
      if (phaseRef.current === 'playing' || phaseRef.current === 'resume') {
        startBackgroundMusic('snake', true)
      }
    })

    const currentDirection = directionRef.current
    if (isOppositeSnakeDirection(nextDirection, currentDirection)) return

    directionRef.current = nextDirection
    setDirection(nextDirection)

    if (phaseRef.current === 'resume') {
      setCurrentQuestion(null)
      setCurrentOptions([])
      setQuestionFeedback(null)
      setPhase('playing')
    }
  }

  useEffect(() => {
    if (phase === 'playing' || phase === 'resume') {
      startBackgroundMusic('snake', musicEnabled)
    } else {
      stopBackgroundMusic()
    }

    return () => {
      if (phase === 'playing' || phase === 'resume') {
        stopBackgroundMusic()
      }
    }
  }, [phase, musicEnabled])

  useEffect(() => {
    if (phase !== 'playing') return undefined

    const speed = Math.max(90, SNAKE_BASE_SPEED_MS - applesEaten * 4)
    const intervalId = window.setInterval(() => {
      moveSnakeStep()
    }, speed)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [phase, applesEaten, soundEnabled])

  function handlePauseResume() {
    void primeAudioEngine()

    if (phase === 'playing') {
      setPhase('paused')
      showSnakeToast('Game paused.', 'info')
      playSound('transition', soundEnabled)
      return
    }

    if (phase === 'paused') {
      setPhase('playing')
      showSnakeToast('Back to game.', 'success')
      playSound('start', soundEnabled)
      if (musicEnabled) {
        startBackgroundMusic('snake', true)
      }
    }
  }

  useEffect(() => {
    function handleKeyDown(event) {
      const nextDirection = getSnakeDirectionFromKey(event.key)

      if (nextDirection) {
        event.preventDefault()
        handleDirectionalInput(nextDirection)
        return
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  async function handleFullscreenToggle() {
    if (document.fullscreenElement) {
      await exitFullscreenMode()
      return
    }
    await enterFullscreenMode()
  }

  function handleQuestionGuess(guessedValue) {
    if (!currentQuestion || phase !== 'question') return
    if (questionFeedback) return

    if (guessedValue === currentQuestion.answer) {
      playSound('coin', soundEnabled)
      showSnakeToast('Great answer, press any direction to continue.', 'success')
      setQuestionFeedback('correct')
      setPhase('resume')
      return
    }

    playSound('bump', soundEnabled)
    showSnakeToast('Not this time. Restarting from countdown.', 'warn')
    setQuestionFeedback('incorrect')
    const nextRestartCount = restartCountRef.current + 1
    restartCountRef.current = nextRestartCount
    setRestartCount(nextRestartCount)
    const nextReviewExercises = mergeExerciseRecords(
      reviewExercisesRef.current,
      [fullTestRecordFromQuestion(currentQuestion)],
    )
    reviewExercisesRef.current = nextReviewExercises
    setReviewExercises(nextReviewExercises)
    setPhase('restart')
  }

  function handleRestartRun() {
    setCurrentQuestion(null)
    setCurrentOptions([])
    setQuestionFeedback(null)
    currentAppleStreakRef.current = 0
    setCurrentAppleStreak(0)
    resetSnakeBoard({ phase: 'countdown' })
    beginCountdown()
  }

  function handleSaveAndLeaveAfterLoss() {
    if (saveStatus === 'saving') return

    void saveSnakeRun({
      attemptStatus: 'abandoned',
      destination: 'dashboard',
      showFinishedScreen: false,
      playWinSound: false,
      saveMessage: 'Saving your Snake progress...',
      successMessage: () => 'Progress saved. Returning to home...',
    })
  }

  function handleLeaveGame() {
    if (saveStatus === 'saving') return

    const confirmed = window.confirm('Save your current Snake progress and leave the game?')
    if (!confirmed) return

    void saveSnakeRun({
      attemptStatus: 'abandoned',
      destination: 'dashboard',
      showFinishedScreen: false,
      playWinSound: false,
      saveMessage: 'Saving your Snake progress...',
      successMessage: () => 'Progress saved. Returning to home...',
    })
  }

  function handleBackToHome() {
    void (async () => {
      clearTimers()
      await exitFullscreenMode()
      stopBackgroundMusic()
      onBack()
    })()
  }

  if (phase === 'finished') {
    const summary = lastResult ?? {
      totalScore: 0,
      maxScore: 100,
      percentage: 0,
      grade: 'PLUS',
      applesGoal: goalApples,
      applesEaten: applesEaten,
      bestAppleStreak,
      collisionQuestionCount,
      restartCount,
      reviewExercises,
    }
    const gradeInfo = getGrade(summary.percentage)
    const reviewList = summary.reviewExercises ?? []

    return (
      <section className={`game-shell ${isFullscreen ? 'is-fullscreen' : ''}`}>
        <div className="results-card">
          <div className={`results-trophy ${gradeInfo.color}`}>
            <Gamepad2 size={34} />
          </div>
          <h1 className={`results-grade ${gradeInfo.color}`}>{summary.grade}</h1>
          <p className="results-message">
            Snake cleared. You reached the 10-apple goal and earned a PLUS result.
          </p>

          <div className="story-result-chip">
            <Gamepad2 size={14} />
            <span>Games · Snake</span>
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
                Best streak: {summary.bestAppleStreak ?? 0} apples · {summary.collisionQuestionCount} collision questions · {summary.restartCount} restarts
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
                <p className="study-empty">Excellent: there were no failed collision questions.</p>
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
              <span>Play Snake again</span>
            </button>
            <button type="button" className="btn btn-ghost" onClick={handleBackToHome}>
              <ArrowLeft size={16} />
              <span>Back to dashboard</span>
            </button>
          </div>
        </div>
      </section>
    )
  }

  const snakeCells = []
  const snakeCellMap = new Map(snake.map((cell, index) => [`${cell.x},${cell.y}`, index]))

  for (let y = 0; y < SNAKE_BOARD_SIZE; y += 1) {
    for (let x = 0; x < SNAKE_BOARD_SIZE; x += 1) {
      const key = `${x},${y}`
      const snakeIndex = snakeCellMap.get(key)
      snakeCells.push({
        key,
        isHead: snakeIndex === 0,
        isBody: typeof snakeIndex === 'number' && snakeIndex > 0,
        isApple: apple.x === x && apple.y === y,
      })
    }
  }

  return (
    <section
      ref={shellRef}
      className={`game-shell snake-shell ${isFullscreen ? 'is-fullscreen' : ''} ${isMobileConsole ? 'is-mobile-console' : ''}`}
    >
      <CoinBurst visible={showCoinAnimation} />

      <div ref={topbarRef} className="game-topbar">
        <div className="hud-pill">
          <span className="hud-label">Apples</span>
          <strong>
            {String(applesEaten).padStart(2, '0')} / {String(goalApples).padStart(2, '0')}
          </strong>
        </div>

        <div className="hud-progress">
          <div className="hud-row">
            <span>Hello, {studentName || 'Student'}</span>
            <span>{Math.round((applesEaten / goalApples) * 100)}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${(applesEaten / goalApples) * 100}%` }} />
          </div>
          <small>
            Games · Snake · Reach {goalApples} apples. Crash questions: {collisionQuestionCount}
          </small>
          <TestLeaderboardChip topRecord={topTestRecord} />
        </div>

        <div className="hud-actions">
          <button
            type="button"
            className={`btn btn-ghost ${isMobileConsole ? 'mobile-action-btn' : ''}`}
            onClick={handlePauseResume}
            disabled={phase === 'countdown' || phase === 'question' || phase === 'restart' || phase === 'resume'}
            title={phase === 'paused' ? 'Resume game' : 'Pause game'}
          >
            {phase === 'paused' ? <Play size={16} /> : <Pause size={16} />}
            <span>{phase === 'paused' ? 'Resume' : 'Pause'}</span>
          </button>

          {!isMobileConsole && (
            <button
              type="button"
              className="btn btn-ghost icon-only"
              onClick={() => void handleFullscreenToggle()}
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
            </button>
          )}

          <button
            type="button"
            className={`btn btn-ghost ${isMobileConsole ? 'mobile-action-btn' : 'icon-only'}`}
            onClick={() => {
              setSoundEnabled((value) => {
                const nextValue = !value
                if (nextValue) {
                  void primeAudioEngine().then((ready) => {
                    if (ready) playSound('ui', true, false)
                  })
                }
                return nextValue
              })
            }}
            aria-label={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            {isMobileConsole && <span>{soundEnabled ? 'SFX on' : 'SFX off'}</span>}
          </button>

          <button
            type="button"
            className={`btn btn-ghost ${isMobileConsole ? 'mobile-action-btn' : ''}`}
            onClick={() => {
              setMusicEnabled((value) => {
                const nextValue = !value
                if (!nextValue) {
                  stopBackgroundMusic()
                  return nextValue
                }

                void primeAudioEngine().then((ready) => {
                  if (!ready) return
                  if (phaseRef.current === 'playing' || phaseRef.current === 'resume') {
                    startBackgroundMusic('snake', true)
                  }
                })

                return nextValue
              })
            }}
            aria-label={musicEnabled ? 'Turn music off' : 'Turn music on'}
            title={musicEnabled ? 'Turn music off' : 'Turn music on'}
          >
            <Music2 size={16} />
            <span>{isMobileConsole ? (musicEnabled ? 'M on' : 'M off') : musicEnabled ? 'Music on' : 'Music off'}</span>
          </button>

          <button
            type="button"
            className="btn btn-danger-soft"
            onClick={handleLeaveGame}
            disabled={saveStatus === 'saving'}
            title="Save progress and leave Snake"
          >
            <ArrowLeft size={16} />
            <span>{isMobileConsole ? 'Leave' : 'Save and leave'}</span>
          </button>
        </div>
      </div>

      <div className="game-board snake-layout">
        <div ref={stageCardRef} className="snake-stage-card">
          {showOnboarding && (
            <div className="snake-onboarding-card" role="status" aria-live="polite">
              <div>
                <strong>Quick start</strong>
                <small>Goal: eat {goalApples} apples. Move with arrows or WASD. If you crash, answer to continue.</small>
              </div>
              <button type="button" className="btn btn-ghost" onClick={dismissSnakeOnboarding}>
                Got it
              </button>
            </div>
          )}

          {snakeToast && (
            <div className={`snake-toast snake-toast-${snakeToast.tone}`} role="status" aria-live="polite">
              {snakeToast.message}
            </div>
          )}

          {phase === 'resume' && (
            <div className="snake-resume-helper" role="status" aria-live="polite">
              ✅ Correcto. Presiona cualquier dirección para seguir.
            </div>
          )}

          <div ref={stageHeaderRef} className="snake-stage-header">
            <div>
              <strong>Snake</strong>
              <small>
                {isMobileConsole ? 'Tap the touch pad below to move.' : 'Use arrow keys or WASD to move.'}
              </small>
            </div>
            <span className="badge badge-live">Goal: {goalApples} apples</span>
          </div>

          <div className="snake-board-stage">
            <div
              className="snake-grid"
              role="img"
              aria-label="Snake board"
              style={isMobileConsole && mobileBoardSize ? { width: `${mobileBoardSize}px`, height: `${mobileBoardSize}px` } : undefined}
            >
              {snakeCells.map((cell) => (
                <div
                  key={cell.key}
                  className={`snake-cell ${cell.isHead ? 'is-head' : ''} ${cell.isBody ? 'is-body' : ''} ${cell.isApple ? 'is-apple' : ''}`}
                />
              ))}
            </div>

            {(phase === 'question' || phase === 'restart') && (
              <div className="snake-overlay">
                <div className="snake-overlay-card">
                  {phase === 'question' && currentQuestion && (
                    <>
                      <div className="snake-overlay-header">
                        <div>
                          <small>Crash challenge</small>
                          <h3>{currentQuestion.sourceLabel}</h3>
                        </div>
                        <span className="badge badge-live">Answer to continue</span>
                      </div>
                      {currentQuestion.context && <p className="snake-context">{currentQuestion.context}</p>}
                      <p className="snake-prompt">{currentQuestion.prompt}</p>
                      <div className="answers-grid">
                        {currentOptions.map((option, index) => (
                          <button
                            key={`${currentQuestion.id}_${index}`}
                            type="button"
                            className={`answer-btn answer-text ${option.isHidden ? 'is-hidden' : ''}`}
                            disabled={Boolean(questionFeedback)}
                            onClick={() => handleQuestionGuess(option.value)}
                          >
                            {option.value}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  {phase === 'restart' && (
                    <>
                      <div className="snake-overlay-header">
                        <div>
                          <small>Wrong answer</small>
                          <h3>Choose what to do next</h3>
                        </div>
                        <span className="badge badge-soon">Run reset</span>
                      </div>
                      <p className="snake-prompt">
                        That answer was not correct. You can restart from zero apples, or save this progress and leave.
                      </p>
                      <div className="snake-restart-actions">
                        <button type="button" className="btn btn-primary" onClick={handleRestartRun}>
                          <RotateCcw size={16} />
                          <span>Restart run</span>
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={handleSaveAndLeaveAfterLoss}>
                          <ArrowLeft size={16} />
                          <span>Save and leave</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {phase === 'paused' && (
              <div className="snake-overlay">
                <div className="snake-overlay-card">
                  <div className="snake-overlay-header">
                    <div>
                      <small>Paused</small>
                      <h3>Take a breath, then continue</h3>
                    </div>
                    <span className="badge badge-live">Ready when you are</span>
                  </div>
                  <p className="snake-prompt">Press Resume to keep your run with the same score and position.</p>
                  <button type="button" className="btn btn-primary" onClick={handlePauseResume}>
                    Resume
                  </button>
                </div>
              </div>
            )}

            {phase === 'countdown' && (
              <div className="snake-overlay snake-countdown-overlay" aria-live="assertive">
                <div className="snake-countdown-card">
                  <small>Get ready</small>
                  <strong>{countdownValue}</strong>
                </div>
              </div>
            )}
          </div>

          <div className="snake-console-footer" aria-hidden="true">
            <span>JOY BOY</span>
            <small>Arcade learning mode</small>
          </div>
        </div>

        <div className="snake-side-panel">
          <div className="story-card">
            <div className="story-card-header">
              <div className="story-card-title">
                <Gamepad2 size={18} />
                <div>
                  <small>Arcade rules</small>
                  <h3>How this works</h3>
                </div>
              </div>
            </div>
            <div className="story-card-body">
              <p>Eat {goalApples} apples to win.</p>
              <p>Every crash opens one mixed question from the Full Test pool.</p>
              <p>If you answer correctly, you continue from the same board position.</p>
              <p>If you answer incorrectly, choose to restart from zero apples or save and leave.</p>
            </div>
          </div>

          <div className="study-card">
            <div className="study-card-header">
              <Trophy size={16} />
              <h3>Run stats</h3>
            </div>
            <div className="snake-stats">
              <div className="snake-stat-item">
                <span>Apples eaten</span>
                <strong>{applesEaten}</strong>
              </div>
              <div className="snake-stat-item">
                <span>Best streak</span>
                <strong>{bestAppleStreak}</strong>
              </div>
              <div className="snake-stat-item">
                <span>Current streak</span>
                <strong>{currentAppleStreak}</strong>
              </div>
              <div className="snake-stat-item">
                <span>Collision questions</span>
                <strong>{collisionQuestionCount}</strong>
              </div>
              <div className="snake-stat-item">
                <span>Restarts</span>
                <strong>{restartCount}</strong>
              </div>
              <div className="snake-stat-item">
                <span>Direction</span>
                <strong>{getSnakeDirectionLabel(direction)}</strong>
              </div>
            </div>
          </div>
        </div>

        <div ref={controlsRef} className="snake-mobile-controls" aria-label="Snake touch controls">
          <div className="snake-mobile-controls-header">
            <strong>Touch pad</strong>
            <span>{phase === 'resume' ? 'Tap any direction to continue' : 'Tap to steer'}</span>
          </div>

          <div className="snake-mobile-dpad">
            <button
              type="button"
              className="snake-mobile-btn up"
              onClick={() => handleDirectionalInput('up')}
              disabled={phase === 'question' || phase === 'restart' || isOppositeSnakeDirection('up', direction)}
              aria-label="Move up"
            >
              <ArrowUp size={22} />
            </button>
            <button
              type="button"
              className="snake-mobile-btn left"
              onClick={() => handleDirectionalInput('left')}
              disabled={phase === 'question' || phase === 'restart' || isOppositeSnakeDirection('left', direction)}
              aria-label="Move left"
            >
              <ArrowLeft size={22} />
            </button>
            <button
              type="button"
              className="snake-mobile-btn center"
              disabled
              aria-hidden="true"
            >
              <span>+</span>
            </button>
            <button
              type="button"
              className="snake-mobile-btn right"
              onClick={() => handleDirectionalInput('right')}
              disabled={phase === 'question' || phase === 'restart' || isOppositeSnakeDirection('right', direction)}
              aria-label="Move right"
            >
              <ArrowRight size={22} />
            </button>
            <button
              type="button"
              className="snake-mobile-btn down"
              onClick={() => handleDirectionalInput('down')}
              disabled={phase === 'question' || phase === 'restart' || isOppositeSnakeDirection('down', direction)}
              aria-label="Move down"
            >
              <ArrowDown size={22} />
            </button>
          </div>
        </div>
      </div>
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
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [saveStatus, setSaveStatus] = useState('idle')
  const [saveMessage, setSaveMessage] = useState('')
  const [lastResult, setLastResult] = useState(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [reviewExercises, setReviewExercises] = useState([])
  const [currentExplanationText, setCurrentExplanationText] = useState('')

  const clearFeedbackTimerRef = useRef(null)
  const advanceTimerRef = useRef(null)
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
              <span>Back to dashboard</span>
            </button>
          </div>
        </div>
      </section>
    )
  }

  const currentQuestion = queue[0]
  const progressPercentage = Math.round((perfectOriginalCount / questionCount) * 100)

  return (
    <section className={`game-shell ${isFullscreen ? 'is-fullscreen' : ''}`}>
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
  const [masterMute, setMasterMute] = useState(false)
  const [masterVolume, setMasterVolume] = useState(0.65)
  const [audioPrimed, setAudioPrimed] = useState(() => isAudioPrimed())
  const [screenTransitionDirection, setScreenTransitionDirection] = useState('forward')
  const screenTransitionKey = `${screen}_${selectedSubjectId ?? 'none'}_${selectedTestId ?? 'none'}`

  useEffect(() => {
    setMasterAudioMuted(masterMute)
  }, [masterMute])

  useEffect(() => {
    setMasterAudioVolume(masterVolume)
  }, [masterVolume])

  useEffect(() => {
    setAudioPrimed(isAudioPrimed())

    const prime = () => {
      void primeAudioEngine().then((ready) => {
        if (ready) setAudioPrimed(true)
      })
    }

    window.addEventListener('pointerdown', prime, { passive: true })
    window.addEventListener('touchstart', prime, { passive: true })
    window.addEventListener('keydown', prime)

    return () => {
      window.removeEventListener('pointerdown', prime)
      window.removeEventListener('touchstart', prime)
      window.removeEventListener('keydown', prime)
    }
  }, [])

  useEffect(() => {
    const handleUiClickSound = (event) => {
      if (masterMute || masterVolume <= 0) return
      if (!(event.target instanceof Element)) return

      const control = event.target.closest('button, a')
      if (!control || control.getAttribute('data-ui-sfx') === 'off') return

      playSound('ui', true)
    }

    window.addEventListener('click', handleUiClickSound, true)
    return () => {
      window.removeEventListener('click', handleUiClickSound, true)
    }
  }, [masterMute, masterVolume])

  function navigateScreen(nextScreen, options = {}) {
    const {
      subjectId = null,
      testId = null,
      playTransition = true,
      direction = 'forward',
    } = options

    setScreenTransitionDirection(direction)

    if (playTransition) {
      playSound('transition', true)
    }
    setSelectedSubjectId(subjectId)
    setSelectedTestId(testId)
    setScreen(nextScreen)
  }

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

      const allPersonalResults = sortResultsByNewest(resultSnapshot.docs.map(toResultRecord))
      const totalCompletedRuns = countCompletedRuns(allPersonalResults)
      const fallbackAlias = user.email?.split('@')[0] ?? 'Student'
      const rawProfile = profileSnapshot.exists() ? profileSnapshot.data() : {}
      const baseProfile = {
        ...rawProfile,
        alias: rawProfile.alias ?? fallbackAlias,
        aliasSlug: rawProfile.aliasSlug ?? normalizeAlias(rawProfile.alias ?? fallbackAlias),
      }
      const normalizedProfile = baseProfile
      const nextPersonalResults = allPersonalResults.slice(0, 20)

      setStudentProfile(normalizedProfile)
      setPersonalResults(nextPersonalResults)
      if (!profileSnapshot.exists() || baseProfile.alias !== normalizedProfile.alias || baseProfile.aliasSlug !== normalizedProfile.aliasSlug) {
        await setDoc(
          profileRef,
          {
            alias: normalizedProfile.alias,
            aliasSlug: normalizedProfile.aliasSlug ?? normalizeAlias(normalizedProfile.alias ?? fallbackAlias),
          },
          { merge: true },
        )
      }

      void mirrorResultsToPublicCollection(user.uid, allPersonalResults).then(() => {
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

    let savedRecord = null

    try {
      const docRef = await addDoc(collection(db, 'students', currentUser.uid, 'results'), payload)
      savedRecord = { id: docRef.id, ...payload }
    } catch (error) {
      console.warn('Could not save result in Firestore, using local fallback:', error)
      savedRecord = {
        id: `local_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        ...payload,
        localOnly: true,
      }
      setGlobalResultsError(
        error?.code === 'permission-denied'
          ? 'Firestore blocked result writes. Scores are being saved locally for this session.'
          : 'Could not save to Firebase right now. Scores are being saved locally for this session.',
      )
    }

    setPersonalResults((previous) => upsertResultRecord(previous, savedRecord))

    const sourceResultId = savedRecord.sourceResultId || savedRecord.id
    const publicRecordId = getPublicResultDocId(currentUser.uid, sourceResultId)
    const publicRecordPayload = toPublicResultPayload(savedRecord, currentUser.uid, sourceResultId)

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
    navigateScreen('subject', { subjectId, direction: 'forward' })
  }

  function openTest(testId) {
    navigateScreen('test', {
      subjectId: selectedSubjectId,
      testId,
      direction: 'forward',
    })
  }

  function openFullTest() {
    navigateScreen('full-test', { direction: 'forward' })
  }

  function openSnakeGame() {
    setMasterMute(false)
    setMasterAudioMuted(false)
    navigateScreen('snake', { direction: 'forward' })
  }

  function goToDashboard() {
    navigateScreen('dashboard', { direction: 'backward' })
  }

  function goToSubjectMenu() {
    navigateScreen('subject', {
      subjectId: selectedSubjectId,
      direction: 'backward',
    })
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
  const snakeTopRecord = getTopRecordForTest(rankingSourceResults, 'games', 'snake')
  const selectedTestTopRecord =
    selectedSubject && selectedTest
      ? getTopRecordForTest(rankingSourceResults, selectedSubject.id, selectedTest.id)
      : null

  return (
    <div className={`app-shell ${screen === 'dashboard' ? 'is-home-screen' : 'is-focused-screen'}`}>
      <header className="top-nav">
        <button type="button" className="brand-brand" onClick={goToDashboard}>
          <div className="brand-mark">
            <Sparkles size={18} />
          </div>
          <div>
            <strong>Joy App Full</strong>
            <small>Subject based learning</small>
          </div>
        </button>

        <div className="nav-user">
          <div className="audio-master-controls" aria-label="Sound controls">
            <button
              type="button"
              className="btn btn-ghost icon-only"
              onClick={() => setMasterMute((value) => !value)}
              aria-label={masterMute ? 'Unmute app sounds' : 'Mute app sounds'}
              title={masterMute ? 'Unmute app sounds' : 'Mute app sounds'}
            >
              {masterMute ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={Math.round(masterVolume * 100)}
              onChange={(event) => setMasterVolume(Number(event.target.value) / 100)}
              aria-label="Volume"
            />
          </div>
          {!audioPrimed && (
            <span className="audio-unlock-tip" role="status" aria-live="polite">
              Tap to enable sound effects 🔊
            </span>
          )}
          <div className="user-chip">
            <span>{studentDisplayName}</span>
          </div>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            <LogOut size={16} />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      <section className="release-banner" role="status" aria-live="polite">
        ✨ Nueva versión visual activa, transiciones y audio mejorados para demo.
      </section>

      <main className="app-main">
        <div
          key={screenTransitionKey}
          className={`screen-transition-layer ${
            screenTransitionDirection === 'backward' ? 'is-backward' : 'is-forward'
          }`}
        >
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
              onStartSnakeGame={openSnakeGame}
              onSelectSubject={openSubject}
              storageScopeKey={currentUser?.uid ?? studentDisplayName}
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

          {screen === 'snake' && (
            <SnakeChallenge
              onBack={goToDashboard}
              onSaveResult={saveAssessmentResult}
              studentName={studentDisplayName}
              topTestRecord={snakeTopRecord}
              storageScopeKey={currentUser?.uid ?? studentDisplayName}
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
            operation="multiply"
            testId="multiplication"
            testName="Multiplication"
          />
        )}

        {screen === 'test' && selectedSubject && selectedTest?.id === 'addition' && (
          <MultiplicationChallenge
            onBack={goToSubjectMenu}
            onSaveResult={saveAssessmentResult}
            studentName={studentDisplayName}
            topTestRecord={selectedTestTopRecord}
            operation="add"
            testId="addition"
            testName="Addition"
          />
        )}

        {screen === 'test' && selectedSubject && selectedTest?.id === 'subtraction' && (
          <MultiplicationChallenge
            onBack={goToSubjectMenu}
            onSaveResult={saveAssessmentResult}
            studentName={studentDisplayName}
            topTestRecord={selectedTestTopRecord}
            operation="subtract"
            testId="subtraction"
            testName="Subtraction"
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
                  Back to dashboard
                </button>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

export default App
