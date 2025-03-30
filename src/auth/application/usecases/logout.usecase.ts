import { Inject, Injectable } from '@nestjs/common';
import { type AccessTokenRepositoryPort } from '@auth/domain/repositories/access.token.repository';
import { CACHE_ACCESS_TOKEN_REPOSITORY } from '@auth/infrastructure/database/cache.access.token.repository';
import { AccessToken } from '@prisma/client';

@Injectable()
export class LogoutUsecase {
  constructor(
    @Inject(CACHE_ACCESS_TOKEN_REPOSITORY)
    private accessTokenRepository: AccessTokenRepositoryPort,
  ) {}

  async execute(accessToken: AccessToken): Promise<void> {
    await this.accessTokenRepository.delete(accessToken);
  }
}
