# Changelog

All notable restructure changes are documented here. This is a snapshot of the
"showcase-ready" cleanup pass — no business-logic changes.

## Restructure pass

### Added
- `src/lib/services/deepgram.ts` — server-side wrapper for speech-to-text.
- `src/lib/services/mistral.ts` — server-side wrapper for the LLM call,
  including a small system prompt to keep replies conversational.
- `src/lib/services/elevenlabs.ts` — server-side wrapper for text-to-speech,
  with an optional `ELEVENLABS_VOICE_ID` env override.
- `.env.example` — documents the three required API keys and one optional one.
- `.gitignore` exception (`!.env.example`) so the example file is committed.
- `DOCS/REPO_OVERVIEW.md` — high-level overview and request-flow diagram.
- `DOCS/CHANGELOG.md` — this file.

### Changed
- `src/app/api/{transcribe,mistral,text-to-speech}/route.ts` — slimmed down to
  thin wrappers over the new service modules. Added input validation
  (returns `400` when the request body is missing required fields).
- `src/app/page.tsx` — replaced the placeholder UI with a proper conversation
  view (transcript bubbles, "thinking" indicator, error display). Audio URL
  is now revoked on the `onended` event instead of immediately, so playback
  isn't cut off in some browsers.
- `src/components/VoiceRecorder.tsx` — added explicit `idle / recording /
  transcribing / error` states, mic permission error handling, a `disabled`
  prop, and stops the underlying `MediaStream` tracks on stop (releases the
  mic indicator in the browser tab).
- `src/app/layout.tsx` — replaced default "Create Next App" metadata with
  real title and description.

### Removed
- `@google-cloud/speech` dependency (it was listed in `package.json` but
  never imported anywhere in the source).
- Verbose request-body `console.log` in the Mistral route.

### Not changed (intentionally)
- Public API shape of the three routes (`POST /api/transcribe`,
  `/api/mistral`, `/api/text-to-speech`) — same request and response
  contracts as before.
- Frameworks, models, or external providers.
