export type DifficultyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

export type EnglishAccent = 'american' | 'british' | 'australian'

export interface Topic {
  id: string
  name: string
  description: string
  icon: string
}

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface UserSettings {
  difficultyLevel: DifficultyLevel
  speakingSpeed: number // 0.5 to 2.0
  accent: EnglishAccent
}

export interface UserProgress {
  id: string
  userId: string
  difficultPhrases: string[]
  learnedWords: string[]
  sessionsCompleted: number
  lastSessionDate: Date | null
}

export interface ConversationSession {
  id: string
  topic: string
  messages: Message[]
  startedAt: Date
  endedAt: Date | null
}
