import { Module } from '@nestjs/common';
import { RefreshController } from '@auth/infrastructure/controllers/refresh.controller';
import { SignupUsecase } from '@auth/application/usecases/signup.usecase';
import { PG_USER_REPOSITORY, UserRepository } from '@auth/infrastructure/database/user.repository';
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

import { JwtRefreshStrategy } from './infrastructure/guards/jwt-refresh.strategy';
import { LoginController } from './infrastructure/controllers/login.controller';
import { SignupController } from './infrastructure/controllers/signup.controller';
import { LoginValidation } from './infrastructure/controllers/dtos/login.validations';
import { ConfigService } from '@nestjs/config';
import { MyConfigModule } from 'src/config/config.module';
import { VerificationEmailUseCase } from './application/usecases/verification.email.usecase';
import { VerifyController } from './infrastructure/controllers/verify.controller';
import { JwtVerifyStrategy } from './infrastructure/guards/jwt-verify.strategy';
import { LogoutUsecase } from './application/usecases/logout.usecase';
import { LogoutController } from './infrastructure/controllers/logout.controller';

@Module({
  imports: [
    DatabaseModule,
    CacheModule.register({ ttl: 60, max: 1000 }),
    JwtModule.registerAsync({
      imports: [MyConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret', 'FynVfpT19fKeEvCS'),
        signOptions: { expiresIn: '1h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [
    LoginController,
    LogoutController,
    SignupController,
    RefreshController,
    VerifyController,
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

    /*
     * Configurations
     */
    EncryptionService,

    /*
     * Guards
     */
    JwtStrategy,
    JwtRefreshStrategy,
    JwtVerifyStrategy,

    /*
     * USES CASES
     */
    SignupUsecase,
    LoginUseCase,
    LogoutUsecase,
    RefreshUseCase,
    VerificationEmailUseCase,
  ],
  exports: [PG_USER_REPOSITORY, PG_ACCESS_TOKEN_REPOSITORY, CACHE_ACCESS_TOKEN_REPOSITORY],
})
export class AuthModule {}
