import { Injectable } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'

import { DiscordMessageBuilder } from '../_infra/discord-webhook/discord-message.builder'
import { ServerService } from '../server/server.service'

import { formatDatetime } from 'src/common/date'
import { logError } from 'src/common/log-error'
import { client } from 'src/config/client'
import { env } from 'src/config/env'
import { DiscordWebhookPayloadType } from 'src/domain/discord'
import { MonitResponse } from 'src/domain/monit'
import {
  HealthResponse,
  ServerDTO,
  ServersStatusDTO
} from 'src/domain/server'

@Injectable()
export class MonitCron {
  constructor(private readonly serverService: ServerService) {}

  discord = new DiscordMessageBuilder()

  icon: Record<DiscordWebhookPayloadType, string> = {
    Alert: ':warning:',
    Danger: ':x:',
    Disable: ':white_check_mark:',
    Info: ':white_check_mark:',
    Success: ':white_check_mark:'
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  async serverHealthCron() {
    const envData = await env()

    const result = await this.serverService.getServers()
    if (!result || !result.success) return

    const initialServers = result.data
    const reachableServers: ServerDTO[] = []
    const unareachableServers: ServerDTO[] = []

    for (let index = 0; index < initialServers.length; index++) {
      const server = initialServers[index]

      const route = server.Route
      if (!route) continue

      try {
        const resultHealth: HealthResponse = await client({
          url: `${server.url}/${route.health}`
        })

        if (!resultHealth || !resultHealth.success) {
          unareachableServers.push(server)
          continue
        }

        reachableServers.push(server)
      } catch (error) {
        unareachableServers.push(server)
        logError({
          archive: 'src/modules/monit/monit.cron.ts',
          error,
          usedFunction: 'serverHealthCron'
        })
      }
    }

    await this.sendStatusReachableServersMessage({ reachableServers })
    await this.sendStatusUnareachableServersMessage({
      panicErrorsUsers: envData.discord.panicErrorsUsers,
      unareachableServers
    })
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async serverStatusCron() {
    const envData = await env()

    const result = await this.serverService.getServers()
    if (!result || !result.success) return

    const servers = result.data
    const dangerValue = envData.alertValue.danger
    const warningValue = envData.alertValue.warning

    const { dangers, notGetData, warning } =
      await this.getServersStatuses({
        dangerValue,
        servers,
        warningValue
      })

    const hasAlert =
      warning.length > 0 ||
      dangers.length > 0 ||
      notGetData.length > 0
    if (!hasAlert) return

    await this.discord.sendMessage({
      field: {
        name: 'Status',
        value: formatDatetime(new Date())
      },
      title: envData.discord.title || 'Servidores',
      type: DiscordWebhookPayloadType.Info
    })

    await this.sendServersWarningMessage({
      panicErrorsUsers: envData.discord.panicErrorsUsers,
      warning
    })

    await this.sendServersDangersMessage({
      dangers,
      panicErrorsUsers: envData.discord.panicErrorsUsers
    })

    await this.sendServersNotGetDataMessage({
      notGetData,
      panicErrorsUsers: envData.discord.panicErrorsUsers
    })
  }

  private async getServersStatuses({
    dangerValue,
    warningValue,
    servers
  }: {
    dangerValue: number
    servers: ServerDTO[]
    warningValue: number
  }) {
    const dangersServers: ServersStatusDTO[] = []
    const notGetDataServers: ServersStatusDTO[] = []
    const okServers: ServersStatusDTO[] = []
    const warningServers: ServersStatusDTO[] = []

    for (let index = 0; index < servers.length; index++) {
      const server = servers[index]

      const route = server.Route
      if (!route) continue

      const token = server.token
      const url = `${server.url}/${route.monit}`

      try {
        const resultMonit: MonitResponse = await client({
          searchParams: [{ token }],
          url
        })

        if (!resultMonit || !resultMonit.success) {
          notGetDataServers.push({ server })
          continue
        }

        const {
          serverStatus: { status }
        } = resultMonit

        const cpu = status.cpu
        const disk = status.disk
        const ram = status.ram

        if (
          cpu > dangerValue ||
          disk > dangerValue ||
          ram > dangerValue
        ) {
          dangersServers.push({ server, status })
          continue
        }

        if (
          cpu > warningValue ||
          disk > warningValue ||
          ram > warningValue
        ) {
          warningServers.push({ server, status })
          continue
        }

        okServers.push({ server, status })
      } catch (error) {
        notGetDataServers.push({ server })
        logError({
          archive: 'src/modules/monit/monit.cron.ts',
          error,
          usedFunction: 'serverStatusCron'
        })
      }
    }

    return {
      dangers: dangersServers,
      notGetData: notGetDataServers,
      ok: okServers,
      warning: warningServers
    }
  }

  private async sendDiscordMessages({
    serversStatus,
    title,
    type
  }: {
    serversStatus: ServersStatusDTO[]
    title: string
    type: DiscordWebhookPayloadType
  }) {
    const splitArray: ServersStatusDTO[][] = []
    const subarrayLength = 5

    for (let i = 0; i < serversStatus.length; i += subarrayLength) {
      const subarray = serversStatus.slice(i, i + subarrayLength)
      splitArray.push(subarray)
    }

    for (let index = 0; index < splitArray.length; index++) {
      const serversStatus = splitArray[index]

      const serversStatusMessage = serversStatus.map(
        serverStatus =>
          `* ${this.icon[DiscordWebhookPayloadType[type]]} ${serverStatus.server.name} (${serverStatus.server.ip}): ${
            serverStatus.status
              ? `[CPU - ${serverStatus.status.cpu}%] [Disco - ${serverStatus.status.disk}%] [RAM - ${serverStatus.status.ram}%]`
              : 'Não foi possui pegar o status'
          }`
      )

      await this.discord.sendMessage({
        field: {
          name: `Parte ${index + 1} / ${splitArray.length}:`,
          value: serversStatusMessage.join('\n')
        },
        title,
        type
      })
    }
  }

  private async sendServersDangersMessage({
    dangers,
    panicErrorsUsers
  }: {
    dangers: ServersStatusDTO[]
    panicErrorsUsers: string
  }) {
    if (dangers.length > 0) {
      await this.discord.sendMessage({
        field: {
          name: `Atenção ${panicErrorsUsers}`,
          value:
            'Os seguintes servidores excederam a margem de uso recomendada'
        },
        title: 'Urgência!',
        type: DiscordWebhookPayloadType.Danger
      })

      await this.sendDiscordMessages({
        serversStatus: dangers,
        title: 'Urgência!',
        type: DiscordWebhookPayloadType.Danger
      })
    }
  }

  private async sendServersNotGetDataMessage({
    notGetData,
    panicErrorsUsers
  }: {
    notGetData: ServersStatusDTO[]
    panicErrorsUsers: string
  }) {
    if (notGetData.length > 0) {
      await this.discord.sendMessage({
        field: {
          name: `Atenção ${panicErrorsUsers}`,
          value:
            'Não foi possível recuperar os dados das seguintes URLs'
        },
        title: 'Urgência!',
        type: DiscordWebhookPayloadType.Danger
      })

      await this.sendDiscordMessages({
        serversStatus: notGetData,
        title: 'Servidores Sem Retorno',
        type: DiscordWebhookPayloadType.Danger
      })
    }
  }

  private async sendServersWarningMessage({
    panicErrorsUsers,
    warning
  }: {
    panicErrorsUsers: string
    warning: ServersStatusDTO[]
  }) {
    if (warning.length > 0) {
      await this.discord.sendMessage({
        field: {
          name: `Atenção ${panicErrorsUsers}`,
          value:
            'Os seguintes servidores excederam a margem de uso recomendada'
        },
        title: 'Alerta!',
        type: DiscordWebhookPayloadType.Alert
      })

      await this.sendDiscordMessages({
        serversStatus: warning,
        title: 'Acima do Limite Recomendado',
        type: DiscordWebhookPayloadType.Alert
      })
    }
  }

  private async sendStatusReachableServersMessage({
    reachableServers
  }: {
    reachableServers: ServerDTO[]
  }) {
    if (reachableServers.length > 0) {
      const servers = reachableServers.filter(
        server => server.errors > 0
      )

      if (servers && servers.length > 0) {
        const serversId = servers.map(server => server.id)

        this.serverService.updateServers({
          ids: serversId,
          errors: 0
        })
      }
    }
  }

  private async sendStatusUnareachableServersMessage({
    panicErrorsUsers,
    unareachableServers
  }: {
    panicErrorsUsers: string
    unareachableServers: ServerDTO[]
  }) {
    if (unareachableServers.length > 0) {
      const servers = unareachableServers.filter(
        server => server.errors < 5
      )

      if (servers && servers.length > 0) {
        await this.discord.sendMessage({
          field: {
            name: `Atenção ${panicErrorsUsers}`,
            value: 'Servidor(es) fora do ar ou inalcançável(is)'
          },
          title: 'Urgência!',
          type: DiscordWebhookPayloadType.Danger
        })

        for (let index = 0; index < servers.length; index++) {
          const server = servers[index]

          if (server.errors < 5) {
            await this.discord.sendMessage({
              field: {
                name: server.name,
                value: `Servidor ${server.name} (${server.ip}) está fora do ar ou inalcançável`
              },
              title: 'Health Status',
              type: DiscordWebhookPayloadType.Danger
            })

            this.serverService.updateServer({
              id: server.id,
              errors: server.errors + 1
            })
          }
        }
      }
    }
  }
}
