import { Injectable } from '@nestjs/common';
import { Cache } from '@nestjs/cache-manager';
import { ProfileRepositoryPort } from 'src/profile/domain/rapositories/profile.repository';
import { Profile } from 'src/profile/domain/profile';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProfileCacheRepository implements ProfileRepositoryPort {
  /**
   *
   */
  constructor(
    private profile: ProfileRepositoryPort,
    private cacheManager: Cache,
  ) {}

  async findById(id: number, include?: any): Promise<Profile | null> {
    const cacheKey = `profile:${id}`;
    let item = await this.cacheManager.get<Profile>(cacheKey);

    if (item) {
      return item;
    }

    item = await this.profile.findById(id, include);

    if (item) {
      await this.cacheManager.set(cacheKey, item, 1000 * 60 * 10); // 10 minutes
    }

    return item;
  }

  async update(id: number, value: Prisma.UserUpdateInput, include?: any): Promise<Profile> {
    const cacheKey = `profile:${id}`;
    const item = await this.profile.update(id, value, include);

    await this.cacheManager.del(cacheKey);

    return item;
  }
}

export const CACHE_PROFILE_REPOSITORY = 'CACHE_PROFILE_REPOSITORY';
