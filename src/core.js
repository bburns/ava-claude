import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = 'You are Ava, a helpful personal assistant. Be concise and friendly.'
const MODEL = 'claude-sonnet-4-5-20250929'
const MAX_TOKENS = 1024

export default class Ava {
  constructor() {
    this.client = new Anthropic()
    this.messages = []
  }

  async chat(userMessage) {
    this.messages.push({ role: 'user', content: userMessage })

    const response = await this.client.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: this.messages,
    })

    const text = response.content[0].text
    this.messages.push({ role: 'assistant', content: text })
    return text
  }

  chatStream(userMessage) {
    this.messages.push({ role: 'user', content: userMessage })

    const stream = this.client.messages.stream({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages: this.messages,
    })

    stream.finalMessage().then((message) => {
      this.messages.push({ role: 'assistant', content: message.content[0].text })
    })

    return stream
  }
}
