import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { Settings } from 'luxon';

Settings.defaultZone = 'utc';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((err) => console.error(err));
