import 'dotenv/config'
import Ava from './src/core.js'
import { startTerminal } from './src/terminal.js'

const ava = new Ava()

if (process.env.TELEGRAM_BOT_TOKEN) {
  const { startTelegram } = await import('./src/telegram.js')
  startTelegram(ava)
}

startTerminal(ava)
