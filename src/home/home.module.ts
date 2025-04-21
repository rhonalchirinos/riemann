import { Module } from '@nestjs/common';
import { HomeController } from './infrastructure/controller/home.controller';

@Module({
  controllers: [HomeController],
})
export class HomeModule {}
