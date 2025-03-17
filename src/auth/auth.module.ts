import { Module } from '@nestjs/common';
import { RefreshController } from '@auth/infrastructure/controllers/refresh.controller';
import { SignupUsecase } from '@auth/application/usecases/signup.usecase';
import {
  PG_USER_REPOSITORY,
  UserRepository,
} from '@auth/infrastructure/database/user.repository';
import {
  AccessTokenRepository,
  PG_ACCESS_TOKEN_REPOSITORY,
} from '@auth/infrastructure/database/access.token.repository';
import {
  CACHE_ACCESS_TOKEN_REPOSITORY,
  CacheAccessTokenRepository,
} from '@auth/infrastructure/database/cache.access.token.repository';

import { DatabaseModule } from 'src/database/database.module';
import { SignupValidation } from '@auth/infrastructure/controllers/dtos/signup.validations';
import { EncryptionService } from '@auth/application/services/encryption.service';
import { JwtStrategy } from '@auth/infrastructure/guards/jwt.strategy';
import { LoginUseCase } from '@auth/application/usecases/login.usecase';
import { JwtModule } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import { RefreshUseCase } from './application/usecases/refresh.token.usecase';
import { ProfileUsecase } from './application/usecases/profile.usecase';

import { JwtRefreshStrategy } from './infrastructure/guards/jwt-refresh.strategy';
import { ProfileController } from './infrastructure/controllers/profile.controller';
import { LoginController } from './infrastructure/controllers/login.controller';
import { SignupController } from './infrastructure/controllers/signup.controller';
import { ProfileValidation } from './infrastructure/controllers/dtos/profile.validations';
import { LoginValidation } from './infrastructure/controllers/dtos/login.validations';

@Module({
  imports: [
    DatabaseModule,
    CacheModule.register({ ttl: 60, max: 1000 }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'FynVfpT19fKeEvCS',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [
    ProfileController,
    LoginController,
    SignupController,
    RefreshController,
  ],
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

    /**
     * Validations
     */
    SignupValidation,
    LoginValidation,
    ProfileValidation,

    /*
     * Configurations
     */
    EncryptionService,

    /*
     * Guards
     */
    JwtStrategy,
    JwtRefreshStrategy,

    /*
     * USES CASES
     */
    SignupUsecase,
    LoginUseCase,
    ProfileUsecase,
    RefreshUseCase,
  ],
})
export class AuthModule {}
