import { Module } from '@nestjs/common';
import { AuthModule } from '@auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { HomeModule } from './home/home.module';

import { EnterpriseModule } from './enterprise/enterprise.module';
import { ProfileModule } from './profile/profile.module';

import * as configurations from './configuration';
import { CaptchaModule } from './captcha/captcha.module';

const modules = [
  AuthModule,
  ProfileModule,
  AdminModule,
  HomeModule,
  EnterpriseModule,
  CaptchaModule,
];

@Module({
  imports: [...Object.values(configurations), ...modules],
})
export class AppModule {}
