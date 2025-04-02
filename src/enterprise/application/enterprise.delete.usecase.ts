import { Injectable, NotFoundException } from '@nestjs/common';
import { type EnterpriseRepositoryPort } from 'src/enterprise/domain/enterprise.repository';

@Injectable()
export class EnterpriseDeleteUseCase {
  /**
   *
   */
  public constructor(private enterpriseRepository: EnterpriseRepositoryPort) {}

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
