# Voice AI Assistant — Vapi-style demo

A minimal clone of [Vapi.ai](https://vapi.ai) (a platform for building voice AI
agents). Press the mic, speak, and have a back-and-forth conversation with an
LLM — entirely in the browser.

## What this project does

- 🎙 Records mic audio in the browser via `MediaRecorder`.
- ✍️ Sends it to **Deepgram** (`nova-3`) for speech-to-text.
- 🤖 Feeds the transcript to **Mistral AI** (`mistral-tiny`) for a reply.
- 🔊 Sends the reply to **ElevenLabs** (`eleven_multilingual_v2`) and plays
  the synthesized voice back to the user.
- 💬 Renders the running transcript in a chat-style UI.

It's deliberately small — the goal is to show, end to end, what a voice agent
pipeline looks like, with API keys safely held server-side via Next.js API
routes.

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **Deepgram** for speech-to-text
- **Mistral AI** for the LLM
- **ElevenLabs** for text-to-speech

## Quickstart

### 1. Prerequisites

- Node.js 18.18+ (Node 20 LTS recommended)
- API keys for [Deepgram](https://console.deepgram.com/),
  [Mistral](https://console.mistral.ai/), and
  [ElevenLabs](https://elevenlabs.io/app/settings/api-keys) — each has a free
  tier sufficient for a demo
- A browser with mic access (and `https://` or `localhost`)

### 2. Install & configure

```bash
npm install
cp .env.example .env.local
# then edit .env.local and fill in your three API keys
```

### 3. Run it

```bash
npm run dev
# open http://localhost:3000
```

For a production build:

```bash
npm run build
npm start
```

## Usage

1. Open http://localhost:3000.
2. Click the microphone button — your browser will ask for mic permission.
3. Say something ("What's the weather like on Mars?").
4. Click stop. Within a second or two you'll see your transcribed text, the
   model's reply, and hear the reply spoken back.
5. Repeat — each turn is independent (no conversation memory yet, see
   [`DOCS/REPO_OVERVIEW.md`](DOCS/REPO_OVERVIEW.md#known-issues--todos)).

### API endpoints (if you want to hit them directly)

```bash
# Speech-to-text — multipart form with an `audio` blob
curl -X POST http://localhost:3000/api/transcribe \
  -F "audio=@sample.wav"

# LLM reply — JSON
curl -X POST http://localhost:3000/api/mistral \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello, who are you?"}'

# Text-to-speech — returns audio/mpeg
curl -X POST http://localhost:3000/api/text-to-speech \
  -H "Content-Type: application/json" \
  -d '{"text":"Hi there"}' --output reply.mp3
```

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          Browser (client)                        │
│                                                                  │
│   VoiceRecorder ──▶ MediaRecorder ──▶ Blob                       │
│                                        │                         │
│                                        ▼                         │
│        page.tsx orchestrates: transcribe → mistral → tts → play  │
└────────────────────────────┬─────────────────────────────────────┘
                             │ fetch (multipart / JSON)
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│                       Next.js API routes                         │
│                                                                  │
│  /api/transcribe  ─▶  lib/services/deepgram.ts   ─▶  Deepgram    │
│  /api/mistral     ─▶  lib/services/mistral.ts    ─▶  Mistral     │
│  /api/text-to-speech ▶ lib/services/elevenlabs.ts ─▶ ElevenLabs  │
└──────────────────────────────────────────────────────────────────┘
```

API keys live in environment variables, read only on the server side. The
browser never sees them.

## Project structure

```
src/
├── app/
│   ├── api/
│   │   ├── transcribe/route.ts       # Deepgram STT endpoint
│   │   ├── mistral/route.ts          # Mistral LLM endpoint
│   │   └── text-to-speech/route.ts   # ElevenLabs TTS endpoint
│   ├── layout.tsx
│   ├── page.tsx                      # Main conversation UI
│   └── globals.css
├── components/
│   └── VoiceRecorder.tsx             # Mic record button + states
└── lib/
    └── services/                     # Provider client wrappers
        ├── deepgram.ts
        ├── mistral.ts
        └── elevenlabs.ts
```

## Further reading

- [`DOCS/REPO_OVERVIEW.md`](DOCS/REPO_OVERVIEW.md) — deeper dive, request flow,
  and known issues.
- [`DOCS/CHANGELOG.md`](DOCS/CHANGELOG.md) — what changed in the cleanup pass.
