import 'source-map-support/register'

import { Client, User } from 'discord.js'
import { about, board, invite } from '~commands'
import { PREFIX, TOKEN } from '~env'
import { exitHook } from '~utils/exitHook'
import signale, { panic } from '~utils/signale'

export const client = new Client()
client.on('error', err => signale.error(err))
client.on('ready', () => {
  const tag = client.user?.tag ?? 'Unknown#0000'
  signale.info(`Connected to Discord as ${tag}`)
})

client.on('message', async message => {
  if (message.author.bot) return
  if (message.content.startsWith(PREFIX) === false) return

  if (message.channel.type === 'news') return
  const canSend =
    message.channel.type === 'dm'
      ? true
      : message.channel
          .permissionsFor(client.user as User)
          ?.has('SEND_MESSAGES') ?? false

  if (canSend === false) return
  const command = message.content
    .replace(`${PREFIX}minesweeper `, '')
    .replace(`${PREFIX}minesweeper`, 'default')
    .toLowerCase()

  switch (command) {
    case 'about':
      return about(message, message.channel)
    case 'invite':
      return invite(message, message.channel)
    case 'easy':
      return board(message, message.channel, 'easy')
    case 'normal':
      return board(message, message.channel, 'normal')
    case 'hard':
      return board(message, message.channel, 'hard')
    case 'default':
      return board(message, message.channel, 'easy')
    default:
      break
  }
})

client.login(TOKEN).catch(error => panic(error))
exitHook(async exit => {
  signale.pending('Shutting down...')
  client.destroy()

  signale.success('Goodbye <3')
  exit()
})
