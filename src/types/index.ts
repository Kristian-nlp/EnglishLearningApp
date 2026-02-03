export type DifficultyLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1'

export type EnglishAccent = 'american' | 'british'

export type VoiceGender = 'male' | 'female'

export interface Topic {
  id: string
  name: string
  description: string
  icon: string
  isCustom?: boolean
}

export interface VocabularyItem {
  word: string
  germanTranslation: string
  difficultyLevel: DifficultyLevel
  example?: string
}

export interface TopicVocabulary {
  topicId: string
  vocabulary: VocabularyItem[]
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
  voiceGender: VoiceGender
}

export interface UserProgress {
  id: string
  userId: string
  difficultPhrases: string[]
  learnedWords: string[]
  sessionsCompleted: number
  lastSessionDate: Date | null
  topicsCompleted: string[]
  vocabularyProgress: { [word: string]: { practiced: number; lastPracticed: Date } }
}

export interface ConversationSession {
  id: string
  topic: string
  messages: Message[]
  startedAt: Date
  endedAt: Date | null
}

export interface GrammarCorrection {
  original: string
  corrected: string
  rule: string
}
