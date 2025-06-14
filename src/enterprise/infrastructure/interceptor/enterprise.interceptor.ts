import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  HttpException,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { Enterprise } from '@prisma/client';
import { Observable } from 'rxjs';
import { type EnterpriseRepositoryPort } from 'src/enterprise/domain/enterprise.repository';
import { type AuthRequest } from 'src/shared/dto/request';

import { PG_ENTERPRISE_REPOSITORY } from '../databases/entreprise.repository';

@Injectable()
export class EnterpriseInterceptor implements NestInterceptor {
  constructor(
    @Inject(REQUEST)
    private readonly request: AuthRequest,

    @Inject(CACHE_MANAGER) private cacheManager: Cache,

    @Inject(PG_ENTERPRISE_REPOSITORY)
    private repository: EnterpriseRepositoryPort,
  ) {}

  async intercept(context?: ExecutionContext, next?: CallHandler): Promise<Observable<any>> {
    const { enterpriseId } = this.request.params;
    const { user } = this.request;

    if (!enterpriseId || enterpriseId === 'undefined') {
      throw new HttpException('Organization ID is required', HttpStatus.BAD_REQUEST);
    }

    const enterprise = await this.findEnterpriseById(enterpriseId, user.userId);

    this.request.enterpriseId = enterprise.id;
    this.request.enterprise = enterprise;

    if (!next) {
      throw new HttpException('Not found Action', HttpStatus.NOT_FOUND);
    }

    return next.handle();
  }

  /**
   *
   * @param enterpriseId
   * @param userId
   */
  async findEnterpriseById(enterpriseId: string, userId: string): Promise<Enterprise> {
    const enterprise = await this.loadEnterpriseData(enterpriseId);

    if (enterprise.ownerId == parseInt(userId)) {
      return enterprise;
    }

    const userEnterprise = await this.cacheManager.get<boolean>(
      `enterprise-users:${enterpriseId}:${userId}`,
    );

    if (!userEnterprise) {
      // todo: add the check if the user is in the enterprise
      const employee = await this.repository.findEmployee(enterpriseId, userId);

      if (!employee) {
        throw new ForbiddenException('User not found in this organization');
      }

      await this.cacheManager.set(
        `enterprise-users:${enterpriseId}:${userId}`,
        employee,
        60 * 1000,
      );
    }

    return enterprise;
  }

  /**
   *
   */
  async loadEnterpriseData(enterpriseId: string): Promise<Enterprise> {
    const cachedEnterprise = await this.cacheManager.get<Enterprise>(`enterprise:${enterpriseId}`);

    if (cachedEnterprise) {
      return cachedEnterprise;
    }

    const enterprise = await this.repository.findById(enterpriseId);

    if (!enterprise) {
      throw new HttpException('Enterprise not found', HttpStatus.NOT_FOUND);
    }

    await this.cacheManager.set(`enterprise:${enterpriseId}`, enterprise, 60 * 1000);

    return enterprise;
  }
}
