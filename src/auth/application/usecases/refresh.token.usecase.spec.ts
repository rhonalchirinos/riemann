import { Test, TestingModule } from '@nestjs/testing';
import {
  PG_USER_REPOSITORY,
  UserRepository,
} from '@auth/infrastructure/database/user.repository';
import {
  CACHE_ACCESS_TOKEN_REPOSITORY,
  CacheAccessTokenRepository,
} from '@auth/infrastructure/database/cache.access.token.repository';
import {
  AccessTokenRepository,
  PG_ACCESS_TOKEN_REPOSITORY,
} from '@auth/infrastructure/database/access.token.repository';

import { DatabaseModule } from '@database/database.module';
import { SignupValidation } from '@auth/infrastructure/controllers/dtos/signup.validations';
import { PrismaService } from '@database/prisma.service';
import { EncryptionService } from '../services/encryption.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { AccessToken, PrismaClient, User } from '@prisma/client';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { CacheModule } from '@nestjs/cache-manager';
import { v4 } from 'uuid';
import { RefreshUseCase } from './refresh.token.usecase';

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
      accessToken: {
        create: jest.fn(),
        delete: jest.fn(),
      },
    }),
  };
};

describe('Refresh Token Usecase', () => {
  let refreshUseCase: RefreshUseCase;
  let mockContext: MockContext;
  let encryptionService: EncryptionService;
  let jwtService: JwtService;

  beforeEach(async () => {
    mockContext = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DatabaseModule,
        CacheModule.register(),
        JwtModule.register({
          secret: process.env.JWT_SECRET || 'WplAr8TYw6oCviNnOvFa',
          signOptions: { expiresIn: '2h' },
        }),
      ],
      providers: [
        SignupValidation,
        EncryptionService,
        RefreshUseCase,
        {
          provide: PG_USER_REPOSITORY,
          useClass: UserRepository,
        },
        {
          provide: PG_ACCESS_TOKEN_REPOSITORY,
          useClass: AccessTokenRepository,
        },
        {
          provide: CACHE_ACCESS_TOKEN_REPOSITORY,
          useClass: CacheAccessTokenRepository,
        },
        {
          provide: PrismaService,
          useFactory: () => {
            return mockContext.prisma;
          },
        },
      ],
    }).compile();

    refreshUseCase = module.get<RefreshUseCase>(RefreshUseCase);
    encryptionService = module.get<EncryptionService>(EncryptionService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(refreshUseCase).toBeDefined();
    expect(mockContext).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  it('should refresh a new access token', async () => {
    const user: User = {
      id: 1,
      email: 'testing@gmail.com',
      name: 'Testing User',
      password: await encryptionService.hashPassword(String('HolaMundo#1200')),
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: null,
    };
    mockContext.prisma.user.findUnique.mockResolvedValue(user);

    const accessToken: AccessToken = {
      id: v4(),
      userId: 1,
      expiresAt: new Date(),
      createdAt: new Date(),
      refreshToken: v4(),
    };
    mockContext.prisma.accessToken.create.mockResolvedValue(accessToken);

    const result = await refreshUseCase.execute(accessToken);

    expect(result).toBeDefined();
  });
});
