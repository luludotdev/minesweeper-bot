import { Message, MessageEmbed, TextChannel } from 'discord.js'
import { PREFIX } from '../environment'

export const aboutEmbed = () => {
  const commands = [
    `\`${PREFIX}minesweeper\` Generate a Minesweeper board`,
    `\`${PREFIX}minesweeper invite\` Generate a bot invite URL`,
    `\`${PREFIX}minesweeper about\` Show this message`,
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

export const about = async (message: Message, channel: TextChannel) => {
  channel.startTyping()

  await channel.send({ embed: aboutEmbed() })
  return channel.stopTyping()
}