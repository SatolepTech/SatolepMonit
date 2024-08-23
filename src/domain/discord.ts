export type DiscordSendMessageParams = {
  description?: string
  field: { name: string; value: string }
  footer?: string
  title: string
  type?: keyof typeof DiscordWebhookPayloadType
}

export enum DiscordWebhookPayloadType {
  Alert = 'Alert',
  Danger = 'Danger',
  Disable = 'Disable',
  Info = 'Info',
  Success = 'Success'
}

export type DiscordWebhookField = {
  name: string
  value: string
  inline?: boolean
}

export type DiscordWebhookEmbed = {
  author?: {
    name?: string
    url?: string
    icon_url?: string
  }
  title?: string
  url?: string
  thumbnail?: {
    url?: string
  }
  image?: {
    url?: string
  }
  timestamp?: Date
  color?: number
  description?: string
  fields: DiscordWebhookField[]
  footer?: {
    text: string
    icon_url?: string
  }
}

export type DiscordWebhookPayload = {
  embeds: DiscordWebhookEmbed[]
}
