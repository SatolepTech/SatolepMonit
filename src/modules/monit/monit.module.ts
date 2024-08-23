import { Module } from '@nestjs/common'

import { MonitController } from './monit.controller'
import { MonitCron } from './monit.cron'
import { MonitService } from './monit.service'
import { GetCPUStatusUseCase } from './use-case/get-cpu-status.use-case'
import { GetDiskStatusUseCase } from './use-case/get-disk-status.use-case'
import { GetRAMStatusUseCase } from './use-case/get-ram-status.use-case'

const useCases = [
  GetCPUStatusUseCase,
  GetDiskStatusUseCase,
  GetRAMStatusUseCase
]

@Module({
  controllers: [MonitController],
  providers: [MonitService, ...useCases]
})
export class MonitModule {}
