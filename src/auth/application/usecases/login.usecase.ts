import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PG_USER_REPOSITORY } from '@auth/infrastructure/database/user.repository';
import { type UserRepositoryPort } from '@auth/domain/repositories/user.repository';
import { type AccessTokenRepositoryPort } from '@auth/domain/repositories/access.token.repository';
import { type LoginDto } from './dtos/login.dto';
import { EncryptionService } from '../services/encryption.service';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenDto } from './dtos/access.token.dto';
import { CACHE_ACCESS_TOKEN_REPOSITORY } from '@auth/infrastructure/database/cache.access.token.repository';
import { AccessTokenGenerateUseCase } from './accestoken.generate.usecase';

@Injectable()
export class LoginUseCase extends AccessTokenGenerateUseCase {
  private authRepository: UserRepositoryPort;
  private encryptionService: EncryptionService;

  constructor(
    @Inject(PG_USER_REPOSITORY)
    authRepository: UserRepositoryPort,

    @Inject(CACHE_ACCESS_TOKEN_REPOSITORY)
    accessTokenRepository: AccessTokenRepositoryPort,

    jwtService: JwtService,
    encryptionService: EncryptionService,
  ) {
    super(accessTokenRepository, jwtService);

    this.authRepository = authRepository;
    this.encryptionService = encryptionService;
  }

  async execute({ email, password }: LoginDto): Promise<AccessTokenDto> {
    if (!email || !password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.authRepository.findByEmail(email.toLocaleLowerCase());

    if (user) {
      const isPasswordValid = await this.encryptionService.comparePassword(password, user.password);

      if (isPasswordValid) {
        return this.generateAccessToken(user);
      }
    }

    throw new UnauthorizedException('Invalid credentials');
  }
}
