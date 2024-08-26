import { Cron, CronExpression } from '@nestjs/schedule'

import { DiscordMessageBuilder } from '../_infra/discord-webhook/discord-message.builder'

import { logError } from 'src/common/log-error'
import { env } from 'src/config/env'
import { DiscordWebhookPayloadType } from 'src/domain/discord'
import { MonitResponse } from 'src/domain/monit'

export class MonitCron {
  @Cron(CronExpression.EVERY_30_MINUTES)
  async serverStatusCron() {
    const envData = await env()
    if (!envData.monitURLs) return

    let type = DiscordWebhookPayloadType.Info

    const [dangerIcon, okIcon, warningIcon] = [
      ':x:',
      ':white_check_mark:',
      ':warning:'
    ]

    const dangerValue = envData.alertValue.danger
    const warningValue = envData.alertValue.warning

    const dangers: string[] = []
    const notGetData: string[] = []
    const values: string[] = []

    const urls = envData.monitURLs.split(';')

    for (let index = 0; index < urls.length; index++) {
      let icon = okIcon
      const url = urls[index]

      try {
        const response = await fetch(url)
        const data: MonitResponse = await response.json()

        if (!data || !data.success) {
          notGetData.push(`* ${url}!`)
          continue
        }

        const {
          serverStatus: { server, status }
        } = data

        const cpu = status.cpu
        const disk = status.disk
        const ram = status.ram

        if (
          cpu > warningValue ||
          disk > warningValue ||
          ram > warningValue
        ) {
          icon = warningIcon
          type = DiscordWebhookPayloadType.Alert
        }

        if (
          cpu > dangerValue ||
          disk > dangerValue ||
          ram > dangerValue
        ) {
          dangers.push(
            `* ${server.name}: ${server.ip}, ${server.slug}`
          )
          icon = dangerIcon
          type = DiscordWebhookPayloadType.Danger
        }

        values.push(
          `* ${
            icon
          } ${server.name} - CPU: ${status.cpu}% Disco: ${status.disk}% RAM: ${status.ram}%`
        )
      } catch (error) {
        notGetData.push(`* ${url}`)
        logError({
          archive: 'src/modules/monit/monit.cron.ts',
          error,
          usedFunction: 'serverStatusCron'
        })
      }
    }

    if (dangers.length > 0) {
      dangers.unshift(
        `Atenção ${envData.discord.panicErrorsUsers}, os seguintes servidores excederam a margem de uso recomendada:`
      )
    }

    if (notGetData.length > 0) {
      notGetData.unshift(
        `Atenção ${envData.discord.panicErrorsUsers}, não foi possível recuperar os dados das seguintes URLs:`
      )
    }

    const dangersMessage =
      dangers.length > 0 ? '\n\n' + dangers.join('\n') : ''

    const notGetDataMessage =
      notGetData.length > 0 ? '\n\n' + notGetData.join('\n') : ''

    const discord = new DiscordMessageBuilder()

    const splitArray = []
    const subarrayLength = 5

    for (let i = 0; i < values.length; i += subarrayLength) {
      const subarray = values.slice(i, i + subarrayLength)
      splitArray.push(subarray)
    }

    for (let index = 0; index < splitArray.length; index++) {
      const array = splitArray[index]
      await discord.sendMessage({
        field: {
          name: `Status - Parte ${index + 1} / ${splitArray.length}:`,
          value: array.join('\n')
        },
        title: envData.discord.title,
        type
      })
    }

    if (dangersMessage) {
      await discord.sendMessage({
        field: {
          name: 'Uso alto de recursos:',
          value: dangersMessage
        },
        title: envData.discord.title,
        type
      })
    }

    if (notGetDataMessage) {
      discord.sendMessage({
        field: {
          name: 'Não foi possível recuperar informações:',
          value: notGetDataMessage
        },
        title: envData.discord.title,
        type
      })
    }
  }
}
