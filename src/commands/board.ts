import { Message, TextChannel } from 'discord.js'
import { minesweeper } from '../utils/minesweeper'

type Difficulty = 'easy' | 'normal' | 'hard'
type DifficultyTuple = [width: number, height: number, bombs: number]

const getDifficulty = (diff: Difficulty): DifficultyTuple => {
  switch (diff) {
    case 'easy':
      return [9, 9, 10]
    case 'normal':
      return [12, 12, 20]
    case 'hard':
      return [14, 14, 35]
    default:
      throw new Error('Unsupported Difficulty!')
  }
}

export const board = async (
  message: Message,
  channel: TextChannel,
  diff: Difficulty
) => {
  void channel.startTyping()

  try {
    const difficulty = getDifficulty(diff)
    const boardString = minesweeper(...difficulty)

    await channel.send(boardString)
  } finally {
    channel.stopTyping()
  }
}
