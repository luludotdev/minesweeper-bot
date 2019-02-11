import {
  Client,
  Collection,
  PermissionResolvable,
  TextChannel,
  User,
} from 'discord.js'
import * as log from 'fancylog'
import { about, aboutEmbed, board, invite } from './commands'
import { PORT, PREFIX, TOKEN } from './environment'
import { exitHook } from './utils/exitHook'
import { server } from './utils/stats'

// Create the Bot Client
export const client = new Client()
client.login(TOKEN).catch(log.error)

// Required Permissions
export const PERMISSIONS: PermissionResolvable[] = [
  'SEND_MESSAGES',
  'READ_MESSAGE_HISTORY',
]

// Boring Handlers
client.on('error', err => log.error(err))
client.on('ready', () => {
  log.info(`Connected to Discord as ${client.user && client.user.tag}`)

  server.listen(PORT, () =>
    log.info(`Statistics server running on port ${PORT}`)
  )
})

// Message Handler
client.on('message', async message => {
  if (message.author.bot) return undefined
  if (!message.content.startsWith(PREFIX)) return undefined

  // Check we have perms to send messages
  const channel: TextChannel = message.channel as TextChannel
  const perms = channel.permissionsFor(client.user as User)
  if (perms && !perms.has('SEND_MESSAGES')) return undefined

  // Handle Commands
  const command = message.content
    .replace(`${PREFIX}minesweeper `, '')
    .replace(`${PREFIX}minesweeper`, 'default')
    .toLowerCase()

  switch (command) {
    case 'about':
      return about(message, channel)
    case 'invite':
      return invite(message, channel)
    case 'easy':
      return board(message, channel, 'easy')
    case 'normal':
      return board(message, channel, 'normal')
    case 'hard':
      return board(message, channel, 'hard')
    case 'default':
      return board(message, channel, 'easy')
    default:
      return undefined
  }
})

client.on('guildCreate', guild => {
  const clientUser = client.user
  if (clientUser === null) return undefined

  const findChannel: () => TextChannel = () => {
    if (guild.systemChannel) {
      const perms = guild.systemChannel.permissionsFor(clientUser)
      if (perms !== null && perms.has('SEND_MESSAGES')) {
        return guild.systemChannel
      }
    }

    const channels = guild.channels.filter(
      channel => channel.type === 'text'
    ) as Collection<string, TextChannel>

    const filtered = channels.filter(x => {
      const perms = x.permissionsFor(clientUser)
      if (perms === null) return false
      else return perms.has('SEND_MESSAGES')
    })

    return channels.find(x => x.name === 'general') || filtered.first()
  }

  const ch = findChannel()
  ch.send({ embed: aboutEmbed() })
})

// Handle SIGTERM and SIGINT signals properly
exitHook(async exit => {
  // Check if logged in
  if (client.readyAt !== null) {
    try {
      log.info('Disconnecting!')
      await client.destroy()
      exit()
    } catch (err) {
      exit()
    }
  } else {
    exit()
  }
})
