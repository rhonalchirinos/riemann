import { Injectable } from '@nestjs/common';
import { Enterprise } from '@prisma/client';
import { type EnterpriseRepositoryPort } from 'src/enterprise/domain/enterprise.repository';
import { type EnterpriseCreateDto } from './dtos/enterprise.create.dto';
import { type Cache } from '@nestjs/cache-manager';

@Injectable()
export class EnterpriseCreateUseCase {
  /**
   *
   */
  public constructor(
    private enterpriseRepository: EnterpriseRepositoryPort,
    private cacheManager: Cache,
  ) {}

  async execute(userId: number, value: EnterpriseCreateDto): Promise<Enterprise> {
    const input = { ...value, owner: { connect: { id: userId } } };
    const enterprise = await this.enterpriseRepository.create(input);

    return enterprise;
  }
}
