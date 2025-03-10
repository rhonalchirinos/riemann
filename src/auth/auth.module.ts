import { Module } from '@nestjs/common';
import { AuthController } from '@auth/infrastructure/controllers/auth.controller';
import { SignupUsecase } from '@auth/application/usecases/signup.usecase';
import {
  PG_USER_REPOSITORY,
  UserRepository,
} from '@auth/infrastructure/database/user.repository';
import {
  AccessTokenRepository,
  PG_ACCESS_TOKEN_REPOSITORY,
} from '@auth/infrastructure/database/access.token.repository';
import { DatabaseModule } from 'src/database/database.module';
import { SignupValidation } from '@auth/infrastructure/controllers/dtos/signup.validations';
import { EncryptionService } from '@auth/application/services/encryption.service';
import { JwtStrategy } from '@auth/infrastructure/guards/jwt.strategy';
import { LoginUseCase } from '@auth/application/usecases/login.usecase';

import { JwtModule } from '@nestjs/jwt';
import { ProfileUsecase } from './application/usecases/profile.usecase';
import { CacheModule } from '@nestjs/cache-manager';
import {
  CACHE_ACCESS_TOKEN_REPOSITORY,
  CacheAccessTokenRepository,
} from '@auth/infrastructure/database/cache.access.token.repository';

@Module({
  imports: [
    DatabaseModule,
    CacheModule.register(),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'FynVfpT19fKeEvCS',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: PG_USER_REPOSITORY,
      useClass: UserRepository,
    },
    {
      provide: PG_ACCESS_TOKEN_REPOSITORY,
      useClass: AccessTokenRepository,
    },
    {
      provide: CACHE_ACCESS_TOKEN_REPOSITORY,
      useClass: CacheAccessTokenRepository,
    },
    SignupValidation,
    SignupUsecase,
    LoginUseCase,
    ProfileUsecase,
    EncryptionService,
    JwtStrategy,
  ],
})
export class AuthModule {}
