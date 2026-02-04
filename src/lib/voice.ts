// Voice utilities for Text-to-Speech and Speech-to-Text
// Uses OpenAI TTS as primary (natural voices), with Web Speech API as fallback

import { EnglishAccent, VoiceGender } from '@/types'

// Web Speech API type declarations
interface SpeechRecognitionEvent extends Event {
  resultIndex: number
  results: SpeechRecognitionResultList
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string
}

interface SpeechRecognitionInterface extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEvent) => void) | null
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInterface
    webkitSpeechRecognition?: new () => SpeechRecognitionInterface
  }
}

// Accent to voice mapping for Web Speech API
const accentVoiceMap: Record<EnglishAccent, string[]> = {
  american: ['en-US', 'en_US'],
  british: ['en-GB', 'en_GB'],
}

// Text-to-Speech using Web Speech API
export class TextToSpeech {
  private synth: SpeechSynthesis | null = null
  private voices: SpeechSynthesisVoice[] = []
  private currentUtterance: SpeechSynthesisUtterance | null = null

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis
      this.loadVoices()

      // Voices might load asynchronously
      this.synth.onvoiceschanged = () => {
        this.loadVoices()
      }
    }
  }

  private loadVoices() {
    if (this.synth) {
      this.voices = this.synth.getVoices()
    }
  }

  private findVoice(accent: EnglishAccent, gender: VoiceGender = 'female'): SpeechSynthesisVoice | null {
    const preferredLangs = accentVoiceMap[accent]

    // Common voice name patterns indicating gender
    const malePatterns = ['male', 'daniel', 'james', 'david', 'tom', 'aaron', 'guy', 'oliver', 'lee', 'rishi', 'thomas', 'gordon', 'reed']
    const femalePatterns = ['female', 'samantha', 'karen', 'moira', 'fiona', 'victoria', 'kate', 'tessa', 'serena', 'susan', 'zoe', 'allison', 'ava']

    const genderPatterns = gender === 'male' ? malePatterns : femalePatterns
    const oppositePatterns = gender === 'male' ? femalePatterns : malePatterns

    // First try to find a voice matching both accent and gender
    for (const lang of preferredLangs) {
      const matchingVoices = this.voices.filter(
        (v) => v.lang.includes(lang) || v.lang.replace('-', '_').includes(lang)
      )

      // Try to find one matching the requested gender
      const genderMatch = matchingVoices.find((v) => {
        const nameLower = v.name.toLowerCase()
        return genderPatterns.some(pattern => nameLower.includes(pattern))
      })
      if (genderMatch) return genderMatch

      // If no explicit gender match, avoid opposite gender
      const neutralVoice = matchingVoices.find((v) => {
        const nameLower = v.name.toLowerCase()
        return !oppositePatterns.some(pattern => nameLower.includes(pattern))
      })
      if (neutralVoice) return neutralVoice

      // Last resort: any voice with matching accent
      if (matchingVoices.length > 0) return matchingVoices[0]
    }

    // Fallback to any English voice with matching gender
    const englishVoices = this.voices.filter((v) => v.lang.startsWith('en'))
    const genderMatch = englishVoices.find((v) => {
      const nameLower = v.name.toLowerCase()
      return genderPatterns.some(pattern => nameLower.includes(pattern))
    })
    if (genderMatch) return genderMatch

    return englishVoices[0] || null
  }

  async speak(text: string, accent: EnglishAccent = 'american', speed: number = 1.0, gender: VoiceGender = 'female'): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      // Cancel any ongoing speech
      this.stop()

      const utterance = new SpeechSynthesisUtterance(text)
      const voice = this.findVoice(accent, gender)

      if (voice) {
        utterance.voice = voice
      }

      utterance.rate = speed
      utterance.pitch = 1.0
      utterance.volume = 1.0

      utterance.onend = () => {
        this.currentUtterance = null
        resolve()
      }

      utterance.onerror = (event) => {
        this.currentUtterance = null
        reject(new Error(`Speech synthesis error: ${event.error}`))
      }

      this.currentUtterance = utterance
      this.synth.speak(utterance)
    })
  }

  stop(): void {
    if (this.synth) {
      this.synth.cancel()
      this.currentUtterance = null
    }
  }

  isSpeaking(): boolean {
    return this.synth?.speaking || false
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.voices.filter((v) => v.lang.startsWith('en'))
  }
}

// OpenAI Text-to-Speech for natural-sounding voices
export class OpenAITextToSpeech {
  private currentAudio: HTMLAudioElement | null = null
  private isSpeakingFlag = false
  private currentAudioUrl: string | null = null

  async speak(text: string, accent: EnglishAccent = 'american', speed: number = 1.0, gender: VoiceGender = 'female'): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        // Stop any current speech
        this.stop()

        // Pre-create audio element for faster playback start
        this.currentAudio = new Audio()
        this.currentAudio.preload = 'auto'
        this.isSpeakingFlag = true

