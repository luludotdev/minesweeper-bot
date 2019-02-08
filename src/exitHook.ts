type Callback = () => void
type Hook = (callback: Callback) => void

const hooks: Set<Hook> = new Set()
const timeout = 10 * 1000

export const exitHook: (hook: Hook) => void = hook => {
  hooks.add(hook)

  if (hooks.size === 1) {
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

const hookEvent: (event: ExitEvent, code?: number) => void = (event, code) => {
  process.on(event as NodeJS.Signals, () => runHooks(code))
}

const runHooks: (code?: number) => void = code => {
  setTimeout(() => {
    process.exit(code)
  }, timeout)

  for (const hook of hooks) {
    hook(() => {
      hooks.delete(hook)
      checkHooks(code)
    })
  }
}

const checkHooks: (code?: number) => void = code => {
  if (hooks.size !== 0) return undefined
  else return process.exit(code)
}
