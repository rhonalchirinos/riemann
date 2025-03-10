import { Module } from '@nestjs/common';
import { HomeController } from './infrastructure/controller/home.controller';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [HomeController],
})
export class HomeModule {}
