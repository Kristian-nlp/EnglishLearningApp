import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { EnglishAccent, VoiceGender } from '@/types'

// Lazy initialization to avoid build-time errors
let openai: OpenAI | null = null

function getOpenAI(): OpenAI {
  if (!openai) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }
  return openai
}

// Map accent + gender to OpenAI voices
// OpenAI voices: alloy, echo, fable, onyx, nova, shimmer
// - nova: warm female, American-sounding
// - shimmer: expressive female
// - fable: warm, British/storytelling quality
// - onyx: deep male
// - echo: neutral male
// - alloy: neutral
const voiceMap: Record<EnglishAccent, Record<VoiceGender, OpenAI.Audio.SpeechCreateParams['voice']>> = {
  american: {
    female: 'nova',
    male: 'onyx',
  },
  british: {
    female: 'fable',
    male: 'echo',
  },
}

interface TTSRequest {
  text: string
  gender?: VoiceGender
  accent?: EnglishAccent
  speed?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: TTSRequest = await request.json()
    const { text, gender = 'female', accent = 'american', speed = 1.0 } = body

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      )
    }

    // Clamp speed to OpenAI's supported range (0.25 to 4.0)
    const clampedSpeed = Math.max(0.25, Math.min(4.0, speed))

    // Select voice based on accent and gender
    const voice = voiceMap[accent]?.[gender] ?? voiceMap.american.female

    const mp3 = await getOpenAI().audio.speech.create({
      model: 'tts-1',
      voice,
      input: text,
      speed: clampedSpeed,
    })

    // Get the audio data as an ArrayBuffer
    const audioBuffer = await mp3.arrayBuffer()

    // Return the audio as a response
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    console.error('TTS API error:', error)

    if (error instanceof OpenAI.APIError) {
      return NextResponse.json(
        { error: `OpenAI API error: ${error.message}` },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    )
  }
}
