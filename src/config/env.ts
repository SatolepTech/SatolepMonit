import { ConfigModule } from '@nestjs/config'

export async function env() {
  await ConfigModule.envVariablesLoaded

  return {
    alertValue: {
      danger: Number(process.env.ALERT_VALUE_DANGER || 90),
      warning: Number(process.env.ALERT_VALUE_WARNING || 70)
    },
    api: {
      port: Number(process.env.API_PORT || 4000)
    },
    discord: {
      panicErrorsUsers: process.env
        .DISCORD_PANIC_ERROR_USERS as string,
      title: process.env.DISCORD_TITLE as string,
      username: process.env.DISCORD_USERNAME as string,
      webhook: process.env.DISCORD_WEBHOOK as string
    },
    mainDiskFilesystem: process.env.MAIN_DISK_FILESYSTEM as string,
    monitURLs: process.env.MONIT_URLS as string,
    nodeEnv: process.env.NODE_ENV as string,
    server: {
      ip: process.env.SERVER_IP as string,
      name: process.env.SERVER_NAME as string,
      slug: process.env.SERVER_SLUG as string
    }
  }
}
