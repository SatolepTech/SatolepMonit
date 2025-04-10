import { Injectable } from '@nestjs/common'

import { UpdateServersArgs } from '../args/update-servers.args'

import { logError } from 'src/common/log-error'
import { PrismaService } from 'src/modules/_infra/prisma/prisma.service'

@Injectable()
export class UpdateServersUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(args: UpdateServersArgs): Promise<SuccessDto> {
    try {
      const data = await this.prisma.server.updateMany({
        data: {
          errors: args.errors
        },
        where: {
          id: {
            in: args.ids
          }
        }
      })

      const isUpdated = data.count > 0

      return {
        data: null,
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
