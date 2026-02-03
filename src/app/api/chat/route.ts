import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { buildSystemPrompt } from '@/lib/systemPrompt'
import { DifficultyLevel, Message } from '@/types'
import { getRandomVocabulary } from '@/lib/vocabulary'
import { topics } from '@/lib/topics'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ChatRequest {
  messages: Message[]
  topic: string
  difficultyLevel: DifficultyLevel
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json()
    const { messages, topic, difficultyLevel } = body

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Find topic ID from topic name
    const topicData = topics.find(t => t.name === topic)
    const topicId = topicData?.id || ''

    // Get vocabulary suggestions for this topic
    const vocabulary = topicId ? getRandomVocabulary(topicId, difficultyLevel, 4) : []

    // Build system prompt with vocabulary
    const systemPrompt = buildSystemPrompt(topic, difficultyLevel, 'the learner', vocabulary)

    // Convert messages to OpenAI format
    const openaiMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ]

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: openaiMessages,
      temperature: 0.7,
      max_tokens: 500,
    })

    const responseContent = completion.choices[0]?.message?.content || ''

    return NextResponse.json({
      content: responseContent,
      usage: completion.usage,
    })
  } catch (error) {
    console.error('Chat API error:', error)

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    )
  }
}
