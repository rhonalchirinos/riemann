import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '@auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './users/users.module';
import { CustomDatabaseModule } from './configuration/database/database.module';
import { HomeModule } from './home/home.module';
import { CustomMailModule } from './configuration/mail/mail.module';
import { CustomConfigModule } from './configuration/config/config.module';
import { EnterpriseModule } from './enterprise/enterprise.module';
import { ProfileModule } from './profile/profile.module';
import { CustomCacheModule } from './configuration/cache/cache.module';
import { CustomJwtModule } from './configuration/jwt/jwt.module';

@Module({
  imports: [
    CustomDatabaseModule,
    CustomJwtModule,
    CustomCacheModule,
    CustomConfigModule,
    CustomMailModule,
    AuthModule,
    ProfileModule,
    EnterpriseModule,
    AdminModule,
    UsersModule,
    HomeModule,
    EnterpriseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [CustomConfigModule, CustomCacheModule],
})
export class AppModule {}
