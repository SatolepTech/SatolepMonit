import { Module } from '@nestjs/common'

import { ServerService } from './server.service'
import { GetServersUseCase } from './use-case/get-servers.use-case'
import { UpdateServerUseCase } from './use-case/update-server.use-case'
import { UpdateServersUseCase } from './use-case/update-servers.use-case'

const useCases = [
  GetServersUseCase,
  UpdateServersUseCase,
  UpdateServerUseCase
]

@Module({
  exports: [ServerService],
  providers: [ServerService, ...useCases]
})
export class ServerModule {}
