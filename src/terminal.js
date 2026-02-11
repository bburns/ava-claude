import { createInterface } from 'node:readline'

export function startTerminal(ava) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  console.log('Ava - powered by Claude (type exit to quit)')

  ava.on('userMessage', ({ text, source }) => {
    if (source === 'terminal') return
    process.stdout.clearLine(0)
    process.stdout.cursorTo(0)
    console.log(`[${source}] you: ${text}`)
    rl.prompt(true)
  })

  ava.on('assistantMessage', ({ text, source }) => {
    if (source === 'terminal') return
    process.stdout.clearLine(0)
    process.stdout.cursorTo(0)
    console.log(`[${source}] ava: ${text}`)
    rl.prompt(true)
  })

  function prompt() {
    rl.question('you: ', async (input) => {
      const trimmed = input.trim()
      if (!trimmed || ['exit', 'quit', 'bye'].includes(trimmed.toLowerCase())) {
        console.log('Goodbye!')
        rl.close()
        return
      }

      const stream = ava.chatStream(trimmed, 'terminal')

      process.stdout.write('ava: ')
      stream.on('text', (text) => process.stdout.write(text))

      await stream.finalMessage()
      console.log()

      prompt()
    })
  }

  prompt()
}
