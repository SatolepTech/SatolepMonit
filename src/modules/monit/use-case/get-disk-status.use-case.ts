import { Injectable } from '@nestjs/common'

import { getDiskInfo } from 'node-disk-info'
import { env } from 'src/config/env'

@Injectable()
export class GetDiskStatusUseCase {
  async execute(): Promise<{
    available: number
    availablePercentage: number
    filesystem: string
    used: number
    total: number
  }> {
    const envData = await env()
    const mainDiskFilesystem = envData.mainDiskFilesystem
    const drives = await getDiskInfo()

    const disk = drives.find(
      drive => drive.filesystem === mainDiskFilesystem
    )

    const available = disk.available / 1024 ** 2
    const total = disk.blocks / 1024 ** 2
    const used = disk.used / 1024 ** 2

    return {
      available,
      availablePercentage: (used / total) * 100,
      filesystem: disk.filesystem,
      used,
      total
    }
  }
}
