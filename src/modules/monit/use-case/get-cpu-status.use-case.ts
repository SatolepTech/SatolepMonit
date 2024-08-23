import { Injectable } from '@nestjs/common'

import * as os from 'os'

@Injectable()
export class GetCPUStatusUseCase {
  async execute(): Promise<{
    averageUsage: number
    averages: number[]
  }> {
    const cpus = os.cpus()
    let totalUsed = 0

    const cpusAverage = cpus.map(cpu => {
      const { user, nice, sys, idle, irq } = cpu.times
      const total = user + nice + sys + idle + irq
      const used = 100 - Math.round((idle / total) * 100)
      totalUsed += used
      return used
    })

    return {
      averageUsage: totalUsed / cpus.length,
      averages: cpusAverage
    }
  }
}
