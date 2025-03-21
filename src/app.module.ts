import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { HomeModule } from './home/home.module';
import { MailModule } from './mail/mail.module';
import { MyConfigModule } from './config/config.module';

@Module({
  imports: [
    MyConfigModule,
    AuthModule,
    AdminModule,
    UsersModule,
    DatabaseModule,
    HomeModule,
    MailModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [MyConfigModule],
})
export class AppModule {}
