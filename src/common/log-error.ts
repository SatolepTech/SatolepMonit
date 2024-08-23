import { env } from 'src/config/env'

type LogError = {
  archive: string
  error: unknown
  usedFunction: string
  type?: 'error' | 'warn'
}

export function logError({
  archive,
  error,
  type = 'error',
  usedFunction
}: LogError) {
  env().then(envData => {
    if (envData.nodeEnv === 'production') return

    console.groupCollapsed(`Error: ${archive}`)

    console.log('Archive: ', archive)
    console.log('Function: ', usedFunction)
    console[type]('Error: ', error)

    console.groupEnd()
  })
}
