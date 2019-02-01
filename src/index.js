const log = require('fancylog')
const http = require('http')
const dotenv = require('dotenv')
const exitHook = require('async-exit-hook')
const { Client, MessageEmbed } = require('discord.js')
const { minesweeper } = require('./minesweeper.js')

// Load Environment Variables
dotenv.load()
const { TOKEN, PREFIX, PORT } = process.env
const prefix = PREFIX || '!'

// Create the Bot Client
const client = new Client()
client.login(TOKEN)
  .catch(log.error)

// Required Permissions
const PERMISSIONS = [
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
const server = http.createServer(async (req, res) => {
  if (req.url !== '/stats') {
    res.writeHead(404)
    res.write('Not Found')
    return res.end()
  }

  const application = await client.fetchApplication()
  const invite = await client.generateInvite(PERMISSIONS)

  const data = {
    clientID: application.id,
    username: client.user.tag,
    guilds: client.guilds.size,
    users: client.users.size,
    application: {
      owner: application.owner.tag,
      public: application.botPublic,
    },
    uptime: client.uptime,
    invite,
  }

  res.write(JSON.stringify(data))
  res.write('\n')
  return res.end()
})

// Boring Handlers
client.on('error', err => log.error(err))
client.on('ready', () => {
  log.info(`Connected to Discord as ${client.user.tag}`)

  const port = PORT || 3000
  server.listen(port, () => log.info(`Statistics server running on port ${port}`))
})

// Message Handler
client.on('message', async message => {
  if (message.author.bot) return undefined
  if (!message.content.startsWith(prefix)) return undefined

  // Check we have perms to send messages
  const perms = message.channel.permissionsFor(client.user)
  if (!perms.has('SEND_MESSAGES')) return undefined

  const command = message.content.replace(prefix, '')
  if (command === 'minesweeper') {
    message.channel.startTyping()

    // Generate Board
    const board = minesweeper()
    await message.channel.send(board)
    return message.channel.stopTyping()
  } else if (command === 'minesweeper invite') {
    message.channel.startTyping()

    // Send invite link
    const invite = await client.generateInvite(PERMISSIONS)
    await message.channel.send(`<${invite}>`)
    return message.channel.stopTyping()
  } else if (command === 'minesweeper about') {
    message.channel.startTyping()

    await message.channel.send({ embed: about() })
    return message.channel.stopTyping()
  } else {
    return undefined
  }
})

client.on('guildCreate', guild => {
  if (guild.systemChannel && guild.systemChannel.permissionsFor(client.user).has('SEND_MESSAGES')) {
    guild.systemChannel.send({ embed: about() })
  } else {
    const channel = guild.channels.find(x => x.type === 'text' && x.permissionsFor(client.user).has('SEND_MESSAGES'))
    channel.send({ embed: about() })
  }
})

// Handle SIGTERM and SIGINT signals properly
exitHook(async exit => {
  // Check if logged in
  if (client.readyAt !== null) {
    try {
      log.info('Disconnecting!')
      await client.destroy()
      exit()
    } catch (err) { exit() }
  } else { exit() }
})
