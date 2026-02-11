import { Bot } from 'grammy'

export function startTelegram(ava) {
  const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN)

  ava.on('userMessage', ({ text, source }) => {
    if (source === 'telegram') return
    bot.api.sendMessage(process.env.TELEGRAM_CHAT_ID, `[${source}] you: ${text}`)
  })

  ava.on('assistantMessage', ({ text, source }) => {
    if (source === 'telegram') return
    bot.api.sendMessage(process.env.TELEGRAM_CHAT_ID, `[${source}] ava: ${text}`)
  })

  bot.on('message:text', async (ctx) => {
    const reply = await ava.chat(ctx.message.text, 'telegram')
    await ctx.reply(reply)
  })

  bot.start()
  console.log('Telegram bot started')
}
