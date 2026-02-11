import { EventEmitter } from 'node:events'
import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = 'You are Ava, a helpful personal assistant. Be concise and friendly.'
const MODEL = 'claude-sonnet-4-5-20250929'
const MAX_TOKENS = 1024

export default class Ava extends EventEmitter {
  constructor() {
    super()
    this.client = new Anthropic()
    this.messages = []
  }

  async chat(userMessage, source) {
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
}
