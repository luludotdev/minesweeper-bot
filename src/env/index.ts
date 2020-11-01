import { panic } from '~utils/signale'
import { registerInt, registerString } from './register'

// #region Global
const NODE_ENV = registerString('NODE_ENV')
const IS_PROD = NODE_ENV?.toLowerCase() === 'production'
export const IS_DEV = !IS_PROD
// #endregion

// #region Application
export const TOKEN = registerString('TOKEN', true)
export const PREFIX = registerString('PREFIX') ?? '!'
export const PORT = registerInt('PORT') ?? 3000

if (PORT <= 1024) {
  panic('Cannot run with `PORT` <= 1024!')
}
// #endregion
