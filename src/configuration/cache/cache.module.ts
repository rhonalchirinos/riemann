import { Global, Module } from '@nestjs/common';

import { CacheModule } from '@nestjs/cache-manager';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: () => ({
        store: 'memory',
        isGlobal: true,
        ttl: 1000 * 60 * 60, // 1 hour
        max: 100, // Maximum number of items in cache
      }),
      inject: [],
    }),
  ],
  exports: [CacheModule],
})
export class CustomCacheModule {}
