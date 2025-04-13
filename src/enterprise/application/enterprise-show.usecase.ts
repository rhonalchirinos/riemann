import { Injectable, NotFoundException } from '@nestjs/common';
import { Enterprise } from '@prisma/client';
import { type Cache } from 'cache-manager';
import { type EnterpriseRepositoryPort } from 'src/enterprise/domain/enterprise.repository';

@Injectable()
export class EnterpriseShowUseCase {
  /**
   *
   */
  public constructor(
    private enterpriseRepository: EnterpriseRepositoryPort,
    private cacheManager: Cache,
  ) {}

  async execute(ownerId: number, enterpriseId: string): Promise<Enterprise> {
    const enterprise = await this.enterpriseRepository.findById(enterpriseId, {
      ownerId,
    });

    if (!enterprise) {
      throw new NotFoundException('Enterprise not found');
    }

    return enterprise;
  }
}
