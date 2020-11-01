import { Signale } from '@lolpants/signale'

const signale = new Signale({
  config: {
    displayDate: 'yyyy/mm/dd',
    displayTimestamp: 'hh:MM:ss',
  },
})

export default signale

export const panic = (message: string | Error, code = 1) => {
  signale.fatal(message)
  return process.exit(code)
}
