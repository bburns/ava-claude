import 'dotenv/config'
import { createInterface } from 'node:readline'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()
const messages = []

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
})

function prompt() {
  rl.question('you: ', async (input) => {
    const trimmed = input.trim()
    if (!trimmed || ['exit', 'quit', 'bye'].includes(trimmed.toLowerCase())) {
      console.log('Goodbye!')
      rl.close()
      return
    }

    messages.push({ role: 'user', content: trimmed })

    const stream = client.messages.stream({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      system: 'You are Ava, a helpful personal assistant. Be concise and friendly.',
      messages,
    })

    process.stdout.write('ava: ')
    stream.on('text', (text) => process.stdout.write(text))

    const message = await stream.finalMessage()
    console.log()

    messages.push({ role: 'assistant', content: message.content[0].text })
    prompt()
  })
}

console.log('Ava - powered by Claude (type exit to quit)')
prompt()
