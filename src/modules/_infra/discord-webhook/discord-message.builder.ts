import { logError } from 'src/common/log-error'
import { env } from 'src/config/env'
import {
  DiscordSendMessageParams,
  DiscordWebhookEmbed,
  DiscordWebhookPayload,
  DiscordWebhookPayloadType
} from 'src/domain/discord'
import { Errors } from 'src/domain/errors'
import { SuccessResponse } from 'src/domain/response'

export class DiscordMessageBuilder {
  async sendMessage({
    description,
    footer,
    field,
    title,
    type = DiscordWebhookPayloadType.Danger
  }: DiscordSendMessageParams): Promise<SuccessResponse> {
    const envData = await env()
    if (!envData.discord.webhook) {
      return {
        message: Errors.DiscordWebhookNotProvided,
        success: false
      }
    }

    const author = envData.discord.username
      ? { author: { name: envData.discord.username } }
      : {}

    const typeColor: Record<DiscordWebhookPayloadType, number> = {
      [DiscordWebhookPayloadType.Alert]: 0xf5c451,
      [DiscordWebhookPayloadType.Danger]: 0xe84a4a,
      [DiscordWebhookPayloadType.Disable]: 0x989898,
      [DiscordWebhookPayloadType.Info]: 0x3388bb,
      [DiscordWebhookPayloadType.Success]: 0x5de8a5
    }

    const color = typeColor[type]

    const embed: DiscordWebhookEmbed = {
      ...author,
      color,
      fields: [field],
      title
    }

    if (description) {
      embed.description = description
    }

    if (footer) {
      embed.footer = {
        text: footer
      }
    }

    const payload: DiscordWebhookPayload = {
      embeds: [embed]
    }

    try {
      await fetch(envData.discord.webhook, {
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json'
        },
        method: 'POST'
      })

      return {
        success: true
      }
    } catch (error) {
      console.log(error)

      logError({
        archive:
          'src/modules/_infra/discord-webhook/discord-message.builder.ts',
        error,
        usedFunction: 'sendMessage'
      })

      return {
        message: Errors.DiscordWebhookCouldNotSend,
        success: false
      }
    }
  }
}
