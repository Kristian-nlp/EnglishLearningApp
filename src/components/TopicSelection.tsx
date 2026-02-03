'use client'

import { useState, useEffect } from 'react'
import { topics } from '@/lib/topics'
import { DifficultyLevel, EnglishAccent, UserSettings } from '@/types'
import { saveCustomTopic, getCustomTopics, removeCustomTopic, getUserSettings, saveUserSettings } from '@/lib/db'

interface TopicSelectionProps {
  onSelectTopic: (topic: string, settings: UserSettings) => void
  onBack: () => void
}

export function TopicSelection({ onSelectTopic, onBack }: TopicSelectionProps) {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('A2')
  const [speed, setSpeed] = useState(1.0)
  const [accent, setAccent] = useState<EnglishAccent>('american')
  const [customTopic, setCustomTopic] = useState('')
  const [savedCustomTopics, setSavedCustomTopics] = useState<string[]>([])

  const difficulties: DifficultyLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1']

  // Load persisted settings and custom topics on first render
  useEffect(() => {
    const saved = getUserSettings()
    setDifficulty(saved.difficultyLevel)
    setSpeed(saved.speakingSpeed)
    setAccent(saved.accent)
    setSavedCustomTopics(getCustomTopics())
  }, [])

  const getSettings = (): UserSettings => ({
    difficultyLevel: difficulty,
    speakingSpeed: speed,
    accent: accent,
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
    <main className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-4xl">
        <button
          onClick={onBack}
          aria-label="Go back"
          className="mb-6 text-gray-600 hover:text-gray-900"
        >
          ← Back
        </button>

        <h1 className="mb-8 text-3xl font-bold text-gray-900">Choose Your Settings</h1>

        {/* Settings Section */}
        <div className="mb-12 grid gap-6 md:grid-cols-3">
          {/* Difficulty Level */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Difficulty Level
            </label>
            <div className="flex gap-2">
              {difficulties.map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  aria-pressed={difficulty === level}
                  aria-label={`Difficulty level ${level}`}
                  className={`rounded px-3 py-2 text-sm font-medium transition-colors ${
                    difficulty === level
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Speaking Speed */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Speaking Speed: {speed.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={speed}
              onChange={(e) => setSpeed(parseFloat(e.target.value))}
              aria-label="Speaking speed"
              className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>Slow</span>
              <span>Normal</span>
              <span>Fast</span>
            </div>
          </div>

          {/* Accent */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              English Accent
            </label>
            <select
              value={accent}
              onChange={(e) => setAccent(e.target.value as EnglishAccent)}
              aria-label="English accent"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="american">American</option>
              <option value="british">British</option>
              <option value="australian">Australian</option>
            </select>
          </div>
        </div>

        {/* Topic Selection */}
        <h2 className="mb-6 text-2xl font-semibold text-gray-900">Select a Topic</h2>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => handleTopicSelect(topic.name)}
              aria-label={`Start conversation about ${topic.name}`}
              className="rounded-lg border border-gray-200 p-4 text-left transition-all hover:border-blue-500 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <div className="mb-2 text-2xl">{topic.icon}</div>
              <h3 className="mb-1 font-semibold text-gray-900">{topic.name}</h3>
              <p className="text-sm text-gray-600">{topic.description}</p>
            </button>
          ))}
        </div>

        {/* Previously saved custom topics */}
        {savedCustomTopics.length > 0 && (
          <div className="mb-8">
            <h3 className="mb-3 text-lg font-semibold text-gray-900">Your Topics</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {savedCustomTopics.map((topic) => (
                <div key={topic} className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                  <div className="flex items-start justify-between">
                    <button
                      onClick={() => handleTopicSelect(topic)}
                      aria-label={`Start conversation about ${topic}`}
                      className="flex-1 text-left"
                    >
                      <h3 className="mb-1 font-semibold text-gray-900">{topic}</h3>
                      <p className="text-sm text-blue-600">Custom topic</p>
                    </button>
                    <button
                      onClick={() => handleRemoveCustomTopic(topic)}
                      aria-label={`Remove custom topic ${topic}`}
                      className="ml-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Topic */}
        <div className="rounded-lg bg-gray-50 p-6">
          <h3 className="mb-3 font-semibold text-gray-900">Or enter your own topic</h3>
          <div className="flex gap-3">
            <input
              type="text"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              placeholder="e.g., My favorite sports, Learning to drive..."
              aria-label="Enter a custom topic"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              onKeyDown={(e) => e.key === 'Enter' && handleCustomTopicSubmit()}
            />
            <button
              onClick={handleCustomTopicSubmit}
              disabled={!customTopic.trim()}
              aria-label="Start conversation with custom topic"
              className="rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Start
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
