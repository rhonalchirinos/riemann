import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Enterprise } from '@prisma/client';
import { type EnterpriseRepositoryPort } from 'src/enterprise/domain/enterprise.repository';
import { PG_ENTERPRISE_REPOSITORY } from 'src/enterprise/infrastructure/databases/entreprise.repository';

@Injectable()
export class EnterpriseShowUseCase {
  /**
   *
   */
  public constructor(
    @Inject(PG_ENTERPRISE_REPOSITORY)
    private enterpriseRepository: EnterpriseRepositoryPort,
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
