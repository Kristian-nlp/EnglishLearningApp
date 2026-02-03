'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { DifficultyLevel, Message, UserSettings } from '@/types'
import { getTextToSpeech, getSpeechToText } from '@/lib/voice'
import { assessDifficulty } from '@/lib/difficultyAdapter'
import { saveSession, markTopicCompleted, trackGrammarError, addLearnedWord, addDifficultPhrase } from '@/lib/db'
import { topics } from '@/lib/topics'

interface ConversationViewProps {
  topic: string
  settings: UserSettings
  onEndSession: () => void
  onChangeTopic: () => void
}

export function ConversationView({ topic, settings, onEndSession, onChangeTopic }: ConversationViewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [effectiveLevel, setEffectiveLevel] = useState<DifficultyLevel>(settings.difficultyLevel)
  const [difficultySignal, setDifficultySignal] = useState<'confident' | 'struggling' | 'neutral'>('neutral')
  const [isPaused, setIsPaused] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<Message[]>([])
  const messageIdCounter = useRef(0)
  const sessionIdRef = useRef(`session-${Date.now()}`)
  const sessionStartRef = useRef(new Date())
  const ttsRef = useRef(typeof window !== 'undefined' ? getTextToSpeech() : null)
  const sttRef = useRef(typeof window !== 'undefined' ? getSpeechToText() : null)
  const endSessionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const accentLangMap: Record<string, string> = { american: 'en-US', british: 'en-GB', australian: 'en-AU' }

  // Generate unique message ID
  const generateMessageId = () => {
    return `${Date.now()}-${messageIdCounter.current++}`
  }

  // Keep messagesRef in sync with messages state
  useEffect(() => {
    messagesRef.current = messages
  }, [messages])

  // Re-assess difficulty whenever messages change
  useEffect(() => {
    const { effectiveLevel: newLevel, signal } = assessDifficulty(messages, settings.difficultyLevel)
    setEffectiveLevel(newLevel)
    setDifficultySignal(signal)
  }, [messages, settings.difficultyLevel])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Speak text using TTS
  const speakText = useCallback(async (text: string) => {
    if (!ttsRef.current) return
    setIsSpeaking(true)
    try {
      await ttsRef.current.speak(text, settings.accent, settings.speakingSpeed, settings.voiceGender)
    } catch (error) {
      console.error('TTS error:', error)
    } finally {
      setIsSpeaking(false)
    }
  }, [settings.accent, settings.speakingSpeed, settings.voiceGender])

  // Fetch AI-generated greeting on mount
  useEffect(() => {
    let cancelled = false
    setIsLoading(true)

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: '[START]' }],
        topic,
        difficultyLevel: settings.difficultyLevel,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        if (data.progress?.learned?.length) {
          data.progress.learned.forEach((word: string) => addLearnedWord(word))
        }
        const greeting: Message = {
          id: generateMessageId(),
          role: 'assistant',
          content: data.content,
          timestamp: new Date(),
        }
        setMessages([greeting])
        speakText(data.content)
      })
      .catch(() => {
        if (cancelled) return
        const fallback: Message = {
          id: generateMessageId(),
          role: 'assistant',
          content: `Hello! Let us talk about "${topic}". Could you tell me a little about your interest in this topic?`,
          timestamp: new Date(),
        }
        setMessages([fallback])
        speakText(fallback.content)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => { cancelled = true }
  }, [topic, settings.difficultyLevel, speakText])

  const handleStartListening = () => {
    if (!sttRef.current) {
      console.error('Speech recognition not available')
      return
    }

    // Stop any ongoing speech
    if (ttsRef.current) {
      ttsRef.current.stop()
    }

    setIsListening(true)
    setTranscript('')

    sttRef.current.start(
      (text, isFinal) => {
        setTranscript(text)
        if (isFinal) {
          // Auto-stop after final result
          handleStopListening(text)
        }
      },
      (error) => {
        console.error('STT error:', error)
        setIsListening(false)
      },
      accentLangMap[settings.accent]
    )
  }

  const handleStopListening = (finalTranscript?: string) => {
    if (sttRef.current) {
      sttRef.current.stop()
    }
    setIsListening(false)

    const textToSend = finalTranscript || transcript
    if (textToSend.trim()) {
      handleSendText(textToSend)
    }
  }

  const handlePause = () => {
    if (ttsRef.current) ttsRef.current.stop()
    if (sttRef.current) sttRef.current.stop()
    setIsListening(false)
    setIsPaused(true)
  }

  const handleResume = () => {
    setIsPaused(false)
    const lastAssistant = [...messagesRef.current].reverse().find((m) => m.role === 'assistant')
    if (lastAssistant) speakText(lastAssistant.content)
  }

  // Persist session data then hand off to parent
  const handleEndSession = useCallback(() => {
    if (endSessionTimeoutRef.current) {
      clearTimeout(endSessionTimeoutRef.current)
      endSessionTimeoutRef.current = null
    }
    saveSession({
      id: sessionIdRef.current,
      topic,
      messages: messagesRef.current,
      startedAt: sessionStartRef.current,
      endedAt: new Date(),
    })
    const topicData = topics.find((t) => t.name === topic)
    if (topicData) markTopicCompleted(topicData.id)
    onEndSession()
  }, [topic, onEndSession])

  const handleSendText = useCallback(async (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: generateMessageId(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setTranscript('')

    // Check for session end phrases
    const lowerText = text.toLowerCase()
    if (lowerText.includes('i am done') || lowerText.includes("i'm done") ||
        lowerText.includes('that is enough') || lowerText.includes("that's enough")) {
      const goodbyeMessage: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: 'Great conversation! You did very well today. See you next time!',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, goodbyeMessage])
      speakText(goodbyeMessage.content)
      endSessionTimeoutRef.current = setTimeout(handleEndSession, 3000)
      return
    }

    // Call the AI API — window history to last 20 messages to avoid context bloat
    setIsLoading(true)
    try {
      const historyToSend = [...messagesRef.current, userMessage].slice(-20)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyToSend,
          topic,
          difficultyLevel: effectiveLevel,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()

      // Persist any grammar corrections returned by the API
      if (data.corrections?.length) {
        data.corrections.forEach((c: { original: string; corrected: string; rule: string }) => {
          trackGrammarError(c)
        })
      }

      // Persist vocabulary and difficult phrases returned by the API
      if (data.progress?.learned?.length) {
        data.progress.learned.forEach((word: string) => addLearnedWord(word))
      }
      if (data.progress?.difficult?.length) {
        data.progress.difficult.forEach((phrase: string) => addDifficultPhrase(phrase))
      }

      const aiResponse: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
      speakText(aiResponse.content)
    } catch (error) {
      console.error('API error:', error)
      // Fallback response if API fails
      const fallbackResponse: Message = {
        id: generateMessageId(),
        role: 'assistant',
        content: 'I apologize, I had trouble understanding. Could you please repeat that? Please try again.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, fallbackResponse])
      speakText(fallbackResponse.content)
    } finally {
      setIsLoading(false)
    }
  }, [speakText, handleEndSession, topic, effectiveLevel])

  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={onChangeTopic}
              aria-label="Change topic"
              className="text-gray-400 transition-colors hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            <div>
              <h1 className="text-base font-medium text-gray-900">{topic}</h1>
              <div className="flex items-center gap-2">
                <DifficultyBadge level={effectiveLevel} signal={difficultySignal} />
                {isSpeaking && (
                  <span className="text-xs text-sky-500">Speaking...</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={isPaused ? handleResume : handlePause}
              aria-label={isPaused ? 'Resume conversation' : 'Pause conversation'}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isPaused
                  ? 'bg-sky-50 text-sky-600 hover:bg-sky-100'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={handleEndSession}
              aria-label="End session"
              className="rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
            >
              End
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] ${
                    message.role === 'user'
                      ? 'rounded-2xl rounded-br-md bg-gray-900 px-5 py-3 text-white'
                      : 'rounded-2xl rounded-bl-md border border-gray-100 bg-gray-50 px-5 py-3 text-gray-900'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start" role="status" aria-live="polite">
                <div className="rounded-2xl rounded-bl-md border border-gray-100 bg-gray-50 px-5 py-3">
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-300" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-300" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 animate-bounce rounded-full bg-gray-300" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-100 bg-white">
        <div className="mx-auto max-w-3xl px-6 py-4">
          {/* Paused banner */}
          {isPaused && (
            <div className="mb-4 rounded-xl bg-gray-50 p-4 text-center" role="status" aria-live="polite">
              <p className="text-sm text-gray-500">Session paused. Press Resume to continue.</p>
            </div>
          )}

          {/* Live transcript display */}
          {isListening && (
            <div className="mb-4 rounded-xl bg-sky-50 p-4" role="status" aria-live="polite">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 animate-pulse rounded-full bg-sky-500" />
                <span className="text-sm font-medium text-sky-700">Listening...</span>
              </div>
              {transcript && <p className="mt-2 text-sm text-sky-900">{transcript}</p>}
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Microphone Button */}
            <button
              onClick={isListening ? () => handleStopListening() : handleStartListening}
              disabled={isPaused}
              aria-label={isListening ? 'Stop recording' : 'Start recording'}
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full transition-all ${
                isPaused
                  ? 'cursor-not-allowed bg-gray-100 text-gray-300'
                  : isListening
                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/30 hover:bg-red-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <MicrophoneIcon isListening={isListening} />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && !isPaused && handleSendText(transcript)}
              placeholder={isPaused ? 'Session is paused...' : 'Type your message...'}
              aria-label="Message input"
              className="flex-1 rounded-xl border border-gray-200 px-5 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors hover:border-gray-300 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500 disabled:bg-gray-50 disabled:text-gray-400"
              disabled={isListening || isLoading || isPaused}
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendText(transcript)}
              disabled={!transcript.trim() || isListening || isLoading || isPaused}
              aria-label="Send message"
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-gray-400">
            Say &quot;I&apos;m done&quot; or &quot;That&apos;s enough&quot; to end the session
          </p>
        </div>
      </div>
    </main>
  )
}

function MicrophoneIcon({ isListening }: { isListening: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={`h-5 w-5 ${isListening ? 'animate-pulse' : ''}`}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
      />
    </svg>
  )
}

function DifficultyBadge({
  level,
  signal,
}: {
  level: DifficultyLevel
  signal: 'confident' | 'struggling' | 'neutral'
}) {
  const styles =
    signal === 'confident'
      ? 'text-emerald-600'
      : signal === 'struggling'
        ? 'text-amber-600'
        : 'text-gray-500'

  const arrow = signal === 'confident' ? ' ↑' : signal === 'struggling' ? ' ↓' : ''

  return (
    <span className={`text-xs font-medium ${styles}`}>
      Level {level}{arrow}
    </span>
  )
}
