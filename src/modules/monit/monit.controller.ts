import { Controller, Get } from '@nestjs/common'

import { MonitService } from './monit.service'

import { MonitResponse } from 'src/domain/monit'

@Controller('/monit')
export class MonitController {
  constructor(private readonly monitService: MonitService) {}

  @Get('/')
  async monit(): Promise<MonitResponse> {
    const serverStatus = await this.monitService.getServerStatus()

    return {
      serverStatus,
      success: true
    }
  }
}
