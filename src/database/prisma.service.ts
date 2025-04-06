import { Global, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient, Prisma } from '@prisma/client';

@Global()
@Injectable()
export class PrismaService
  extends PrismaClient<Prisma.PrismaClientOptions, 'query' | 'log' | 'error'>
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: ['query', 'error'],
    });

    this.$on('query', (event) => {
      // console.log(`SQL Query: ${event.query}`);
      // console.log(`Params: ${event.params}`);
      // console.log(`Duration: ${event.duration}ms`);
    });

    this.$on('error', (event) => {
      console.error(`Prisma Error: ${event.message}`);
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
