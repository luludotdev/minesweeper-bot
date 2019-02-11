type Callback = () => void
type Hook = (callback: Callback) => void

const hooks: Set<Hook> = new Set()
const timeout = 10 * 1000

let running = false

export const exitHook: (hook: Hook) => void = hook => {
  hooks.add(hook)

  if (hooks.size === 1) {
    hookErrorEvent('uncaughtException')
    hookErrorEvent('unhandledRejection')

    hookEvent('exit')
    hookEvent('beforeExit', 0)
    hookEvent('SIGHUP', 128 + 1)
    hookEvent('SIGINT', 128 + 2)
    hookEvent('SIGTERM', 128 + 15)
    hookEvent('SIGBREAK', 128 + 21)
  }
}

type ExitEvent =
  | 'exit'
  | 'beforeExit'
  | 'SIGHUP'
  | 'SIGINT'
  | 'SIGTERM'
  | 'SIGBREAK'

type ExitErrorEvent = 'uncaughtException' | 'unhandledRejection'

const hookEvent: (event: ExitEvent, code?: number, error?: Error) => void = (
  event,
  code,
  error
) => {
  process.on(event as NodeJS.Signals, (c: unknown) => {
    if (event === 'exit') runHooks(c as number, error)
    else runHooks(code, error)
  })
}

const hookErrorEvent: (event: ExitErrorEvent) => void = event => {
  process.on(event as NodeJS.Signals, (e: unknown) => {
    const error: Error | undefined = e as Error
    runHooks(1, error)
  })
}

const runHooks: (code?: number, error?: Error) => void = (code, error) => {
  if (running) return undefined
  running = true

  setTimeout(() => {
    printError(error)
    process.exit(code)
  }, timeout)

  for (const hook of hooks) {
    hook(() => {
      hooks.delete(hook)
      checkHooks(code, error)
    })
  }
}

const printError: (error?: Error) => void = error => {
  if (!error) return undefined

  process.stderr.write(error.stack || '')
}

const checkHooks: (code?: number, error?: Error) => void = (code, error) => {
  if (hooks.size !== 0) return undefined

  printError(error)
  return process.exit(code)
}
