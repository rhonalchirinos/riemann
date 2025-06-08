import { Injectable, NotFoundException } from '@nestjs/common';
import { Enterprise } from '@prisma/client';
import { type EnterpriseRepositoryPort } from 'src/enterprise/domain/enterprise.repository';
import { type EnterpriseCreateDto } from './dtos/enterprise.create.dto';
import { type Cache } from '@nestjs/cache-manager';

@Injectable()
export class EnterpriseUpdateUseCase {
  /**
   *
   */
  public constructor(
    private enterpriseRepository: EnterpriseRepositoryPort,
    private cacheManager: Cache,
  ) {}

  /**
   *
   * @param ownerId
   * @param enterpriseId
   * @param value
   * @returns
   */
  async execute(
    ownerId: number,
    enterpriseId: string,
    value: EnterpriseCreateDto,
  ): Promise<Enterprise> {
    const enterprise = await this.enterpriseRepository.findById(enterpriseId, {
      ownerId,
    });

    if (!enterprise) {
      throw new NotFoundException('Enterprise not found');
    }

    if (enterprise.name !== value.name) {
      enterprise.name = value.name;
    }

    await this.enterpriseRepository.update(enterpriseId, this.changes(enterprise, value));

    await this.cacheManager.del(`enterprise:${enterpriseId}`);

    return enterprise;
  }

  private changes(enterprise: Enterprise, values: EnterpriseCreateDto) {
    const data = {};

    if (enterprise.name !== values.name) {
      data['name'] = values.name;
    }

    if (enterprise.description !== values.description) {
      data['description'] = values.description;
    }

    if (enterprise.slug !== values.slug) {
      data['slug'] = values.slug;
    }

    return data;
  }
}
