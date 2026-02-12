import { EventEmitter } from 'node:events'
import { spawn } from 'node:child_process'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = 'You are Ava, a helpful personal assistant. Be concise and friendly.'
const MODEL = 'claude-sonnet-4-5-20250929'
const MAX_TOKENS = 1024

const DEFAULT_CWD = 'C:/Users/bburns/Dropbox/@Projects/@Current'
const ALLOWED_DIRS = [
  'C:/Users/bburns/Dropbox/@Projects/@Current',
  'C:/Users/bburns/Workspace',
]

export default class Ava extends EventEmitter {
  constructor() {
    super()
    this.client = new Anthropic()
    this.messages = []
    this.mode = 'chat'
    this.cwd = DEFAULT_CWD
  }

  handleCommand(text) {
    const trimmed = text.trim()

    if (trimmed === '/chat') {
      this.mode = 'chat'
      return 'Switched to chat mode'
    }

    if (trimmed === '/code' || trimmed.startsWith('/code ')) {
      const arg = trimmed.slice(5).trim()
      if (arg) {
        const normalized = arg.replace(/\\/g, '/')
        const allowed = ALLOWED_DIRS.some((dir) =>
          normalized.toLowerCase().startsWith(dir.toLowerCase()),
        )
        if (!allowed) {
          return `Directory not allowed. Allowed directories:\n${ALLOWED_DIRS.join('\n')}`
        }
        this.cwd = normalized
      }
      this.mode = 'code'
      return `Switched to code mode (cwd: ${this.cwd})`
    }

    if (trimmed === '/mode') {
      return `Current mode: ${this.mode}${this.mode === 'code' ? ` (cwd: ${this.cwd})` : ''}`
    }

    return null
  }

  async chat(userMessage, source) {
    if (this.mode === 'code') {
      return this._codeChat(userMessage, source)
    }

    this.messages.push({ role: 'user', content: userMessage })
    this.emit('userMessage', { text: userMessage, source })

    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: this.messages,
    })

    const text = response.content[0].text
    this.messages.push({ role: 'assistant', content: text })
    this.emit('assistantMessage', { text, source })
    return text
  }

  chatStream(userMessage, source) {
    if (this.mode === 'code') {
      return this._codeChatStream(userMessage, source)
    }

    this.messages.push({ role: 'user', content: userMessage })
    this.emit('userMessage', { text: userMessage, source })

    const stream = this.client.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: this.messages,
    })

    stream.finalMessage().then((message) => {
      const text = message.content[0].text
      this.messages.push({ role: 'assistant', content: text })
      this.emit('assistantMessage', { text, source })
    })

    return stream
  }

  _codeChat(userMessage, source) {
    this.emit('userMessage', { text: userMessage, source })

    return new Promise((resolve, reject) => {
      const proc = spawn('claude', ['-p', userMessage], {
        cwd: this.cwd,
        shell: true,
      })

      let output = ''
      proc.stdout.on('data', (chunk) => { output += chunk.toString() })
      proc.on('error', (err) => {
        const text = `Error: ${err.message}`
        this.emit('assistantMessage', { text, source })
        resolve(text)
      })
      proc.on('close', (code) => {
        const text = output.trim() || `(claude exited with code ${code})`
        this.emit('assistantMessage', { text, source })
        resolve(text)
      })
    })
  }

  _codeChatStream(userMessage, source) {
    this.emit('userMessage', { text: userMessage, source })

    const proc = spawn('claude', ['-p', userMessage], {
      cwd: this.cwd,
      shell: true,
    })

    const emitter = new EventEmitter()
    let fullText = ''

    proc.stdout.on('data', (chunk) => {
      const text = chunk.toString()
      fullText += text
      emitter.emit('text', text)
    })

    proc.on('error', (err) => {
      emitter.emit('text', `Error: ${err.message}`)
    })

    emitter.finalMessage = () =>
      new Promise((resolve) => {
        proc.on('close', () => {
          const text = fullText.trim()
          this.emit('assistantMessage', { text, source })
          resolve({ content: [{ text }] })
        })
      })

    return emitter
  }
}
