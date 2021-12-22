import { SlashCommandBuilder } from '@discordjs/builders'
import { REST } from '@discordjs/rest'
// eslint-disable-next-line node/file-extension-in-import
import { Routes } from 'discord-api-types/v9'
import dotenv from 'dotenv'
import { env } from 'node:process'

dotenv.config()
const { REST_TOKEN, CLIENT_ID, DEBUG_GUILD } = env

const minesweeperCommand = new SlashCommandBuilder()
  .setName(DEBUG_GUILD ? 'testsweeper' : 'minesweeper')
  .setDescription('Generate a minesweeper board.')
  .addStringOption(option =>
    option
      .setName('difficulty')
      .setDescription('Board Difficulty')
      .setRequired(true)
      .addChoice('easy', 'easy')
      .addChoice('normal', 'normal')
      .addChoice('hard', 'hard')
  )

const rest = new REST({ version: '9' }).setToken(REST_TOKEN)
if (DEBUG_GUILD) {
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, DEBUG_GUILD), {
    body: [minesweeperCommand.toJSON()],
  })
} else {
  await rest.put(Routes.applicationCommands(CLIENT_ID), {
    body: [minesweeperCommand.toJSON()],
  })
}
