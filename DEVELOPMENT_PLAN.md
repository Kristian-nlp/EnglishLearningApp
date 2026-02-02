# English Learning App - Development Plan

## Project Overview

A conversational English learning web app for German speakers (A1-C1 levels) where users speak and the app responds with voice and text. The app focuses on natural conversation practice with adaptive difficulty.

---

## Phase 1: Core Infrastructure

### 1.1 Project Setup
- [ ] Initialize React/Next.js project with TypeScript
- [ ] Set up Tailwind CSS for styling (plain, white UI)
- [ ] Configure ESLint and Prettier
- [ ] Set up testing framework (Jest + React Testing Library)
- [ ] Initialize database (PostgreSQL/Supabase for user progress)

### 1.2 Authentication & User Management
- [ ] Implement user registration/login system
- [ ] Create user profile storage
- [ ] Build session persistence (users can return and continue)
- [ ] Store user progress and learning history

### 1.3 Voice Integration
- [ ] Integrate OpenAI Voice API (or alternative TTS)
- [ ] Implement speech-to-text for user input
- [ ] Add adjustable speaking speed control
- [ ] Support multiple English accents (British, American, Australian, etc.)

---

## Phase 2: Conversation Engine

### 2.1 AI Conversation Core
- [ ] Set up LLM integration (OpenAI API)
- [ ] Create system prompt based on behavioral guidelines
- [ ] Implement conversation state management
- [ ] Build turn-based speaking rule logic

### 2.2 Conversation Behavior Rules
Implement the following behaviors:

#### Language Mix
- Primarily English responses
- German explanations only when necessary
- Format: "difficult word (German translation)"
- Example: "This word means a habit (Gewohnheit)."

#### Turn-Based Speaking Rule
Each prompt to the user must contain ONLY:
- The question or sentence to respond to
- A short instruction ("Please answer", "Please answer in one or two sentences", etc.)

**NO** explanations, corrections, fun facts, or vocabulary lists in speaking prompts.

#### Prompt Variety Types
- Open questions
- Yes/no questions (followed by "Why" or "Can you explain")
- Complete the sentence tasks
- Choose one option and explain why
- Describe a situation
- React to a short statement
- Tell a memory
- Compare two things

### 2.3 Feedback System
After user answers:
1. Short, warm feedback
2. Gentle correction of important mistakes:
   - Provide correct version
   - Short explanation in simple English
   - Very short German clarification if needed
3. Ask to repeat corrected version (if useful)

### 2.4 Vocabulary Introduction
- Track conversation context
- Suggest 2-4 useful English words/phrases periodically
- Connect new words to current topic
- Include German meanings in brackets for difficult words
- Encourage use of new words in next answer

### 2.5 Fun Facts System
- Occasionally share short, topic-relevant fun facts
- Keep facts simple and memorable
- Not after every answer - only periodically

---

## Phase 3: Topic System

### 3.1 Topic Management
- [ ] Create 10 predefined conversation topics
- [ ] Allow user-selected custom topics
- [ ] Build topic-specific vocabulary databases
- [ ] Implement topic switching during sessions

### 3.2 Suggested Topics (Examples)
1. Daily Routines
2. Hobbies & Free Time
3. Travel & Holidays
4. Food & Cooking
5. Work & Career
6. Family & Relationships
7. Health & Fitness
8. Entertainment (Movies, Music, Books)
9. Current Events & News
10. Dreams & Future Plans

---

## Phase 4: Adaptive Difficulty System

### 4.1 Difficulty Levels (A1-C1)
- [ ] Define criteria for each CEFR level
- [ ] Create level-appropriate vocabulary pools
- [ ] Adjust sentence complexity per level
- [ ] Implement level selection at session start

### 4.2 Real-Time Adaptation
Continuous learner assessment:

**If learner seems confident:**
- Ask slightly more complex questions
- Use slightly longer sentences
- Add a little richer vocabulary

