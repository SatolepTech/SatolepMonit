import { Injectable } from '@nestjs/common'

import { GetCPUStatusUseCase } from './use-case/get-cpu-status.use-case'
import { GetDiskStatusUseCase } from './use-case/get-disk-status.use-case'
import { GetRAMStatusUseCase } from './use-case/get-ram-status.use-case'

import { env } from 'src/config/env'
import { ServerStatus } from 'src/domain/monit'

@Injectable()
export class MonitService {
  constructor(
    private readonly getCPUStatusUseCase: GetCPUStatusUseCase,
    private readonly getDiskStatusUseCase: GetDiskStatusUseCase,
    private readonly getRAMStatusUseCase: GetRAMStatusUseCase
  ) {}

  async getServerStatus(): Promise<ServerStatus> {
    const [envData, cpuStatus, diskStatus, ramStatus] =
      await Promise.all([
        env(),
        this.getCPUStatusUseCase.execute(),
        this.getDiskStatusUseCase.execute(),
        this.getRAMStatusUseCase.execute()
      ])

    return {
      server: {
        ip: envData.server.ip,
        name: envData.server.name,
        slug: envData.server.slug
      },
      status: {
        cpu: Number(cpuStatus.averageUsage.toFixed(2)),
        disk: Number(diskStatus.availablePercentage.toFixed(2)),
        ram: Number(ramStatus.usedMemPercentage.toFixed(2))
      }
    }
  }
}
