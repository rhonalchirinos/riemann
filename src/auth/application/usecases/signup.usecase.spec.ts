import { Test, TestingModule } from '@nestjs/testing';
import { PG_USER_REPOSITORY, UserRepository } from '@auth/infrastructure/database/user.repository';
import { DatabaseModule } from '@database/database.module';

import { SignupUsecase } from '@auth/application/usecases/signup.usecase';
import { SignupValidation } from '@auth/infrastructure/controllers/dtos/signup.validations';

import { PrismaService } from '@database/prisma.service';
import { EncryptionService } from '../services/encryption.service';

import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient, User } from '@prisma/client';

export type MockContext = {
  prisma: DeepMockProxy<PrismaClient>;
};

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>({
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      },
    }),
  };
};

describe('AuthController', () => {
  let signupUsecase: SignupUsecase;
  let mockContext: MockContext;

  beforeEach(async () => {
    mockContext = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [
        SignupValidation,
        EncryptionService,
        SignupUsecase,
        {
          provide: PG_USER_REPOSITORY,
          useClass: UserRepository,
        },
        {
          provide: PrismaService,
          useFactory: () => {
            return mockContext.prisma;
          },
        },
      ],
    }).compile();
    signupUsecase = module.get<SignupUsecase>(SignupUsecase);
  });

  it('should be defined', () => {
    expect(signupUsecase).toBeDefined();
    expect(mockContext).toBeDefined();
  });

  it('should signup a user', async () => {
    const user: User = {
      id: 1,
      email: 'testing@gmail.com',
      name: 'Testing User',
      password: 'HolaMundo#1200',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: null,
    };
    mockContext.prisma.user.count.mockResolvedValue(0);
    mockContext.prisma.user.create.mockResolvedValue(user);

    const dataUser = {
      email: 'testing@gmail.com',
      name: 'Testing User',
      password: 'HolaMundo#1200',
    };

    const result = await signupUsecase.execute(dataUser);
    expect(result).toBeDefined();
  });
});