**If learner struggles:**
- Simplify language
- Slow down
- Use more concrete examples
- Add short German explanations where needed
- Give smaller, easier tasks
- Reassure the learner

---

## Phase 5: Learning Progress & Analytics

### 5.1 Progress Tracking
- [ ] Track difficult phrases per user
- [ ] Store new words learned
- [ ] Record areas needing focus
- [ ] Log session history and duration

### 5.2 Smart Suggestions
- [ ] Analyze user's previous difficulties
- [ ] Suggest topics to revisit
- [ ] Recommend vocabulary for review
- [ ] Provide personalized practice recommendations

### 5.3 Progress Dashboard
- [ ] Display learned vocabulary
- [ ] Show difficult phrases to review
- [ ] Track improvement over time
- [ ] Visualize session statistics

---

## Phase 6: User Interface

### 6.1 Design Principles
- Plain, white, minimalist design
- All text in English (easy writing style)
- Clear, intuitive navigation
- Accessibility considerations

### 6.2 Core UI Components
- [ ] Start button (prominent on landing)
- [ ] Topic selection screen
- [ ] Difficulty level selector
- [ ] Speed adjustment control
- [ ] Accent selection dropdown
- [ ] Conversation interface with text display
- [ ] Session end controls ("I am done", "That is enough for today")

### 6.3 Conversation UI
- [ ] Real-time speech-to-text display
- [ ] AI response text display
- [ ] Visual speaking indicator
- [ ] Microphone control
- [ ] Pause/resume functionality

---

## Phase 7: Correction & Pronunciation

### 7.1 Grammar Correction
- [ ] Detect grammatical errors in user speech
- [ ] Provide gentle corrections
- [ ] Track recurring errors for focused practice

### 7.2 Pronunciation Feedback (If Possible)
- [ ] Implement pronunciation analysis
- [ ] Provide pronunciation tips
- [ ] Track pronunciation improvements

---

## Phase 8: Emotional Tone Guidelines

### 8.1 AI Personality Configuration
The AI should be:
- Warm, friendly, and respectful
- Adult tone (not overly chatty or childish)
- Psychologically safe (mistakes are normal and welcome)
- Encouraging with authentic feedback
  - "That is a nice way to say it."
  - "Good sentence."

### 8.2 Session Flow
- Keep conversation flowing naturally
- Follow up after each answer (unless user ends session)
- Use short, clear prompts
- Invite full sentence responses

---

## Technical Architecture

### Frontend
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **State Management**: Zustand or React Context
- **Audio**: Web Audio API + MediaRecorder API

### Backend
- **API**: Next.js API Routes or separate Node.js server
- **AI**: OpenAI GPT-4 API
- **Voice**: OpenAI TTS API or ElevenLabs
- **Speech-to-Text**: OpenAI Whisper or Web Speech API
- **Database**: PostgreSQL with Prisma ORM

### Infrastructure
- **Hosting**: Vercel or AWS
- **Database**: Supabase or PlanetScale
- **Authentication**: NextAuth.js or Clerk

---

## Development Milestones

| Milestone | Description | Priority |
|-----------|-------------|----------|
| M1 | Basic UI + Start button | High |
| M2 | Voice input/output working | High |
| M3 | Basic conversation with AI | High |
| M4 | Topic selection | High |
| M5 | User authentication | Medium |
| M6 | Progress persistence | Medium |
| M7 | Adaptive difficulty | Medium |
| M8 | Vocabulary tracking | Medium |
| M9 | Grammar correction | Medium |
| M10 | Analytics dashboard | Low |
| M11 | Multiple accents | Low |
| M12 | Pronunciation feedback | Low |

---

## Ethics & Safety Considerations

- User data privacy and GDPR compliance
- Secure storage of conversation data
- Clear terms of service for AI interactions
- Age-appropriate content filtering
- Transparent AI usage disclosure

---

## Success Metrics

- User engagement (session duration, return rate)
- Vocabulary retention rate
- User progression through difficulty levels
- Error reduction over time
- User satisfaction surveys
