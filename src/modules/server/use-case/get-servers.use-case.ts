import { Injectable } from '@nestjs/common'

import { PrismaService } from 'src/modules/_infra/prisma/prisma.service'

@Injectable()
export class GetServersUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(): Promise<
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
