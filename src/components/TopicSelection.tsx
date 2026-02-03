'use client'

import { useState, useEffect } from 'react'
import { topics } from '@/lib/topics'
import { DifficultyLevel, EnglishAccent, UserSettings, VoiceGender } from '@/types'
import { saveCustomTopic, getCustomTopics, removeCustomTopic, getUserSettings, saveUserSettings } from '@/lib/db'

interface TopicSelectionProps {
  onSelectTopic: (topic: string, settings: UserSettings) => void
  onBack: () => void
}

export function TopicSelection({ onSelectTopic, onBack }: TopicSelectionProps) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('A2')
  const [speed, setSpeed] = useState(1.0)
  const [accent, setAccent] = useState<EnglishAccent>('american')
  const [voiceGender, setVoiceGender] = useState<VoiceGender>('female')
  const [customTopic, setCustomTopic] = useState('')
  const [savedCustomTopics, setSavedCustomTopics] = useState<string[]>([])

  const difficulties: DifficultyLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1']

  // Load persisted settings and custom topics on first render
  useEffect(() => {
    const saved = getUserSettings()
    setDifficulty(saved.difficultyLevel)
    setSpeed(saved.speakingSpeed)
    setAccent(saved.accent)
    setVoiceGender(saved.voiceGender || 'female')
    setSavedCustomTopics(getCustomTopics())
  }, [])

  const getSettings = (): UserSettings => ({
    difficultyLevel: difficulty,
    speakingSpeed: speed,
    accent: accent,
    voiceGender: voiceGender,
  })

  const handleTopicSelect = (topic: string) => {
    saveUserSettings(getSettings())
    onSelectTopic(topic, getSettings())
  }

  const handleCustomTopicSubmit = () => {
    if (customTopic.trim()) {
      const topic = customTopic.trim()
      saveCustomTopic(topic)
      setSavedCustomTopics((prev) => (prev.includes(topic) ? prev : [...prev, topic]))
      setCustomTopic('')
      saveUserSettings(getSettings())
      onSelectTopic(topic, getSettings())
    }
  }

  const handleRemoveCustomTopic = (topic: string) => {
    removeCustomTopic(topic)
    setSavedCustomTopics((prev) => prev.filter((t) => t !== topic))
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="mb-12 flex items-center">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="mr-4 text-gray-400 transition-colors hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-lg font-medium text-gray-900">Get Started</h1>
        </div>

          {/* Conversation Settings Section */}
          <section className="mb-16">
            <h2 className="mb-8 text-xl font-semibold text-gray-900">
              Conversation Settings
            </h2>

            <div className="space-y-8">
              {/* Difficulty Level */}
              <div>
                <label className="mb-3 block text-sm text-gray-500">
                  Level
                </label>
                <div className="flex flex-wrap gap-2">
                  {difficulties.map((level) => (
                    <button
                      key={level}
                      onClick={() => setDifficulty(level)}
                      aria-pressed={difficulty === level}
                      aria-label={`Difficulty level ${level}`}
                      className={`rounded-full px-5 py-2 text-sm font-medium transition-all ${
                        difficulty === level
                          ? 'bg-gray-900 text-white'
                          : 'border border-gray-300 text-gray-600 hover:border-gray-400 hover:text-gray-900'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speaking Speed */}
              <div>
                <label className="mb-3 block text-sm text-gray-500">
                  Speaking Speed
                  <span className="ml-2 text-gray-900">{speed.toFixed(1)}x</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  aria-label="Speaking speed"
                  className="h-1.5 w-full max-w-sm cursor-pointer appearance-none rounded-full bg-gray-200 accent-sky-500"
                />
                <div className="mt-2 flex max-w-sm justify-between text-xs text-gray-400">
                  <span>Slower</span>
                  <span>Faster</span>
                </div>
              </div>

              {/* Accent and Voice row */}
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Accent */}
                <div>
                  <label className="mb-3 block text-sm text-gray-500">
                    Accent
                  </label>
                  <select
                    value={accent}
                    onChange={(e) => setAccent(e.target.value as EnglishAccent)}
                    aria-label="English accent"
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition-colors hover:border-gray-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="american">American English</option>
                    <option value="british">British English</option>
                    <option value="australian">Australian English</option>
                  </select>
                </div>

                {/* Voice */}
                <div>
                  <label className="mb-3 block text-sm text-gray-500">
                    Voice
                  </label>
                  <select
                    value={voiceGender}
                    onChange={(e) => setVoiceGender(e.target.value as VoiceGender)}
                    aria-label="Voice gender"
                    className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 transition-colors hover:border-gray-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  >
                    <option value="female">Female voice</option>
                    <option value="male">Male voice</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Choose a Topic Section */}
          <section className="mb-16">
            <h2 className="mb-8 text-xl font-semibold text-gray-900">
              Choose a Topic
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicSelect(topic.name)}
                  aria-label={`Start conversation about ${topic.name}`}
                  className="group rounded-xl border-2 border-gray-200 p-8 text-left transition-all hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                >
                  <div className="mb-3 text-2xl">{topic.icon}</div>
                  <h3 className="mb-2 font-medium text-gray-900 group-hover:text-sky-600">
                    {topic.name}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-500">{topic.description}</p>
                </button>
              ))}
            </div>

            {/* Custom Topics (if any) */}
            {savedCustomTopics.length > 0 && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {savedCustomTopics.map((topic) => (
                  <div
                    key={topic}
                    className="group flex items-center justify-between rounded-xl border-2 border-sky-200 bg-sky-50 p-8 transition-all hover:border-sky-300"
                  >
                    <button
                      onClick={() => handleTopicSelect(topic)}
                      aria-label={`Start conversation about ${topic}`}
                      className="flex-1 text-left"
                    >
                      <h3 className="font-medium text-gray-900 group-hover:text-sky-600">{topic}</h3>
                      <p className="text-sm text-sky-600">Custom topic</p>
                    </button>
                    <button
                      onClick={() => handleRemoveCustomTopic(topic)}
                      aria-label={`Remove custom topic ${topic}`}
                      className="ml-4 rounded-full p-2 text-gray-400 transition-colors hover:bg-white hover:text-gray-600"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Create Your Own Section */}
          <section>
            <h2 className="mb-8 text-xl font-semibold text-gray-900">
              Create Your Own
            </h2>
            <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors focus-within:border-sky-500 focus-within:bg-white">
              <label className="mb-3 block text-sm text-gray-500">
                Enter a topic you&apos;d like to discuss
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g., My favorite hobbies, Travel experiences..."
                  aria-label="Enter a custom topic"
                  className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 placeholder-gray-400 transition-colors hover:border-gray-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  onKeyDown={(e) => e.key === 'Enter' && handleCustomTopicSubmit()}
                />
                <button
                  onClick={handleCustomTopicSubmit}
                  disabled={!customTopic.trim()}
                  aria-label="Start conversation with custom topic"
                  className="rounded-lg bg-gray-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
                >
                  Start
                </button>
              </div>
            </div>
          </section>

      </div>
    </main>
  )
}
