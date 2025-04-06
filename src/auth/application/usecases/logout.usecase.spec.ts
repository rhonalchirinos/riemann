import { Test, TestingModule } from '@nestjs/testing';
import { PG_USER_REPOSITORY, UserRepository } from '@auth/infrastructure/database/user.repository';
import { DatabaseModule } from '@database/database.module';
import { PrismaService } from '@database/prisma.service';
import { LogoutUsecase } from './logout.usecase';
import {
  CACHE_ACCESS_TOKEN_REPOSITORY,
  CacheAccessTokenRepository,
} from '@auth/infrastructure/database/cache.access.token.repository';
import { AccessToken } from '@prisma/client';
import {
  AccessTokenRepository,
  PG_ACCESS_TOKEN_REPOSITORY,
} from '@auth/infrastructure/database/access.token.repository';
import { CacheModule } from '@nestjs/cache-manager';

describe('AuthController', () => {
  let usecase: LogoutUsecase;
  let mockContext: any;

  beforeEach(async () => {
    mockContext = {
      accessToken: { delete: jest.fn() },
    };

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
          useFactory: () => new AccessTokenRepository(mockContext as PrismaService),
        },
        {
          provide: CACHE_ACCESS_TOKEN_REPOSITORY,
          useClass: CacheAccessTokenRepository,
        },
      ],
    }).compile();
    usecase = module.get<LogoutUsecase>(LogoutUsecase);
  });

  it('should delete a accessToken', async () => {
    expect(usecase).toBeDefined();

    const accessToken: AccessToken = {
      id: 'test-id',
      createdAt: new Date(),
      refreshToken: null,
      expiresAt: null,
      userId: 1,
    };

    mockContext.accessToken.delete.mockResolvedValue(accessToken);

    await usecase.execute(accessToken);
    expect(accessToken).toBeDefined();
    expect(mockContext.accessToken.delete).toHaveBeenCalled();
  });
});
