import { Message, TextChannel } from 'discord.js'
import { client, PERMISSIONS } from '..'

export const invite = async (message: Message, channel: TextChannel) => {
  channel.startTyping()

  // Send invite link
  const inviteURL = await client.generateInvite(PERMISSIONS)
  await channel.send(`<${inviteURL}>`)
  return channel.stopTyping()
}
