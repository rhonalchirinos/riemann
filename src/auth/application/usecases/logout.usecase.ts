import { Injectable } from '@nestjs/common';
import { type AccessTokenRepositoryPort } from 'src/auth/domain/repositories/access-token.repository';
import { AccessToken } from '@prisma/client';

@Injectable()
export class LogoutUsecase {
  constructor(private accessTokenRepository: AccessTokenRepositoryPort) {}

  async execute(accessToken: AccessToken): Promise<void> {
    await this.accessTokenRepository.delete(accessToken);
  }
}
