'use client'

import { useEffect, useState } from 'react'
import { getUserProgress, getSessions } from '@/lib/db'
import { topics } from '@/lib/topics'
import { UserProgress } from '@/types'

interface ProgressDashboardProps {
  onBack: () => void
  onStartTopic: (topic: string) => void
}

interface SessionStats {
  totalSessions: number
  totalMinutes: number
  uniqueTopics: string[]
  averageMinutesPerSession: number
}

function computeStats(sessions: ReturnType<typeof getSessions>): SessionStats {
  const totalSessions = sessions.length
  let totalMs = 0
  const topicSet = new Set<string>()

  for (const s of sessions) {
    topicSet.add(s.topic)
    if (s.endedAt && s.startedAt) {
      totalMs += new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()
    }
  }

  const totalMinutes = Math.round(totalMs / 60000)
  return {
    totalSessions,
    totalMinutes,
    uniqueTopics: Array.from(topicSet),
    averageMinutesPerSession: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
  }
}

// Return predefined topics the user has NOT yet practiced
function getSuggestedTopics(progress: UserProgress): typeof topics {
  return topics.filter((t) => !progress.topicsCompleted.includes(t.id))
}

export function ProgressDashboard({ onBack, onStartTopic }: ProgressDashboardProps) {
  const [progress, setProgress] = useState<UserProgress | null>(null)
  const [stats, setStats] = useState<SessionStats>({
    totalSessions: 0,
    totalMinutes: 0,
    uniqueTopics: [],
    averageMinutesPerSession: 0,
  })

  useEffect(() => {
    const p = getUserProgress()
    const s = getSessions()
    setProgress(p)
    setStats(computeStats(s))
  }, [])

  if (!progress) return null

  const suggested = getSuggestedTopics(progress)

  return (
    <main className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-3xl">
        <button onClick={onBack} className="mb-6 text-gray-600 hover:text-gray-900">
          ← Back
        </button>

        <h1 className="mb-8 text-3xl font-bold text-gray-900">My Progress</h1>

        {/* Stats row */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard label="Sessions" value={stats.totalSessions} />
          <StatCard label="Total Minutes" value={stats.totalMinutes} />
          <StatCard label="Topics Practiced" value={stats.uniqueTopics.length} />
          <StatCard label="Avg Min / Session" value={stats.averageMinutesPerSession} />
        </div>

        {/* Vocabulary learned */}
        <Section title="Vocabulary Practiced">
          {progress.learnedWords.length === 0 ? (
            <p className="text-sm text-gray-500">No words tracked yet. They will appear as you practice.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {progress.learnedWords.map((word) => (
                <span key={word} className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-800">
                  {word}
                </span>
              ))}
            </div>
          )}
        </Section>

        {/* Difficult phrases */}
        <Section title="Phrases to Review">
          {progress.difficultPhrases.length === 0 ? (
            <p className="text-sm text-gray-500">No difficult phrases logged yet.</p>
          ) : (
            <ul className="space-y-2">
              {progress.difficultPhrases.map((phrase) => (
                <li key={phrase} className="rounded-lg bg-amber-50 px-4 py-2 text-sm text-amber-900">
                  {phrase}
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* Topics practiced */}
        <Section title="Topics Practiced">
          {stats.uniqueTopics.length === 0 ? (
            <p className="text-sm text-gray-500">Start a conversation to see topics here.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {stats.uniqueTopics.map((name) => (
                <span key={name} className="rounded-full bg-green-50 px-3 py-1 text-sm text-green-800">
                  {name}
                </span>
              ))}
            </div>
          )}
        </Section>

        {/* Suggested topics */}
        {suggested.length > 0 && (
          <Section title="Suggested Topics">
            <p className="mb-3 text-sm text-gray-600">
              Try one of these topics you haven&apos;t practiced yet:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {suggested.slice(0, 4).map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => onStartTopic(topic.name)}
                  className="rounded-lg border border-gray-200 p-3 text-left transition-all hover:border-blue-500 hover:shadow-md"
                >
                  <div className="mb-1 text-lg">{topic.icon}</div>
                  <h4 className="text-sm font-semibold text-gray-900">{topic.name}</h4>
                  <p className="text-xs text-gray-500">{topic.description}</p>
                </button>
              ))}
            </div>
          </Section>
        )}
      </div>
    </main>
  )
}

// ── small helpers ────────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">{title}</h2>
      {children}
    </div>
  )
}
