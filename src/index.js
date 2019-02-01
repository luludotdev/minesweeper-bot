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

// Create the stats server
const server = http.createServer((req, res) => {
  if (req.url !== '/stats') {
    res.writeHead(404)
    res.write('Not Found')
    return res.end()
  }

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
    const permissions = [
      'SEND_MESSAGES',
      'READ_MESSAGE_HISTORY',
    ]

    const invite = await client.generateInvite(permissions)
    await message.channel.send(`<${invite}>`)
    return message.channel.stopTyping()
  } else if (command === 'minesweeper about') {
    message.channel.startTyping()

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

    await message.channel.send({ embed })
    return message.channel.stopTyping()
  } else {
    return undefined
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
