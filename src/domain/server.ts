export type HealthResponse = {
  status: string
  success: boolean
  uptime: number
  uptimeFormatted: string
}

export type ServerDTO = {
  id: number
  errors: number
  ip: string
  name: string
  slug: string
  token: string
  url: string
  Route: {
    health: string
    monit: string
  }
}

export type ServersStatusDTO = {
  server: ServerDTO
  status?: {
    cpu: number
    disk: number
    ram: number
  }
}
