const log = require('fancylog')
const dotenv = require('dotenv')
const exitHook = require('async-exit-hook')
const { Client, MessageEmbed } = require('discord.js')
const { minesweeper } = require('./minesweeper.js')

// Load Environment Variables
dotenv.load()
const { TOKEN, PREFIX } = process.env
const prefix = PREFIX || '!'

// Create the Bot Client
const client = new Client()
client.login(TOKEN)
  .catch(log.error)

// Boring Handlers
client.on('ready', () => log.info(`Connected to Discord as ${client.user.tag}`))
client.on('error', err => log.error(err))

// Message Handler
client.on('message', async message => {
  if (message.author.bot) return undefined
  if (!message.content.startsWith(prefix)) return undefined

  // Check we have perms to send messages
  const perms = message.channel.permissionsFor(client.user)
  if (!perms.has('SEND_MESSAGES')) return undefined

  const command = message.content.replace(prefix, '')
  if (command === 'minesweeper') {
    // Generate Board
    const board = minesweeper()
    return message.channel.send(board)
  } else if (command === 'minesweeper invite') {
    // Send invite link
    const permissions = [
      'SEND_MESSAGES',
      'READ_MESSAGE_HISTORY',
    ]

    const invite = await client.generateInvite(permissions)
    return message.channel.send(`<${invite}>`)
  } else if (command === 'minesweeper about') {
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

    return message.channel.send({ embed })
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
