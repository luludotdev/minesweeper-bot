import {
  Client,
  Collection,
  MessageEmbed,
  PermissionResolvable,
  Snowflake,
  TextChannel,
  User,
} from 'discord.js'
import * as dotenv from 'dotenv'
import * as log from 'fancylog'
import { createServer } from 'http'
import { exitHook } from './utils/exitHook'
import { minesweeper } from './utils/minesweeper'

// Load Environment Variables
dotenv.load()
const { TOKEN, PREFIX, PORT } = process.env
const prefix = PREFIX || '!'

// Create the Bot Client
const client = new Client()
client.login(TOKEN).catch(log.error)

// Required Permissions
const PERMISSIONS: PermissionResolvable[] = [
  'SEND_MESSAGES',
  'READ_MESSAGE_HISTORY',
]

const about = () => {
  const commands = [
    `\`${prefix}minesweeper\` Generate a Minesweeper board`,
    `\`${prefix}minesweeper invite\` Generate a bot invite URL`,
    `\`${prefix}minesweeper about\` Show this message`,
  ].join('\n')

  // Send About Text
  const embed = new MessageEmbed()
    .setColor('#afa5fd')
    .setAuthor('lolPants#0001', 'https://b.catgirlsare.sexy/fFXa.gif')
    .setThumbnail('https://b.catgirlsare.sexy/koRa.png')
    .setDescription('Play minesweeper from within Discord!')
    .addField('Created By', '`lolPants#0001`')
    .addField('GitHub', 'https://github.com/lolPants/minesweeper-bot')
    .addField('Commands', commands)

  return embed
}

// Create the stats server
const server = createServer(async (req, res) => {
  if (req.url !== '/stats') {
    res.writeHead(404)
    res.write('Not Found')
    return res.end()
  }

  const application = await client.fetchApplication()
  const invite = await client.generateInvite(PERMISSIONS)

  const data = {
    application: {
      owner: application.owner && application.owner.tag,
      public: application.botPublic,
    },
    clientID: application.id,
    guilds: client.guilds.size,
    invite,
    uptime: client.uptime,
    username: client.user && client.user.tag,
    users: client.users.size,
  }

  res.write(JSON.stringify(data))
  res.write('\n')
  return res.end()
})

// Boring Handlers
client.on('error', err => log.error(err))
client.on('ready', () => {
  log.info(`Connected to Discord as ${client.user && client.user.tag}`)

  const port = PORT || 3000
  server.listen(port, () =>
    log.info(`Statistics server running on port ${port}`)
  )
})

// Message Handler
client.on('message', async message => {
  if (message.author.bot) return undefined
  if (!message.content.startsWith(prefix)) return undefined

  // Check we have perms to send messages
  const channel: TextChannel = message.channel as TextChannel
  const perms = channel.permissionsFor(client.user as User)
  if (perms && !perms.has('SEND_MESSAGES')) return undefined

  type Command = 'minesweeper' | 'minesweeper invite' | 'minesweeper about'

  const command = message.content.replace(prefix, '') as Command
  if (command === 'minesweeper') {
    channel.startTyping()

    // Generate Board
    const board = minesweeper()
    await channel.send(board)
    return channel.stopTyping()
  } else if (command === 'minesweeper invite') {
    channel.startTyping()

    // Send invite link
    const invite = await client.generateInvite(PERMISSIONS)
    await channel.send(`<${invite}>`)
    return channel.stopTyping()
  } else if (command === 'minesweeper about') {
    channel.startTyping()

    await channel.send({ embed: about() })
    return channel.stopTyping()
  } else {
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
  ch.send({ embed: about() })
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
