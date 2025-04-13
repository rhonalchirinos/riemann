import { Test, TestingModule } from '@nestjs/testing';
import { PG_USER_REPOSITORY, UserRepository } from '@auth/infrastructure/database/user.repository';
import { DatabaseModule } from '@database/database.module';

import { SignupValidation } from '@auth/infrastructure/controllers/dtos/signup.validations';

import { PrismaService } from '@database/prisma.service';
import { EncryptionService } from '../../../auth/application/services/encryption.service';

import { User } from '@prisma/client';
import { ProfileUsecase } from './profile-usecase';

describe('AuthController', () => {
  let profileUsecase: ProfileUsecase;
  const mockContext: any = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
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
    };
    mockContext.user.findUnique.mockResolvedValue(user);

    const result = await profileUsecase.execute(1);
    expect(result).toBeDefined();
  });

  it('should get and error', async () => {
    expect(profileUsecase).toBeDefined();
    expect.assertions(1);
    try {
      await profileUsecase.execute(1);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});
