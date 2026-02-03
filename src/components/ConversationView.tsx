'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { DifficultyLevel, Message, UserSettings } from '@/types'
import { getTextToSpeech, getSpeechToText } from '@/lib/voice'
import { assessDifficulty } from '@/lib/difficultyAdapter'
import { saveSession, markTopicCompleted } from '@/lib/db'
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
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesRef = useRef<Message[]>([])
  const messageIdCounter = useRef(0)
  const sessionIdRef = useRef(`session-${Date.now()}`)
  const sessionStartRef = useRef(new Date())
  const ttsRef = useRef(typeof window !== 'undefined' ? getTextToSpeech() : null)
  const sttRef = useRef(typeof window !== 'undefined' ? getSpeechToText() : null)

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
      await ttsRef.current.speak(text, settings.accent, settings.speakingSpeed)
    } catch (error) {
      console.error('TTS error:', error)
    } finally {
      setIsSpeaking(false)
    }
  }, [settings.accent, settings.speakingSpeed])

  // Initialize conversation with a greeting
  useEffect(() => {
    const initialMessage: Message = {
      id: '1',
      role: 'assistant',
      content: `Hello! I am excited to talk with you about "${topic}". Let us have a nice conversation. What do you usually do when you think about ${topic.toLowerCase()}? Please answer in one or two sentences.`,
      timestamp: new Date(),
    }
    setMessages([initialMessage])

    // Speak the initial greeting
    speakText(initialMessage.content)
  }, [topic, speakText])

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
      }
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

  // Persist session data then hand off to parent
  const handleEndSession = useCallback(() => {
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
      setTimeout(handleEndSession, 3000)
      return
    }

    // Call the AI API
    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messagesRef.current, userMessage],
          topic,
          difficultyLevel: effectiveLevel,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
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
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Conversation</h1>
              <p className="text-sm text-gray-600">Topic: {topic}</p>
            </div>
            <DifficultyBadge level={effectiveLevel} signal={difficultySignal} />
          </div>
          <div className="flex gap-3">
            <button
              onClick={onChangeTopic}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Change Topic
            </button>
            <button
              onClick={handleEndSession}
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              End Session
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="mx-auto max-w-4xl space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-4 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-gray-100 px-4 py-3 text-gray-500">
                <span className="animate-pulse">Thinking...</span>
              </div>
            </div>
          )}
          {isSpeaking && !isLoading && (
            <div className="flex justify-start">
              <div className="rounded-lg bg-gray-100 px-4 py-3 text-gray-500">
                <span className="animate-pulse">Speaking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto max-w-4xl">
          {/* Live transcript display */}
          {isListening && (
            <div className="mb-3 rounded-lg bg-blue-50 p-3 text-blue-800">
              <p className="text-sm font-medium">Listening...</p>
              {transcript && <p className="mt-1">{transcript}</p>}
            </div>
          )}

          <div className="flex gap-3">
            {/* Microphone Button */}
            <button
              onClick={isListening ? () => handleStopListening() : handleStartListening}
              className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors ${
                isListening
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title={isListening ? 'Stop recording' : 'Start recording'}
            >
              <MicrophoneIcon isListening={isListening} />
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSendText(transcript)}
              placeholder="Type your message or click the microphone to speak..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isListening || isLoading}
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendText(transcript)}
              disabled={!transcript.trim() || isListening || isLoading}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {isLoading ? '...' : 'Send'}
            </button>
          </div>

          <p className="mt-3 text-center text-sm text-gray-500">
            Say "I am done" or "That is enough for today" to end the session
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
      className={`h-6 w-6 ${isListening ? 'animate-pulse' : ''}`}
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
  const bgColor =
    signal === 'confident' ? 'bg-green-100 text-green-800' :
    signal === 'struggling' ? 'bg-amber-100 text-amber-800' :
    'bg-gray-100 text-gray-700'

  const arrow = signal === 'confident' ? ' ↑' : signal === 'struggling' ? ' ↓' : ''

  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${bgColor}`}>
      {level}{arrow}
    </span>
  )
}
