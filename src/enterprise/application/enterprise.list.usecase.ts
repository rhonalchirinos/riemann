import { Injectable } from '@nestjs/common';
import { Enterprise } from '@prisma/client';
import { type EnterpriseRepositoryPort } from 'src/enterprise/domain/enterprise.repository';

@Injectable()
export class EnterpriseListUseCase {
  /**
   *
   */
  public constructor(private enterpriseRepository: EnterpriseRepositoryPort) {}

  async execute(userId: number): Promise<Enterprise[]> {
    const items = await this.enterpriseRepository.findAll(userId);

    return items;
  }
}
