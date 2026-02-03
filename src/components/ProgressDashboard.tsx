'use client'

import { useEffect, useState } from 'react'
import { getUserProgress, getSessions, getGrammarErrors, GrammarErrorPattern } from '@/lib/db'
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
  const [grammarErrors, setGrammarErrors] = useState<Record<string, GrammarErrorPattern>>({})

  useEffect(() => {
    const p = getUserProgress()
    const s = getSessions()
    setProgress(p)
    setStats(computeStats(s))
    setGrammarErrors(getGrammarErrors())
  }, [])

  if (!progress) return null

  const suggested = getSuggestedTopics(progress)

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="mx-auto flex max-w-3xl items-center px-6 py-5">
          <button
            onClick={onBack}
            aria-label="Go back"
            className="mr-4 text-gray-400 transition-colors hover:text-gray-900"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <h1 className="text-lg font-medium text-gray-900">Your Progress</h1>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-10">
        {/* Stats row */}
        <section className="mb-16">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Sessions" value={stats.totalSessions} />
            <StatCard label="Minutes" value={stats.totalMinutes} />
            <StatCard label="Topics" value={stats.uniqueTopics.length} />
            <StatCard label="Avg. Min" value={stats.averageMinutesPerSession} />
          </div>
        </section>

        {/* Vocabulary learned */}
        <Section title="Words Learned">
          {progress.learnedWords.length === 0 ? (
            <p className="text-sm text-gray-400">No words tracked yet. They will appear as you practice.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {progress.learnedWords.map((word) => (
                <span
                  key={word}
                  className="rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700"
                >
                  {word}
                </span>
              ))}
            </div>
          )}
        </Section>

        {/* Difficult phrases */}
        <Section title="Phrases to Review">
          {progress.difficultPhrases.length === 0 ? (
            <p className="text-sm text-gray-400">No difficult phrases logged yet.</p>
          ) : (
            <div className="space-y-2">
              {progress.difficultPhrases.map((phrase) => (
                <div
                  key={phrase}
                  className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900"
                >
                  {phrase}
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Grammar patterns */}
        <Section title="Grammar Patterns">
          {Object.keys(grammarErrors).length === 0 ? (
            <p className="text-sm text-gray-400">No grammar patterns tracked yet. They will appear as you practice.</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(grammarErrors)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 5)
                .map(([rule, data]) => (
                  <div key={rule} className="rounded-xl border border-gray-100 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900">{rule}</h4>
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                        {data.count}x
                      </span>
                    </div>
                    {data.examples.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm text-red-400 line-through">
                          {data.examples[data.examples.length - 1].original}
                        </p>
                        <p className="text-sm text-emerald-600">
                          {data.examples[data.examples.length - 1].corrected}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </Section>

        {/* Topics practiced */}
        <Section title="Topics Practiced">
          {stats.uniqueTopics.length === 0 ? (
            <p className="text-sm text-gray-400">Start a conversation to see topics here.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {stats.uniqueTopics.map((name) => (
                <span
                  key={name}
                  className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm text-emerald-700"
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </Section>

        {/* Suggested topics */}
        {suggested.length > 0 && (
          <Section title="Try Next">
            <p className="mb-4 text-sm text-gray-500">
              Topics you haven&apos;t practiced yet:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {suggested.slice(0, 4).map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => onStartTopic(topic.name)}
                  aria-label={`Start conversation about ${topic.name}`}
                  className="group rounded-xl border border-gray-200 p-4 text-left transition-all hover:border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
                >
                  <div className="mb-2 text-xl">{topic.icon}</div>
                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-sky-600">
                    {topic.name}
                  </h4>
                  <p className="mt-1 text-xs text-gray-500">{topic.description}</p>
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
    <div className="rounded-xl border border-gray-100 bg-gray-50 p-5 text-center">
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-6 text-sm font-medium uppercase tracking-wide text-gray-400">
        {title}
      </h2>
      {children}
    </section>
  )
}