        // Fetch audio from our API (now streaming)
        const response = await fetch('/api/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text, gender, accent, speed }),
        })

        if (!response.ok) {
          this.isSpeakingFlag = false
          const error = await response.json()
          throw new Error(error.error || 'Failed to generate speech')
        }

        // Read the streamed response and create blob
        const audioBlob = await response.blob()
        this.currentAudioUrl = URL.createObjectURL(audioBlob)

        // Set up audio element
        this.currentAudio.src = this.currentAudioUrl

        this.currentAudio.onended = () => {
          this.cleanup()
          resolve()
        }

        this.currentAudio.onerror = (event) => {
          this.cleanup()
          reject(new Error(`Audio playback error: ${event}`))
        }

        // Start playing as soon as enough data is buffered
        this.currentAudio.oncanplay = () => {
          this.currentAudio?.play().catch((err) => {
            this.cleanup()
            reject(err)
          })
        }

        // Fallback: try to play immediately if oncanplay doesn't fire
        this.currentAudio.load()
      } catch (error) {
        this.cleanup()
        reject(error)
      }
    })
  }

  private cleanup(): void {
    this.isSpeakingFlag = false
    if (this.currentAudioUrl) {
      URL.revokeObjectURL(this.currentAudioUrl)
      this.currentAudioUrl = null
    }
    this.currentAudio = null
  }

  stop(): void {
    if (this.currentAudio) {
      this.currentAudio.pause()
      this.currentAudio.currentTime = 0
    }
    this.cleanup()
  }

  isSpeaking(): boolean {
    return this.isSpeakingFlag
  }
}

// Speech-to-Text using Web Speech API with silence detection
export class SpeechToText {
  private recognition: SpeechRecognitionInterface | null = null
  private isListening = false
  private onResultCallback: ((transcript: string, isFinal: boolean) => void) | null = null
  private onErrorCallback: ((error: string) => void) | null = null
  private onSilenceCallback: (() => void) | null = null
  private silenceTimeout: ReturnType<typeof setTimeout> | null = null
  private silenceDelay = 2000 // 2 seconds of silence before auto-send
  private hasSpoken = false
  private accumulatedTranscript = ''

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognitionConstructor) {
        this.recognition = new SpeechRecognitionConstructor()
        this.setupRecognition()
      }
    }
  }

  private clearSilenceTimeout(): void {
    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout)
      this.silenceTimeout = null
    }
  }

  private startSilenceTimeout(): void {
    this.clearSilenceTimeout()

    // Only start silence detection if user has actually spoken something
    if (this.hasSpoken && this.accumulatedTranscript.trim()) {
      this.silenceTimeout = setTimeout(() => {
        // User has been silent for silenceDelay ms after speaking
        if (this.onSilenceCallback && this.accumulatedTranscript.trim()) {
          this.onSilenceCallback()
        }
      }, this.silenceDelay)
    }
  }

  private setupRecognition(): void {
    if (!this.recognition) return

    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.lang = 'en-US'

    this.recognition.onresult = (event) => {
      let interimTranscript = ''
      let finalTranscript = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript
        } else {
          interimTranscript += transcript
        }
      }

      // Reset silence timer whenever we get speech
      this.clearSilenceTimeout()

      if (this.onResultCallback) {
        if (finalTranscript) {
          this.hasSpoken = true
          this.accumulatedTranscript += finalTranscript
          this.onResultCallback(this.accumulatedTranscript, true)
          // Start silence detection after final result
          this.startSilenceTimeout()
        } else if (interimTranscript) {
          this.hasSpoken = true
          // Show accumulated + current interim
          this.onResultCallback(this.accumulatedTranscript + interimTranscript, false)
        }
      }
    }

    this.recognition.onerror = (event) => {
      this.clearSilenceTimeout()
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error)
      }
    }

    this.recognition.onend = () => {
      this.clearSilenceTimeout()
      this.isListening = false
    }
  }

  start(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (error: string) => void,
    lang?: string,
    onSilence?: () => void,
    silenceDelayMs?: number
  ): boolean {
    if (!this.recognition) {
      onError?.('Speech recognition not supported in this browser')
      return false
    }

    if (this.isListening) {
      return true
    }

    if (lang) {
      this.recognition.lang = lang
    }

    // Reset state for new session
    this.hasSpoken = false
    this.accumulatedTranscript = ''
    this.clearSilenceTimeout()

    if (silenceDelayMs) {
      this.silenceDelay = silenceDelayMs
    }

    this.onResultCallback = onResult
    this.onErrorCallback = onError || null
    this.onSilenceCallback = onSilence || null

    try {
      this.recognition.start()
      this.isListening = true
      return true
    } catch (error) {
      onError?.('Failed to start speech recognition')
      return false
    }
  }

  stop(): void {
    this.clearSilenceTimeout()
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  getTranscript(): string {
    return this.accumulatedTranscript
  }

  isActive(): boolean {
    return this.isListening
  }

  isSupported(): boolean {
    return this.recognition !== null
  }
}

// Singleton instances
let openaiTtsInstance: OpenAITextToSpeech | null = null
let webTtsInstance: TextToSpeech | null = null
let sttInstance: SpeechToText | null = null

// Get OpenAI TTS (natural voices) - preferred
export function getOpenAITextToSpeech(): OpenAITextToSpeech {
  if (!openaiTtsInstance) {
    openaiTtsInstance = new OpenAITextToSpeech()
  }
  return openaiTtsInstance
}

// Get Web Speech API TTS (fallback)
export function getTextToSpeech(): TextToSpeech {
  if (!webTtsInstance) {
    webTtsInstance = new TextToSpeech()
  }
  return webTtsInstance
}

export function getSpeechToText(): SpeechToText {
  if (!sttInstance) {
    sttInstance = new SpeechToText()
  }
  return sttInstance
}
