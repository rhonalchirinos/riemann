import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { type AccessTokenRepositoryPort } from 'src/auth/domain/repositories/access-token.repository';
import { type UserRepositoryPort } from 'src/auth/domain/repositories/user.repository';
import { AccessTokenDto } from './dtos/access-token.dto';
import { AccessTokenGenerateUseCase } from './acces-token-generate.usecase';
import { AccessToken } from '@prisma/client';

@Injectable()
export class RefreshUseCase extends AccessTokenGenerateUseCase {
  constructor(
    private authRepository: UserRepositoryPort,
    accessTokenRepository: AccessTokenRepositoryPort,
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
