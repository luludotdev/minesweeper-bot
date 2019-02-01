const log = require('fancylog')
const dotenv = require('dotenv')
const exitHook = require('async-exit-hook')
const { Client } = require('discord.js')

// Load Environment Variables
dotenv.load()
const { TOKEN } = process.env

// Create the Bot Client
const client = new Client()
client.login(TOKEN)
  .catch(log.error)

// Boring Handlers
client.on('ready', () => log.info(`Connected to Discord as ${client.user.tag}`))
client.on('error', err => log.error(err))

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
