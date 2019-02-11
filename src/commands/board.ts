import { Message, TextChannel } from 'discord.js'
import { minesweeper } from '../utils/minesweeper'

type Difficulty = 'easy' | 'normal' | 'hard'

interface IDifficulty {
  width: number
  height: number
  bombs: number
}

const getDifficulty = (diff: Difficulty): IDifficulty => {
  switch (diff) {
    case 'easy':
      return { width: 9, height: 9, bombs: 10 }
    case 'normal':
      return { width: 12, height: 12, bombs: 20 }
    case 'hard':
      return { width: 14, height: 14, bombs: 35 }
  }
}

export const board = async (
  message: Message,
  channel: TextChannel,
  diff: Difficulty
) => {
  channel.startTyping()

  // Calculate Difficulty Values
  const difficulty: number[] = Object.values(getDifficulty(diff))

  // Generate Board
  const boardStr = minesweeper(...difficulty)
  await channel.send(boardStr)
  return channel.stopTyping()
}
