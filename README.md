# Ava

A personal assistant powered by Claude.

## Setup

```
pnpm install
```

Copy `.env.example` or create `.env` with your Anthropic API key:

```
ANTHROPIC_API_KEY=your-key-here
```

## Usage

```
pnpm start
```

This starts the terminal REPL. Type messages to chat with Ava, and type `exit`, `quit`, or `bye` to stop.

## Telegram

To add Telegram as a second interface:

1. Message [@BotFather](https://t.me/BotFather) on Telegram to create a bot and get a token
2. Add the token to `.env`:
   ```
   TELEGRAM_BOT_TOKEN=your-token-here
   TELEGRAM_CHAT_ID=your-chat-id
   ```
   To find your chat ID, send a message to the bot and visit `https://api.telegram.org/bot<token>/getUpdates` — look for `chat.id` in the response.
3. Run `pnpm start` — both terminal and Telegram will be active simultaneously

## Architecture

```
index.js            Entry point — creates shared Ava instance, starts adapters
src/core.js         Ava class — Anthropic client, conversation history, chat methods
src/terminal.js     Terminal adapter — readline REPL with streaming output
src/telegram.js     Telegram adapter — grammy bot, responds to text messages
```

All adapters share a single `Ava` instance with one conversation history. A conversation started in terminal continues on Telegram and vice versa.

### Commands

| Command | Description |
|---------|-------------|
| `/code` | Switch to Claude Code mode (uses default cwd) |
| `/code <path>` | Switch to Claude Code mode with a specific working directory |
| `/chat` | Switch back to normal chat mode |
| `/mode` | Show current mode and working directory |

Commands work from both terminal and Telegram.

### Code mode

In code mode, messages are sent to Claude Code (`claude -p`) running on your local machine, with full file and tool access. This lets you do coding tasks from Telegram (or terminal) — reading files, running commands, editing code, etc.

Allowed working directories:
- `C:/Users/bburns/Dropbox/@Projects/@Current` (default)
- `C:/Users/bburns/Workspace`

On Telegram, code mode is restricted to the authorized `TELEGRAM_CHAT_ID`.

### Cross-adapter echo

Messages from other adapters are echoed in real time. On terminal, Telegram messages appear as:

```
[telegram] you: hello
[telegram] ava: Hi there!
```

And terminal messages are forwarded to the Telegram chat (requires `TELEGRAM_CHAT_ID` in `.env`).

### Core API

- `ava.chat(message, source)` — returns the full response as a string (used by Telegram)
- `ava.chatStream(message, source)` — returns a stream for real-time output (used by terminal)

Ava extends `EventEmitter` and emits `userMessage` and `assistantMessage` events with `{ text, source }` so adapters can echo cross-adapter activity.
