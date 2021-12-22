const enum Tokens {
  BOMB = 'B',
  EMPTY = ' ',
}

const enum Emoji {
  BOMB = ':bomb:',
  BLANK = '⬜',
  ONE = ':one:',
  TWO = ':two:',
  THREE = ':three:',
  FOUR = ':four:',
  FIVE = ':five:',
  SIX = ':six:',
  SEVEN = ':seven:',
  EIGHT = ':eight:',
}

export type Board = Array<Array<string | number>>

export const generate: (
  width?: number,
  height?: number,
  bombs?: number
) => Board = (width = 9, height = 9, bombs = 10) => {
  if (bombs > width * height) throw new Error('Too many bombs!')

  const board: Board = Array.from({ length: width }).map(() =>
    Array.from({ length: height }).map(() => Tokens.EMPTY)
  )

  let bombsPlaced = 0
  const rand: (u: number) => number = u => Math.floor(Math.random() * u)

  while (bombsPlaced < bombs) {
    const x = rand(width)
    const y = rand(height)

    if (board[x][y] === Tokens.EMPTY) {
      board[x][y] = Tokens.BOMB
      bombsPlaced++
    }
  }

  for (let x = 0; x < board.length; x++) {
    for (let y = 0; y < board[x].length; y++) {
      if (board[x][y] === Tokens.BOMB) continue

      const tl = (board[x - 1] ?? [])[y + 1]
      const tm = (board[x] ?? [])[y + 1]
      const tr = (board[x + 1] ?? [])[y + 1]

      const ml = (board[x - 1] ?? [])[y]
      const mr = (board[x + 1] ?? [])[y]

      const bl = (board[x - 1] ?? [])[y - 1]
      const bm = (board[x] ?? [])[y - 1]
      const br = (board[x + 1] ?? [])[y - 1]

      const around = [tl, tm, tr, ml, mr, bl, bm, br]
      const count = around.reduce((acc, curr) => {
        if (curr === Tokens.BOMB) (acc as number)++
        return acc
      }, 0)

      board[x][y] = count
    }
  }

  return board
}

export const translate: (board: Board) => string = board => {
  const lookup = [
    Emoji.BLANK,
    Emoji.ONE,
    Emoji.TWO,
    Emoji.THREE,
    Emoji.FOUR,
    Emoji.FIVE,
    Emoji.SIX,
    Emoji.SEVEN,
    Emoji.EIGHT,
  ]

  return board
    .map(x => {
      const row = x
        .map(y => {
          if (y === Tokens.BOMB) return Emoji.BOMB
          return lookup[y as number]
        })
        .join('||||')

      return `||${row}||`
    })
    .join('\n')
}

export const minesweeper: (
  width?: number,
  height?: number,
  bombs?: number
) => string = (width = 9, height = 9, bombs = 10) => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const board = generate(width, height, bombs)
    const text = translate(board)

    if (text.length > 2000) continue
    else return text
  }
}
