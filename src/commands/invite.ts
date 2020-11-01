import { Message, PermissionResolvable, TextChannel } from 'discord.js'
import { client } from '~'

const PERMISSIONS: PermissionResolvable[] = [
  'SEND_MESSAGES',
  'READ_MESSAGE_HISTORY',
]

export const invite = async (message: Message, channel: TextChannel) => {
  void channel.startTyping()

  try {
    const inviteURL = await client.generateInvite(PERMISSIONS)
    await channel.send(`<${String(inviteURL)}>`)
  } finally {
    channel.stopTyping()
  }
}
