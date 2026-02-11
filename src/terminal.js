import { createInterface } from 'node:readline'

export function startTerminal(ava) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  console.log('Ava - powered by Claude (type exit to quit)')

  function prompt() {
    rl.question('you: ', async (input) => {
      const trimmed = input.trim()
      if (!trimmed || ['exit', 'quit', 'bye'].includes(trimmed.toLowerCase())) {
        console.log('Goodbye!')
        rl.close()
        return
      }

      const stream = ava.chatStream(trimmed)

      process.stdout.write('ava: ')
      stream.on('text', (text) => process.stdout.write(text))

      await stream.finalMessage()
      console.log()

      prompt()
    })
  }

  prompt()
}
