import { DifficultyLevel, Message } from '@/types'

const LEVELS: DifficultyLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1']

// Phrases that signal the user is struggling
const STRUGGLE_SIGNALS = [
  'i don\'t understand',
  'i don\'t know',
  'what does',
  'what is',
  'can you explain',
  'too difficult',
  'too hard',
  'i can\'t',
  'help me',
  'sorry',
  'i mean',
  'how do you say',
]

// Phrases that signal confidence
const CONFIDENCE_SIGNALS = [
  'actually',
  'in my opinion',
  'on the other hand',
  'for example',
  'in addition',
  'however',
  'moreover',
  'although',
  'because',
  'therefore',
  'furthermore',
  'nevertheless',
]

interface AssessmentResult {
  signal: 'confident' | 'struggling' | 'neutral'
  score: number // -1 (very struggling) to +1 (very confident)
}

// Assess a single user message for difficulty signals
function assessResponse(text: string): AssessmentResult {
  const lower = text.toLowerCase().trim()
  const wordCount = lower.split(/\s+/).filter(Boolean).length

  let score = 0

  // Very short responses are a struggle signal
  if (wordCount <= 2) {
    score -= 0.6
  } else if (wordCount <= 5) {
    score -= 0.2
  } else if (wordCount >= 25) {
    score += 0.5
  } else if (wordCount >= 15) {
    score += 0.3
  }

  // Check for struggle signals
  for (const signal of STRUGGLE_SIGNALS) {
    if (lower.includes(signal)) {
      score -= 0.5
      break
    }
  }

  // Check for confidence signals (connector words, opinions)
  let confidenceHits = 0
  for (const signal of CONFIDENCE_SIGNALS) {
    if (lower.includes(signal)) {
      confidenceHits++
    }
  }
  if (confidenceHits >= 2) {
    score += 0.6
  } else if (confidenceHits === 1) {
    score += 0.3
  }

  // Clamp score
  score = Math.max(-1, Math.min(1, score))

  const signal = score >= 0.25 ? 'confident' : score <= -0.25 ? 'struggling' : 'neutral'
  return { signal, score }
}

// Look at the last N user messages and return a smoothed difficulty recommendation
export function assessDifficulty(
  messages: Message[],
  currentLevel: DifficultyLevel,
  windowSize: number = 3
): { effectiveLevel: DifficultyLevel; signal: 'confident' | 'struggling' | 'neutral' } {
  // Pull only the most recent user messages
  const userMessages = messages
    .filter((m) => m.role === 'user')
    .slice(-windowSize)

  if (userMessages.length === 0) {
    return { effectiveLevel: currentLevel, signal: 'neutral' }
  }

  // Average the scores across the window
  const scores = userMessages.map((m) => assessResponse(m.content))
  const avgScore = scores.reduce((sum, s) => sum + s.score, 0) / scores.length

  const currentIndex = LEVELS.indexOf(currentLevel)

  let effectiveIndex = currentIndex
  // Need a sustained signal (avg across window) to actually shift a level
  if (avgScore >= 0.35 && currentIndex < LEVELS.length - 1) {
    effectiveIndex = currentIndex + 1
  } else if (avgScore <= -0.35 && currentIndex > 0) {
    effectiveIndex = currentIndex - 1
  }

  const dominantSignal =
    avgScore >= 0.25 ? 'confident' : avgScore <= -0.25 ? 'struggling' : 'neutral'

  return {
    effectiveLevel: LEVELS[effectiveIndex],
    signal: dominantSignal,
  }
}
