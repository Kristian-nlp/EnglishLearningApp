import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { VoiceGender } from '@/types'

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

// Map gender to OpenAI voices
// Female: nova (warm), shimmer (expressive), alloy (neutral)
// Male: onyx (deep), fable (British-ish), echo (neutral)
const voiceMap: Record<VoiceGender, OpenAI.Audio.SpeechCreateParams['voice']> = {
  female: 'nova',
  male: 'onyx',
}

interface TTSRequest {
  text: string
  gender?: VoiceGender
  speed?: number
}

export async function POST(request: NextRequest) {
  try {
    const body: TTSRequest = await request.json()
    const { text, gender = 'female', speed = 1.0 } = body

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

    const mp3 = await getOpenAI().audio.speech.create({
      model: 'tts-1',
      voice: voiceMap[gender],
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
