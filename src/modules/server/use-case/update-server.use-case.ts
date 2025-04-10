import { Injectable } from '@nestjs/common'

import { UpdateServerArgs } from '../args/update-server.args'

import { logError } from 'src/common/log-error'
import { ServerDTO } from 'src/domain/server'
import { PrismaService } from 'src/modules/_infra/prisma/prisma.service'

@Injectable()
export class UpdateServerUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(
    args: UpdateServerArgs
  ): Promise<SuccessDto<ServerDTO>> {
    try {
      const data = await this.prisma.server.update({
        data: {
          errors: args.errors
        },
        include: {
          Route: true
        },
        where: {
          id: args.id
        }
      })

      const isUpdated = data.errors === args.errors

      return {
        data,
        error: null,
        success: isUpdated
      }
    } catch (error) {
      logError({
        archive: __filename,
        error,
        usedFunction: 'execute'
      })

      return {
        data: null,
        error: null,
        success: false
      }
    }
  }
}
