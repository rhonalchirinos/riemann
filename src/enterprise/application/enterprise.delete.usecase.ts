import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { type EnterpriseRepositoryPort } from 'src/enterprise/domain/enterprise.repository';
import { PG_ENTERPRISE_REPOSITORY } from 'src/enterprise/infrastructure/databases/entreprise.repository';

@Injectable()
export class EnterpriseDeleteUseCase {
  /**
   *
   */
  public constructor(
    @Inject(PG_ENTERPRISE_REPOSITORY)
    private enterpriseRepository: EnterpriseRepositoryPort,
  ) {}

  async execute(ownerId: number, enterpriseId: string): Promise<boolean> {
    const enterprise = await this.enterpriseRepository.findById(enterpriseId, {
      ownerId,
    });

    if (!enterprise) {
      throw new NotFoundException('Enterprise not found');
    }

    await this.enterpriseRepository.delete(enterpriseId);

    return true;
  }
}
