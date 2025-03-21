import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import configuration from './configuration';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      envFilePath: '.env',
      isGlobal: true,
    }),
  ],
})
export class MyConfigModule {}
