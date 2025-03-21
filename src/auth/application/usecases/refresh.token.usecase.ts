import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { type AccessTokenRepositoryPort } from '@auth/domain/repositories/access.token.repository';
import { type UserRepositoryPort } from 'src/auth/domain/repositories/user.repository';
import { AccessTokenDto } from './dtos/access.token.dto';
import { CACHE_ACCESS_TOKEN_REPOSITORY } from '@auth/infrastructure/database/cache.access.token.repository';
import { AccessTokenGenerateUseCase } from './accestoken.generate.usecase';
import { AccessToken } from '@prisma/client';
import { PG_USER_REPOSITORY } from 'src/auth/infrastructure/database/user.repository';

@Injectable()
export class RefreshUseCase extends AccessTokenGenerateUseCase {
  constructor(
    @Inject(CACHE_ACCESS_TOKEN_REPOSITORY)
    accessTokenRepository: AccessTokenRepositoryPort,

    @Inject(PG_USER_REPOSITORY)
    private authRepository: UserRepositoryPort,

    jwtService: JwtService,
  ) {
    super(accessTokenRepository, jwtService);
  }

  async execute(accessToken: AccessToken): Promise<AccessTokenDto> {
    const user = await this.authRepository.findById(accessToken.userId);

    if (!user) {
      throw new UnauthorizedException();
    }

    const token = await this.generateAccessToken(user);

    await this.accessTokenRepository.delete(accessToken);

    return token;
  }
}
