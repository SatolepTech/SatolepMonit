import { Injectable } from '@nestjs/common'

import { UpdateServerArgs } from './args/update-server.args'
import { UpdateServersArgs } from './args/update-servers.args'
import { GetServersUseCase } from './use-case/get-servers.use-case'
import { UpdateServerUseCase } from './use-case/update-server.use-case'
import { UpdateServersUseCase } from './use-case/update-servers.use-case'

@Injectable()
export class ServerService {
  constructor(
    private readonly getServersUseCase: GetServersUseCase,
    private readonly updateServersUseCase: UpdateServersUseCase,
    private readonly updateServerUseCase: UpdateServerUseCase
  ) {}

  async getServers(): Promise<
    SuccessDto<
      {
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
      }[]
    >
  > {
    return await this.getServersUseCase.execute()
  }

  async updateServer(args: UpdateServerArgs): Promise<
    SuccessDto<{
      id: number
      errors: number
      ip: string
      name: string
      slug: string
      token: string
      url: string
    }>
  > {
    return await this.updateServerUseCase.execute(args)
  }

  async updateServers(args: UpdateServersArgs): Promise<SuccessDto> {
    return await this.updateServersUseCase.execute(args)
  }
}
