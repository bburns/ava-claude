# Ava Voice Listening — Implementation Plan

## Context

Add voice input to Ava so it can listen on a phone for the wake word "Ava", transcribe commands with offline speech-to-text, send them to the Ava backend, and speak the response. This uses the existing adapter pattern (like terminal and telegram).

**Stack**: React Native (Expo) app + Porcupine (wake word) + Vosk (offline STT) + WebSocket adapter on the backend.

## Architecture

```
Phone (React Native)                    PC (Node.js)
┌─────────────────────┐    WebSocket    ┌──────────────────┐
│ Porcupine (wake word)│───────────────▶│ src/websocket.js │
│ Vosk (STT)          │◀───────────────│   ava.chat()     │
│ expo-speech (TTS)   │                 │   event echo     │
└─────────────────────┘                 └──────────────────┘
```

## Phase 1: MVP (text flowing end-to-end)

### Step 1 — WebSocket adapter on backend

New file: `Ava/claude/src/websocket.js`

- Follows the same pattern as `telegram.js`: receives `ava` instance, listens for cross-adapter events, calls `ava.chat(text, 'voice')`
- Simple JSON protocol:
  - Client sends: `{ "text": "what time is it" }`
  - Server responds: `{ "type": "response", "text": "It's 3:15 PM." }`
  - Server echoes cross-adapter: `{ "type": "echo", "role": "user"|"assistant", "text": "...", "source": "terminal" }`
- Uses `ws` npm package
- No auth for v1 (LAN only)

### Step 2 — Wire up in index.js

- Gated by `VOICE_WS_PORT` env var (like Telegram is gated by `TELEGRAM_BOT_TOKEN`)
- Add `VOICE_WS_PORT=3033` to `.env`

### Step 3 — Test with wscat

- Verify messages round-trip through Ava before building the app

### Step 4 — Scaffold React Native app

New directory: `Ava/voice/` (separate from `claude/`)

```
Ava/voice/
  App.tsx
  src/
    hooks/useVosk.ts
    hooks/useWebSocket.ts
    components/TalkButton.tsx
    services/tts.ts
    config.ts
```

### Step 5 — Push-to-talk MVP app

- Single screen with a "Talk" button
- Press and hold → record audio with `expo-av`
- Release → transcribe with Vosk (offline, ~40MB English model)
- Send text over WebSocket → receive response → speak with `expo-speech`
- Phone connects to PC's LAN IP (e.g., `192.168.1.x:3033`)

**Dependencies**: `expo`, `expo-av`, `react-native-vosk`, `expo-speech`

## Phase 2: Wake Word + Polish

- Integrate Porcupine for always-on "Ava" detection (needs Picovoice access key)
- Add WebSocket auth (shared secret in handshake)
- Connection status indicator, auto-reconnect
- Visual feedback (listening indicator, waveform)

## Phase 3: Enhancements

- Continuous transcription + storage of all words heard
- Streaming responses (speak sentence-by-sentence)
- Remote access via Tailscale
- Cross-adapter notifications

## Files to Modify

| File | Change |
|------|--------|
| `Ava/claude/src/websocket.js` | **Create** — new WebSocket adapter |
| `Ava/claude/index.js` | Add WebSocket adapter startup |
| `Ava/claude/package.json` | Add `ws` dependency |
| `Ava/voice/` | **Create** — entire React Native app |

No changes to `core.js` — it already has the right API.

## Verification

1. Start Ava with `VOICE_WS_PORT=3033 pnpm start`
2. Connect with `wscat -c ws://localhost:3033` and send `{"text":"hello"}`
3. Confirm response comes back and terminal shows the cross-adapter echo
4. Build and run the Expo app on Pixel 6a, test push-to-talk flow
