import { Injectable } from '@nestjs/common'

import * as os from 'os'

@Injectable()
export class GetRAMStatusUseCase {
  async execute(): Promise<{
    freeMem: number
    totalMem: number
    uptime: number
    usedMem: number
    usedMemPercentage: number
  }> {
    const totalMem = os.totalmem()
    const freeMem = os.freemem()
    const usedMem = totalMem - freeMem

    return {
      freeMem,
      totalMem,
      uptime: os.uptime(),
      usedMem,
      usedMemPercentage: (usedMem / totalMem) * 100
    }
  }
}
