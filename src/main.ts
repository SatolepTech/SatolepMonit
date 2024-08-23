import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { env } from './config/env'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const envData = await env()
  await app.listen(envData.api.port)
}

bootstrap()
