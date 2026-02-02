// Voice utilities for Text-to-Speech and Speech-to-Text
// Uses Web Speech API as primary, with OpenAI as fallback

import { EnglishAccent } from '@/types'

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
  australian: ['en-AU', 'en_AU'],
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

  private findVoice(accent: EnglishAccent): SpeechSynthesisVoice | null {
    const preferredLangs = accentVoiceMap[accent]

    for (const lang of preferredLangs) {
      const voice = this.voices.find(
        (v) => v.lang.includes(lang) || v.lang.replace('-', '_').includes(lang)
      )
      if (voice) return voice
    }

    // Fallback to any English voice
    return this.voices.find((v) => v.lang.startsWith('en')) || null
  }

  async speak(text: string, accent: EnglishAccent = 'american', speed: number = 1.0): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synth) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      // Cancel any ongoing speech
      this.stop()

      const utterance = new SpeechSynthesisUtterance(text)
      const voice = this.findVoice(accent)

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

// Speech-to-Text using Web Speech API
export class SpeechToText {
  private recognition: SpeechRecognitionInterface | null = null
  private isListening = false
  private onResultCallback: ((transcript: string, isFinal: boolean) => void) | null = null
  private onErrorCallback: ((error: string) => void) | null = null

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognitionConstructor) {
        this.recognition = new SpeechRecognitionConstructor()
        this.setupRecognition()
      }
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

      if (this.onResultCallback) {
        if (finalTranscript) {
          this.onResultCallback(finalTranscript, true)
        } else if (interimTranscript) {
          this.onResultCallback(interimTranscript, false)
        }
      }
    }

    this.recognition.onerror = (event) => {
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error)
      }
    }

    this.recognition.onend = () => {
      this.isListening = false
    }
  }

  start(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (error: string) => void
  ): boolean {
    if (!this.recognition) {
      onError?.('Speech recognition not supported in this browser')
      return false
    }

    if (this.isListening) {
      return true
    }

    this.onResultCallback = onResult
    this.onErrorCallback = onError || null

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
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  isActive(): boolean {
    return this.isListening
  }

  isSupported(): boolean {
    return this.recognition !== null
  }
}

// Singleton instances
let ttsInstance: TextToSpeech | null = null
let sttInstance: SpeechToText | null = null

export function getTextToSpeech(): TextToSpeech {
  if (!ttsInstance) {
    ttsInstance = new TextToSpeech()
  }
  return ttsInstance
}

export function getSpeechToText(): SpeechToText {
  if (!sttInstance) {
    sttInstance = new SpeechToText()
  }
  return sttInstance
}
