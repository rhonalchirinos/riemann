import { Inject, Injectable } from '@nestjs/common';
import { Enterprise } from '@prisma/client';
import { type EnterpriseRepositoryPort } from 'src/enterprise/domain/enterprise.repository';
import { PG_ENTERPRISE_REPOSITORY } from 'src/enterprise/infrastructure/databases/entreprise.repository';

@Injectable()
export class EnterpriseListUseCase {
  /**
   *
   */
  public constructor(
    @Inject(PG_ENTERPRISE_REPOSITORY)
    private enterpriseRepository: EnterpriseRepositoryPort,
  ) {}

  async execute(userId: number): Promise<Enterprise[]> {
    const items = await this.enterpriseRepository.findAll(userId);

    return items;
  }
}
