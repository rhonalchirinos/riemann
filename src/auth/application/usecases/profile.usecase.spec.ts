import { Test, TestingModule } from '@nestjs/testing';
import {
  PG_USER_REPOSITORY,
  UserRepository,
} from '@auth/infrastructure/database/user.repository';
import { DatabaseModule } from '@database/database.module';

import { SignupValidation } from '@auth/infrastructure/controllers/dtos/signup.validations';

import { PrismaService } from '@database/prisma.service';
import { EncryptionService } from '../services/encryption.service';

import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient, User } from '@prisma/client';
import { ProfileUsecase } from './profile.usecase';

export type MockContext = {
  prisma: DeepMockProxy<PrismaClient>;
};

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>({
      user: {
        findUnique: jest.fn(),
      },
    }),
  };
};

describe('AuthController', () => {
  let profileUsecase: ProfileUsecase;
  let mockContext: MockContext;

  beforeEach(async () => {
    mockContext = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [
        SignupValidation,
        EncryptionService,
        ProfileUsecase,
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
    profileUsecase = module.get<ProfileUsecase>(ProfileUsecase);
  });

  it('should be defined', () => {
    expect(profileUsecase).toBeDefined();
    expect(mockContext).toBeDefined();
  });

  it('should get a user', async () => {
    const user: User = {
      id: 1,
      email: 'testing@gmail.com',
      name: 'Testing User',
      password: 'HolaMundo#1200',
    };
    mockContext.prisma.user.findUnique.mockResolvedValue(user);

    const result = await profileUsecase.execute(1);
    expect(result).toBeDefined();
  });

  it('should get and error', async () => {
    expect.assertions(1);
    try {
      await profileUsecase.execute(1);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
