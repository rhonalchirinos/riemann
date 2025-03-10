import { Inject, Injectable } from '@nestjs/common';
import { AccessToken, Prisma } from '@prisma/client';
import { type AccessTokenRepositoryPort } from '@auth/domain/repositories/access.token.repository';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { PG_ACCESS_TOKEN_REPOSITORY } from './access.token.repository';

@Injectable()
export class CacheAccessTokenRepository implements AccessTokenRepositoryPort {
  /**
   *
   */
  constructor(
    @Inject(PG_ACCESS_TOKEN_REPOSITORY)
    private accessTokenRepository: AccessTokenRepositoryPort,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  /**
   *
   * @param token
   * @returns
   */
  async findById(id: string): Promise<AccessToken | null> {
    const cachedUser = await this.cacheManager.get<AccessToken>(id);
    if (cachedUser) {
      return cachedUser;
    }

    const user = await this.accessTokenRepository.findById(id);
    if (user) {
      await this.cacheManager.set(id, user, 60);
    }

    return user;
  }

  /**
   *
   * @param value
   *
   * @returns
   */
  async create(value: Prisma.AccessTokenCreateInput): Promise<AccessToken> {
    const accessToken = await this.accessTokenRepository.create(value);
    await this.cacheManager.set(accessToken.id, accessToken, 60);

    return accessToken;
  }
}

export const CACHE_ACCESS_TOKEN_REPOSITORY = 'CACHE_ACCESS_TOKEN_REPOSITORY';
