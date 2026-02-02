'use client'

import { useState, useRef, useEffect } from 'react'
import { Message } from '@/types'

interface ConversationViewProps {
  topic: string
  onEndSession: () => void
  onChangeTopic: () => void
}

export function ConversationView({ topic, onEndSession, onChangeTopic }: ConversationViewProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize conversation with a greeting
  useEffect(() => {
    const initialMessage: Message = {
      id: '1',
      role: 'assistant',
      content: `Hello! I am excited to talk with you about "${topic}". Let us have a nice conversation. What do you usually do when you think about ${topic.toLowerCase()}? Please answer in one or two sentences.`,
      timestamp: new Date(),
    }
    setMessages([initialMessage])
  }, [topic])

  const handleStartListening = () => {
    setIsListening(true)
    setTranscript('')
    // Speech recognition will be implemented with Web Speech API or OpenAI Whisper
  }

  const handleStopListening = () => {
    setIsListening(false)
    // Process the transcript
    if (transcript) {
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: transcript,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, userMessage])
      // TODO: Send to AI and get response
    }
  }

  const handleSendText = (text: string) => {
    if (!text.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setTranscript('')

    // Simulate AI response (will be replaced with actual API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'That sounds interesting! Can you tell me more about that? Please describe it in a few sentences.',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiResponse])
    }, 1000)
  }

  return (
    <main className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Conversation</h1>
            <p className="text-sm text-gray-600">Topic: {topic}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onChangeTopic}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Change Topic
            </button>
            <button
              onClick={onEndSession}
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
          {isSpeaking && (
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
              onClick={isListening ? handleStopListening : handleStartListening}
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
              onKeyDown={(e) => e.key === 'Enter' && handleSendText(transcript)}
              placeholder="Type your message or click the microphone to speak..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={isListening}
            />

            {/* Send Button */}
            <button
              onClick={() => handleSendText(transcript)}
              disabled={!transcript.trim() || isListening}
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Send
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
