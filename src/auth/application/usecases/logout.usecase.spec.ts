import { Test, TestingModule } from '@nestjs/testing';
import {
  PG_USER_REPOSITORY,
  UserRepository,
} from '@auth/infrastructure/database/user.repository';
import { DatabaseModule } from '@database/database.module';
import { PrismaService } from '@database/prisma.service';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { LogoutUsecase } from './logout.usecase';
import {
  CACHE_ACCESS_TOKEN_REPOSITORY,
  CacheAccessTokenRepository,
} from '@auth/infrastructure/database/cache.access.token.repository';
import { AccessToken, PrismaClient } from '@prisma/client';
import {
  AccessTokenRepository,
  PG_ACCESS_TOKEN_REPOSITORY,
} from '@auth/infrastructure/database/access.token.repository';
import { CacheModule } from '@nestjs/cache-manager';

export type MockContext = {
  prisma: DeepMockProxy<PrismaClient>;
};

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>({
      accessToken: {
        delete: jest.fn(),
      },
    }),
  };
};

describe('AuthController', () => {
  let usecase: LogoutUsecase;
  let mockContext: MockContext;

  beforeEach(async () => {
    mockContext = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, CacheModule.register({ ttl: 60, max: 1000 })],
      providers: [
        LogoutUsecase,
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
    usecase = module.get<LogoutUsecase>(LogoutUsecase);
  });

  it('should be defined', () => {
    expect(usecase).toBeDefined();
    expect(mockContext).toBeDefined();
  });

  it('should delete a accessToken', async () => {
    const accessToken: AccessToken = {
      id: 'test-id',
      createdAt: new Date(),
      refreshToken: null,
      expiresAt: null,
      userId: 1,
    };
    await usecase.execute(accessToken);
    expect(accessToken).toBeDefined();
    expect(
      mockContext.prisma.accessToken.delete.bind(
        mockContext.prisma.accessToken,
      ),
    ).toHaveBeenCalled();
  });
});
