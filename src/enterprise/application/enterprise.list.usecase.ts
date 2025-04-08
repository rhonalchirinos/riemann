import { Injectable } from '@nestjs/common';
import { Enterprise } from '@prisma/client';
import { type Cache } from 'cache-manager';
import { type EnterpriseRepositoryPort } from 'src/enterprise/domain/enterprise.repository';

@Injectable()
export class EnterpriseListUseCase {
  /**
   *
   */
  public constructor(
    private enterpriseRepository: EnterpriseRepositoryPort,
    private cacheManager: Cache,
  ) {}

  async execute(userId: number): Promise<Enterprise[]> {
    const items = await this.enterpriseRepository.findAll(userId);

    return items;
  }
}
