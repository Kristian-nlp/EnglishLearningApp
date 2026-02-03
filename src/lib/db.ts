// Database abstraction layer
// Currently uses localStorage for demo purposes
// Can be replaced with Prisma when database is configured

import { UserSettings, UserProgress, Message, DifficultyLevel, EnglishAccent } from '@/types'

const STORAGE_KEYS = {
  USER: 'english_app_user',
  SETTINGS: 'english_app_settings',
  PROGRESS: 'english_app_progress',
  SESSIONS: 'english_app_sessions',
  CUSTOM_TOPICS: 'english_app_custom_topics',
}

// User settings
export function getUserSettings(): UserSettings {
  if (typeof window === 'undefined') {
    return getDefaultSettings()
  }
  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (error) {
      console.error('Failed to parse user settings:', error)
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEYS.SETTINGS)
      return getDefaultSettings()
    }
  }
  return getDefaultSettings()
}

export function saveUserSettings(settings: UserSettings): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings))
}

function getDefaultSettings(): UserSettings {
  return {
    difficultyLevel: 'A2' as DifficultyLevel,
    speakingSpeed: 1.0,
    accent: 'american' as EnglishAccent,
  }
}

// User progress
export function getUserProgress(): UserProgress {
  if (typeof window === 'undefined') {
    return getDefaultProgress()
  }
  const stored = localStorage.getItem(STORAGE_KEYS.PROGRESS)
  if (stored) {
    try {
      const progress = JSON.parse(stored)
      return {
        ...progress,
        lastSessionDate: progress.lastSessionDate ? new Date(progress.lastSessionDate) : null,
      }
    } catch (error) {
      console.error('Failed to parse user progress:', error)
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEYS.PROGRESS)
      return getDefaultProgress()
    }
  }
  return getDefaultProgress()
}

export function saveUserProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress))
}

export function addDifficultPhrase(phrase: string): void {
  const progress = getUserProgress()
  if (!progress.difficultPhrases.includes(phrase)) {
    progress.difficultPhrases.push(phrase)
    saveUserProgress(progress)
  }
}

export function addLearnedWord(word: string): void {
  const progress = getUserProgress()
  if (!progress.learnedWords.includes(word)) {
    progress.learnedWords.push(word)
    saveUserProgress(progress)
  }
}

function getDefaultProgress(): UserProgress {
  return {
    id: 'local-user',
    userId: 'local-user',
    difficultPhrases: [],
    learnedWords: [],
    sessionsCompleted: 0,
    lastSessionDate: null,
    topicsCompleted: [],
    vocabularyProgress: {},
  }
}

// Session history
interface StoredSession {
  id: string
  topic: string
  messages: Message[]
  startedAt: string
  endedAt: string | null
}

export function getSessions(): StoredSession[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEYS.SESSIONS)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (error) {
      console.error('Failed to parse sessions:', error)
      // Clear corrupted data
      localStorage.removeItem(STORAGE_KEYS.SESSIONS)
      return []
    }
  }
  return []
}

export function saveSession(session: {
  id: string
  topic: string
  messages: Message[]
  startedAt: Date
  endedAt: Date | null
}): void {
  if (typeof window === 'undefined') return
  const sessions = getSessions()
  const storedSession: StoredSession = {
    ...session,
    startedAt: session.startedAt.toISOString(),
    endedAt: session.endedAt?.toISOString() || null,
  }

  const existingIndex = sessions.findIndex((s) => s.id === session.id)
  if (existingIndex >= 0) {
    sessions[existingIndex] = storedSession
  } else {
    sessions.push(storedSession)
  }

  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions))

  // Update progress
  const progress = getUserProgress()
  progress.sessionsCompleted = sessions.length
  progress.lastSessionDate = new Date()
  saveUserProgress(progress)
}

// Custom topics management
export function getCustomTopics(): string[] {
  if (typeof window === 'undefined') return []
  const stored = localStorage.getItem(STORAGE_KEYS.CUSTOM_TOPICS)
  if (stored) {
    try {
      return JSON.parse(stored)
    } catch (error) {
      console.error('Failed to parse custom topics:', error)
      localStorage.removeItem(STORAGE_KEYS.CUSTOM_TOPICS)
      return []
    }
  }
  return []
}

export function saveCustomTopic(topic: string): void {
  if (typeof window === 'undefined') return
  const topics = getCustomTopics()
  if (!topics.includes(topic)) {
    topics.push(topic)
    localStorage.setItem(STORAGE_KEYS.CUSTOM_TOPICS, JSON.stringify(topics))
  }
}

export function removeCustomTopic(topic: string): void {
  if (typeof window === 'undefined') return
  const topics = getCustomTopics()
  const filtered = topics.filter((t) => t !== topic)
  localStorage.setItem(STORAGE_KEYS.CUSTOM_TOPICS, JSON.stringify(filtered))
}

// Track topic completion
export function markTopicCompleted(topicId: string): void {
  const progress = getUserProgress()
  if (!progress.topicsCompleted.includes(topicId)) {
    progress.topicsCompleted.push(topicId)
    saveUserProgress(progress)
  }
}

// Track vocabulary practice
export function updateVocabularyProgress(word: string): void {
  const progress = getUserProgress()
  if (progress.vocabularyProgress[word]) {
    progress.vocabularyProgress[word].practiced++
    progress.vocabularyProgress[word].lastPracticed = new Date()
  } else {
    progress.vocabularyProgress[word] = {
      practiced: 1,
      lastPracticed: new Date(),
    }
  }
  saveUserProgress(progress)
}

export function clearAllData(): void {
  if (typeof window === 'undefined') return
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key)
  })
}
