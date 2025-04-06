import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '@database/database.module';
import { PrismaService } from '@database/prisma.service';
import { EnterpriseCreateUseCase } from './enterprise.create.usecase';
import {
  EnterpriseRepository,
  PG_ENTERPRISE_REPOSITORY,
} from '../infrastructure/databases/entreprise.repository';
import { type EnterpriseRepositoryPort } from '../domain/enterprise.repository';

describe('EnterpriseCreateUseCase', () => {
  let usecase: EnterpriseCreateUseCase;
  let mockContext: any;

  beforeEach(async () => {
    mockContext = {
      enterprise: { create: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [
        {
          provide: EnterpriseCreateUseCase.name,
          useFactory: (repository: EnterpriseRepositoryPort) =>
            new EnterpriseCreateUseCase(repository),
          inject: [PG_ENTERPRISE_REPOSITORY],
        },
        {
          provide: PG_ENTERPRISE_REPOSITORY,
          useFactory: () => new EnterpriseRepository(mockContext as PrismaService),
        },
      ],
    }).compile();

    usecase = module.get<EnterpriseCreateUseCase>(EnterpriseCreateUseCase.name);
  });

  it('should throw an error if input is invalid', async () => {
    const invalidInput = {
      id: '',
      name: '',
      slug: '',
      description: '',
      ownerId: null,
      createdAt: null,
      updatedAt: null,
    };

    mockContext.enterprise.create.mockRejectedValue(new Error('Invalid input'));
    await expect(usecase.execute(1, invalidInput)).rejects.toThrow('Invalid input');
  });

  it('should call the repository with the correct parameters', async () => {
    const input = {
      id: 'enterprise-id',
      name: 'enterprise-name',
      slug: 'enterprise-slug',
      description: 'enterprise-description',
      ownerId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockContext.enterprise.create.mockResolvedValue(input);
    const result = await usecase.execute(1, input);

    expect(result).toEqual(input);

    expect(mockContext.enterprise.create).toHaveBeenCalled();
  });
});
