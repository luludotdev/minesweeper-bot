import 'source-map-support/register'

import { Client } from 'discord.js'
import { TOKEN } from '~env'
import { exitHook } from '~utils/exitHook'
import signale, { panic } from '~utils/signale'

const client = new Client()
client.on('error', err => signale.error(err))
client.on('ready', () => {
  const tag = client.user?.tag ?? 'Unknown#0000'
  signale.info(`Connected to Discord as ${tag}`)
})

client.login(TOKEN).catch(error => panic(error))
exitHook(async exit => {
  signale.pending('Shutting down...')
  client.destroy()

  signale.success('Goodbye <3')
  exit()
})
