import { Test, TestingModule } from '@nestjs/testing';
import { LogoutUsecase } from './logout.usecase';
import { AccessToken } from '@prisma/client';
import { CacheModule } from '@nestjs/cache-manager';
import { AccessTokenRepositoryPort } from 'src/auth/domain/repositories/access-token.repository';

describe('AuthController', () => {
  let usecase: LogoutUsecase;
  let mockContext: any;

  beforeEach(async () => {
    mockContext = {
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({ ttl: 60, max: 1000 })],
      providers: [
        {
          provide: LogoutUsecase,
          useFactory: () => new LogoutUsecase(mockContext as unknown as AccessTokenRepositoryPort),
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
    await usecase.execute(accessToken);
    expect(accessToken).toBeDefined();
    expect(mockContext.delete).toHaveBeenCalledWith(accessToken);
  });
});
