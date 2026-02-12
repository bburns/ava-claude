import { Bot } from 'grammy'

export function startTelegram(ava) {
  const bot = new Bot(process.env.TELEGRAM_BOT_TOKEN)
  const authorizedChat = process.env.TELEGRAM_CHAT_ID

  ava.on('userMessage', ({ text, source }) => {
    if (source === 'telegram' || !authorizedChat) return
    bot.api.sendMessage(authorizedChat, `[${source}] you: ${text}`).catch(() => {})
  })

  ava.on('assistantMessage', ({ text, source }) => {
    if (source === 'telegram' || !authorizedChat) return
    bot.api.sendMessage(authorizedChat, `[${source}] ava: ${text}`).catch(() => {})
  })

  bot.on('message:text', async (ctx) => {
    if (authorizedChat && ctx.chat.id.toString() !== authorizedChat) return

    const commandResponse = ava.handleCommand(ctx.message.text)
    if (commandResponse) {
      await ctx.reply(commandResponse)
      return
    }

    const reply = await ava.chat(ctx.message.text, 'telegram')
    await ctx.reply(reply)
  })

  bot.start()
  console.log('Telegram bot started')
}
