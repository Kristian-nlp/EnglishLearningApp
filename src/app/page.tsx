'use client'

import { useState } from 'react'
import { TopicSelection } from '@/components/TopicSelection'
import { ConversationView } from '@/components/ConversationView'
import { ProgressDashboard } from '@/components/ProgressDashboard'
import { UserSettings } from '@/types'

const defaultSettings: UserSettings = {
  difficultyLevel: 'A2',
  speakingSpeed: 1.0,
  accent: 'american',
  voiceGender: 'female',
}

export default function Home() {
  const [started, setStarted] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [settings, setSettings] = useState<UserSettings>(defaultSettings)

  const handleTopicSelect = (topic: string, newSettings: UserSettings) => {
    setSelectedTopic(topic)
    setSettings(newSettings)
  }

  // Dashboard: suggested topic tapped → go straight into conversation
  if (showDashboard) {
    return (
      <ProgressDashboard
        onBack={() => setShowDashboard(false)}
        onStartTopic={(topic) => {
          setShowDashboard(false)
          setSelectedTopic(topic)
          setStarted(true)
        }}
      />
    )
  }

  if (!started) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6">
        <div className="w-full max-w-md text-center">
          {/* Logo/Icon */}
          <div className="mx-auto mb-10 flex h-16 w-16 items-center justify-center rounded-full border border-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-8 w-8 text-gray-900"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 01-.923 1.785A5.969 5.969 0 006 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337z"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="mb-4 text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
            Practice English
          </h1>

          {/* Subtitle */}
          <p className="text-lg leading-relaxed text-gray-500">
            Improve your English through natural conversation.
            Designed for German speakers at all levels.
          </p>

          {/* CTAs */}
          <div className="mt-12 flex items-center justify-center gap-4">
            <button
              onClick={() => setStarted(true)}
              className="rounded-full bg-gray-900 px-8 py-4 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              Start practicing
            </button>
            <button
              onClick={() => setShowDashboard(true)}
              className="rounded-full border border-gray-200 px-8 py-4 text-sm font-medium text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              View progress
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (!selectedTopic) {
    return (
      <TopicSelection
        onSelectTopic={handleTopicSelect}
        onBack={() => setStarted(false)}
      />
    )
  }

  return (
    <ConversationView
      topic={selectedTopic}
      settings={settings}
      onEndSession={() => {
        setSelectedTopic(null)
        setStarted(false)
      }}
      onChangeTopic={() => setSelectedTopic(null)}
    />
  )
}
