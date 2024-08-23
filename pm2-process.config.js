// eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/no-require-imports
const { configDotenv } = require('dotenv')

configDotenv()

const name = process.env.PM2_NAME ?? 'satolep-monit'
const instances = process.env.PM2_INSTANCES ?? 1
const listenTimeout = process.env.PM2_LISTEN_TIMEOUT ?? 10000
const restartDelay = process.env.PM2_RESTART_DELAY ?? 10000

export const apps = [
  {
    name,
    script: 'dist/main.js',
    instances,
    interpreter: '/bin/bash',
    exec_mode: 'fork',
    'listen-timeout': listenTimeout,
    restart_delay: Number(restartDelay),
    exp_backoff_restart_delay: 100,
    cwd: './'
  }
]
