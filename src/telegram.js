import { Bot } from 'grammy'

export function startTelegram(ava) {
  const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN)

  bot.on('message:text', async (ctx) => {
    const reply = await ava.chat(ctx.message.text)
    await ctx.reply(reply)
  })

  bot.start()
  console.log('Telegram bot started')
}
