import * as dotenv from 'dotenv'

// Load Environment Variables
dotenv.load()
const { TOKEN: token, PREFIX, PORT } = process.env

if (token === undefined) throw new Error('Bot Token must be set!')
const TOKEN = token
export { TOKEN }

const prefix = PREFIX || '!'
export { prefix as PREFIX }

const getPort = (defaultPort: number) => {
  if (PORT === undefined) return defaultPort

  const parsed = parseInt(PORT, 10)
  if (Number.isNaN(parsed)) return 3000

  if (parsed < 1000) return defaultPort
  else return parsed
}

const port = getPort(3000)
export { port as PORT }
