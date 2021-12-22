type Difficulty = 'easy' | 'normal' | 'hard'
type DifficultyTuple = readonly [width: number, height: number, bombs: number]

// @ts-expect-error Type Assert Fn
export const isDifficulty: (diff: string) => diff is Difficulty = diff => {
  if (diff === 'easy') return true
  if (diff === 'normal') return true
  if (diff === 'hard') return true

  return false
}

export const getDifficulty = (diff: Difficulty): DifficultyTuple => {
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
