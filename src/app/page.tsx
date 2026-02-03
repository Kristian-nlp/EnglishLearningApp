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
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <div className="max-w-2xl text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900">English Learning App</h1>
          <p className="mb-8 text-lg text-gray-600">
            Practice your English through natural conversation. Designed for German speakers at all
            levels from A1 to C1.
          </p>
          <button
            onClick={() => setStarted(true)}
            className="rounded-lg bg-blue-600 px-8 py-4 text-xl font-semibold text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Start
          </button>
          <button
            onClick={() => setShowDashboard(true)}
            className="mt-4 block w-full rounded-lg border border-gray-300 px-8 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            My Progress
          </button>
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
