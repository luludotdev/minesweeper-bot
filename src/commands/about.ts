import { Message, MessageEmbed, TextChannel } from 'discord.js'
import { PREFIX } from '~env'

export const aboutEmbed = () => {
  const commands = [
    `\`${PREFIX}minesweeper\` Generate an *easy* Minesweeper board`,
    '',
    `\`${PREFIX}minesweeper easy\` Generate an *easy* Minesweeper board`,
    `\`${PREFIX}minesweeper normal\` Generate a normal Minesweeper board`,
    `\`${PREFIX}minesweeper hard\` Generate a **hard** Minesweeper board`,
    '',
    `\`${PREFIX}minesweeper invite\` Generate a bot invite URL`,
    `\`${PREFIX}minesweeper about\` Show this message`,
  ]
    .map(x => (x === '' ? '' : `• ${x}`))
    .join('\n')

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

export const about = async (_: Message, channel: TextChannel) => {
  void channel.startTyping()

  try {
    await channel.send({ embed: aboutEmbed() })
  } finally {
    channel.stopTyping()
  }
}
