export type ServerStatus = {
  server: {
    ip: string
    name: string
    slug: string
  }
  status: {
    cpu: number
    disk: number
    ram: number
  }
}

export type MonitResponse = {
  serverStatus: ServerStatus
  success: boolean
}
