import { Module } from '@nestjs/common';
import { RefreshController } from '@auth/infrastructure/controllers/refresh.controller';
import { SignupUsecase } from '@auth/application/usecases/signup.usecase';
import { PG_USER_REPOSITORY, UserRepository } from '@auth/infrastructure/database/user.repository';
import {
  AccessTokenRepository,
  PG_ACCESS_TOKEN_REPOSITORY,
} from 'src/auth/infrastructure/database/access-token.repository';
import {
  CACHE_ACCESS_TOKEN_REPOSITORY,
  CacheAccessTokenRepository,
} from 'src/auth/infrastructure/database/cache-access-token.repository';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

import { DatabaseModule } from 'src/database/database.module';
import { SignupValidation } from '@auth/infrastructure/controllers/dtos/signup.validations';
import { EncryptionService } from '@auth/application/services/encryption.service';
import { JwtStrategy } from '@auth/infrastructure/guards/jwt.strategy';
import { LoginUseCase } from 'src/auth/application/usecases/login.usecase';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import { RefreshUseCase } from './application/usecases/refresh-token.usecase';

import { JwtRefreshStrategy } from './infrastructure/guards/jwt-refresh.strategy';
import { LoginController } from './infrastructure/controllers/login.controller';
import { SignupController } from './infrastructure/controllers/signup.controller';
import { LoginValidation } from './infrastructure/controllers/dtos/login.validations';
import { ConfigService } from '@nestjs/config';
import { MyConfigModule } from 'src/config/config.module';
import { VerificationEmailUseCase } from './application/usecases/verification-email.usecase';
import { VerifyController } from './infrastructure/controllers/verify.controller';
import { JwtVerifyStrategy } from './infrastructure/guards/jwt-verify.strategy';
import { LogoutUsecase } from './application/usecases/logout.usecase';
import { LogoutController } from './infrastructure/controllers/logout.controller';
import { UserRepositoryPort } from './domain/repositories/user.repository';
import { MailerService } from '@nestjs-modules/mailer';

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
    {
      provide: JwtStrategy,
      useFactory: (config: ConfigService, accessTokenRepository: AccessTokenRepository) => {
        return new JwtStrategy(config, accessTokenRepository);
      },
      inject: [ConfigService, CACHE_ACCESS_TOKEN_REPOSITORY],
    },
    {
      provide: JwtRefreshStrategy,
      useFactory: (config: ConfigService, accessTokenRepository: AccessTokenRepository) => {
        return new JwtRefreshStrategy(config, accessTokenRepository);
      },
      inject: [ConfigService, CACHE_ACCESS_TOKEN_REPOSITORY],
    },
    {
      provide: JwtVerifyStrategy,
      useFactory: (config: ConfigService) => {
        return new JwtVerifyStrategy(config);
      },
      inject: [ConfigService, CACHE_ACCESS_TOKEN_REPOSITORY],
    },

    /*
     * USES CASES
     */
    {
      provide: SignupUsecase,
      useFactory: (repository: UserRepository, encryptionService: EncryptionService) =>
        new SignupUsecase(repository, encryptionService),
      inject: [PG_USER_REPOSITORY, EncryptionService],
    },
    {
      provide: LoginUseCase,
      useFactory: (
        repository: UserRepository,
        accessTokenRepository: AccessTokenRepository,
        jwtService: JwtService,
        encryptionService: EncryptionService,
      ) => new LoginUseCase(repository, accessTokenRepository, jwtService, encryptionService),
      inject: [PG_USER_REPOSITORY, CACHE_ACCESS_TOKEN_REPOSITORY, JwtService, EncryptionService],
    },
    {
      provide: LogoutUsecase,
      useFactory: (repository: CacheAccessTokenRepository) => new LogoutUsecase(repository),
      inject: [CACHE_ACCESS_TOKEN_REPOSITORY],
    },
    {
      provide: RefreshUseCase,
      useFactory: (
        repository: UserRepository,
        accessTokenRepository: AccessTokenRepository,
        jwtService: JwtService,
      ) => new RefreshUseCase(repository, accessTokenRepository, jwtService),
      inject: [PG_USER_REPOSITORY, CACHE_ACCESS_TOKEN_REPOSITORY, JwtService, EncryptionService],
    },
    {
      provide: VerificationEmailUseCase,
      useFactory: (
        userRepository: UserRepositoryPort,
        cache: Cache,
        mail: MailerService,
        jwtService: JwtService,
      ) => new VerificationEmailUseCase(userRepository, cache, mail, jwtService),
      inject: [PG_USER_REPOSITORY, CACHE_MANAGER, MailerService, JwtService],
    },
  ],
  exports: [PG_USER_REPOSITORY, PG_ACCESS_TOKEN_REPOSITORY, CACHE_ACCESS_TOKEN_REPOSITORY],
})
export class AuthModule {}
