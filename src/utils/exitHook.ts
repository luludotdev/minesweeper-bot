type AsyncExitHook = () => void
type ExitHook = (exit: AsyncExitHook, error?: Error) => void | Promise<void>

const hooks: Set<ExitHook> = new Set()

export const exitHook = (hook: ExitHook) => {
  hooks.add(hook)
}

let terminating = false
const cleanup = async (error?: Error, code?: number) => {
  if (terminating === true) return
  terminating = true

  const jobs = [...hooks].map(
    async h =>
      new Promise(resolve => {
        void h(resolve, error)
      })
  )

  await Promise.all(jobs)
  process.exit(code !== undefined ? code : error !== undefined ? 1 : 0)
}

export const shutdown = (code?: number) => {
  void cleanup(undefined, code)
}

process.on('SIGHUP', async () => cleanup())
process.on('SIGINT', async () => cleanup())
process.on('SIGTERM', async () => cleanup())
process.on('SIGBREAK', async () => cleanup())

process.on('uncaughtException', async err => cleanup(err))
process.on('unhandledRejection', async err => {
  await (err instanceof Error
    ? cleanup(err)
    : cleanup(new Error('Unknown rejection')))
})
