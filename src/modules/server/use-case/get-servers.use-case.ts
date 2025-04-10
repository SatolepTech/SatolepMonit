import { Injectable } from '@nestjs/common'

import { ServerDTO } from 'src/domain/server'
import { PrismaService } from 'src/modules/_infra/prisma/prisma.service'

@Injectable()
export class GetServersUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<SuccessDto<ServerDTO[]>> {
    const data = await this.prisma.server.findMany({
      include: {
        Route: true
      }
    })

    if (data) {
      return {
        data,
        error: null,
        success: true
      }
    }

    return {
      data: null,
      error: 'Servidores não encontrados',
      success: false
    }
  }
}
