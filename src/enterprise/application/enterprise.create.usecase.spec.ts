import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '@database/database.module';

import { PrismaService } from '@database/prisma.service';

import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { EnterpriseCreateUseCase } from './enterprise.create.usecase';
import {
  EnterpriseRepository,
  PG_ENTERPRISE_REPOSITORY,
} from '../infrastructure/databases/entreprise.repository';

export type MockContext = {
  prisma: DeepMockProxy<PrismaClient>;
};

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>({
      enterprise: {
        findUnique: jest.fn(),
      },
    }),
  };
};

describe('AuthController', () => {
  let usecase: EnterpriseCreateUseCase;
  let mockContext: MockContext;

  beforeEach(async () => {
    mockContext = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [
        EnterpriseCreateUseCase,
        {
          provide: PG_ENTERPRISE_REPOSITORY,
          useClass: EnterpriseRepository,
        },
        {
          provide: PrismaService,
          useFactory: () => mockContext.prisma,
        },
      ],
    }).compile();
    usecase = module.get<EnterpriseCreateUseCase>(EnterpriseCreateUseCase);
  });

  it('should be defined', () => {
    expect(usecase).toBeDefined();
    expect(mockContext).toBeDefined();
  });

  it('should create a enterprise', async () => {});
});
