import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ScheduleModule } from '@nestjs/schedule'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { PrismaModule } from './modules/_infra/prisma/prisma.module'
import { MonitModule } from './modules/monit/monit.module'

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true
    }),
    MonitModule,
    PrismaModule,
    ScheduleModule.forRoot(),
  ],
  providers: [AppService]
})
export class AppModule {}
