import { Test, TestingModule } from '@nestjs/testing';
import { PG_USER_REPOSITORY, UserRepository } from '@auth/infrastructure/database/user.repository';

import { SignupValidation } from '@auth/infrastructure/controllers/dtos/signup.validations';

import { PrismaService } from 'src/configuration/database/prisma.service';
import { EncryptionService } from '../../../auth/application/services/encryption.service';

import { User } from '@prisma/client';
import { ProfileUsecase } from './profile.usecase';

describe('AuthController', () => {
  let profileUsecase: ProfileUsecase;
  const mockContext: any = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SignupValidation,
        EncryptionService,
        {
          provide: ProfileUsecase.name,
          useFactory: (userRepository: UserRepository) => new ProfileUsecase(userRepository),
          inject: [PG_USER_REPOSITORY],
        },
        {
          provide: PG_USER_REPOSITORY,
          useFactory: () => new UserRepository(mockContext as PrismaService),
        },
      ],
    }).compile();
    profileUsecase = module.get<ProfileUsecase>(ProfileUsecase.name);
  });

  it('should get a user', async () => {
    expect(profileUsecase).toBeDefined();

    const user: User = {
      id: 1,
      email: 'testing@gmail.com',
      name: 'Testing User',
      password: 'HolaMundo#1200',
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: null,
      deletedAt: null,
    };
    mockContext.user.findUnique.mockResolvedValue(user);

    const result = await profileUsecase.profile(1);
    expect(result).toBeDefined();
  });

  it('should get and error', async () => {
    expect(profileUsecase).toBeDefined();
    expect.assertions(1);
    try {
      await profileUsecase.profile(1);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
