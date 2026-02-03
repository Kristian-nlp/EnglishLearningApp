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
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white p-8">
        <div className="max-w-2xl text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-600 shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" className="h-10 w-10">
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 013.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 4.5c-2.392 0-4.744.175-7.043.513C3.373 5.746 2.25 7.14 2.25 8.741v6.018z" />
            </svg>
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900">English Learning App</h1>
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
            className="mt-4 block w-full rounded-lg border border-gray-300 px-8 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
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
