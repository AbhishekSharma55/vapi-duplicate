# Repo Overview

## What this project does

A minimal clone of [Vapi.ai](https://vapi.ai) — a platform for building voice AI
agents. The user presses a microphone button in the browser and has a spoken
conversation with an LLM. Each turn flows through three external services:

1. **Deepgram** transcribes the recorded audio to text (speech-to-text).
2. **Mistral AI** generates a reply from the transcript (LLM).
3. **ElevenLabs** synthesizes the reply back into speech (text-to-speech).

The audio is played back in the browser, completing the loop. The whole thing
runs as a single Next.js app — the browser handles mic capture and playback,
and the backend (Next.js API routes) holds the API keys and proxies to each
provider.

## Tech stack

- **Framework:** Next.js 15 (App Router) + React 19
- **Styling:** Tailwind CSS v4
- **Language:** TypeScript
- **Speech-to-text:** Deepgram (`@deepgram/sdk`, `nova-3` model)
- **LLM:** Mistral AI (`mistral-tiny`, via `axios`)
- **Text-to-speech:** ElevenLabs (`eleven_multilingual_v2`)
- **Browser APIs:** `MediaRecorder`, `getUserMedia`, `Audio`

## Main directories

| Path                               | Responsibility                                      |
| ---------------------------------- | --------------------------------------------------- |
| `src/app/`                         | Next.js App Router pages and layout                 |
| `src/app/page.tsx`                 | Main UI — conversation transcript + record button   |
| `src/app/api/transcribe/`          | POST endpoint that calls Deepgram                   |
| `src/app/api/mistral/`             | POST endpoint that calls Mistral                    |
| `src/app/api/text-to-speech/`      | POST endpoint that calls ElevenLabs                 |
| `src/components/VoiceRecorder.tsx` | Client component that records mic audio             |
| `src/lib/services/`                | Server-side wrappers for each provider              |
| `public/`                          | Static assets (icons, default Next.js SVGs)         |

## How to run it

```bash
# 1. Install dependencies
npm install

# 2. Configure secrets
cp .env.example .env.local
# then fill DEEPGRAM_API_KEY, MISTRAL_API_KEY, ELEVENLABS_API_KEY

# 3. Run dev server
npm run dev
# open http://localhost:3000

# Production
npm run build
npm start
```

## Request flow

```
Browser                Next.js server               External APIs
───────                ──────────────               ─────────────
mic ──record──▶ Blob
              │
              └─POST /api/transcribe ──▶ deepgram.ts ──▶ Deepgram
                                                │
                                          { transcript }
              ◀─────────────────────────────────┘
              │
              └─POST /api/mistral ────▶ mistral.ts ────▶ Mistral
                                                │
                                            { reply }
              ◀─────────────────────────────────┘
              │
              └─POST /api/text-to-speech ─▶ elevenlabs.ts ──▶ ElevenLabs
                                                │
                                            audio/mpeg
              ◀─────────────────────────────────┘
              │
            <audio> ──play──▶ 🔊
```

## Known issues / TODOs

- **No streaming.** Each turn is a synchronous round-trip — speak, wait, hear
  the reply. Real Vapi uses streaming STT and TTS for sub-second latency.
- **No conversation memory.** Each Mistral call is a fresh prompt; the model
  doesn't see prior turns. To add memory, pass the full `turns` array as
  `messages` from `page.tsx` through to `getMistralReply`.
- **No barge-in / interruption.** The user can't talk over the assistant.
- **No turn detection.** The user has to manually press stop.
- **`audio/wav` mimetype is a lie** — `MediaRecorder` actually emits WebM/Opus
  in most browsers. Deepgram is forgiving enough to handle it, but the
  declared mimetype should be inferred from `MediaRecorder.mimeType`.
- **No tests** and no CI.
