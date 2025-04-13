import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { RefreshUseCase } from './refresh-token.usecase';
import { AccessTokenRepositoryPort } from 'src/auth/domain/repositories/access-token.repository';

import { AccessToken } from '@prisma/client';
import { UserRepositoryPort } from 'src/auth/domain/repositories/user.repository';

describe('RefreshUseCase', () => {
  let refreshUseCase: RefreshUseCase;

  let mockUserRepository: any;
  let mockAccessTokenRepository: any;

  beforeEach(async () => {
    mockUserRepository = {
      findById: jest.fn(),
    };

    mockAccessTokenRepository = {
      delete: jest.fn(),
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'secret',
        }),
      ],
      providers: [
        {
          provide: RefreshUseCase,
          useFactory: (jwtService: JwtService) => {
            return new RefreshUseCase(
              mockUserRepository as UserRepositoryPort,
              mockAccessTokenRepository as AccessTokenRepositoryPort,
              jwtService,
            );
          },
          inject: [JwtService],
        },
      ],
    }).compile();

    refreshUseCase = module.get<RefreshUseCase>(RefreshUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should throw UnauthorizedException if user is not found', async () => {
    const mockAccessToken: AccessToken = {
      id: 'token-id',
      userId: 1,
      createdAt: new Date(),
      expiresAt: new Date(),
      refreshToken: null,
    };

    mockUserRepository.findById.mockResolvedValueOnce(null);
    await expect(refreshUseCase.execute(mockAccessToken)).rejects.toThrow(UnauthorizedException);
    expect(mockUserRepository.findById).toHaveBeenCalledWith(mockAccessToken.userId);
  });

  it('should generate a new access token and delete the old one', async () => {
    const mockAccessToken: AccessToken = {
      id: 'token-id',
      userId: 1,
      createdAt: new Date(),
      expiresAt: new Date(),
      refreshToken: null,
    };

    const mockUser = { id: 'user-id', email: 'test@example.com' };
    mockUserRepository.findById.mockResolvedValueOnce(mockUser);

    const result = await refreshUseCase.execute(mockAccessToken);

    expect(mockUserRepository.findById).toHaveBeenCalledWith(mockAccessToken.userId);
    expect(mockAccessTokenRepository.delete).toHaveBeenCalledWith(mockAccessToken);
    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('refresh');
    expect(result).toHaveProperty('expiresAt');
  });

  it('should call accessTokenRepository.delete with the correct argument', async () => {
    const mockAccessToken: AccessToken = {
      id: 'token-id',
      userId: 1,
      createdAt: new Date(),
      expiresAt: new Date(),
      refreshToken: null,
    };

    const mockUser = { id: 'user-id', email: 'test@example.com' };
    mockUserRepository.findById.mockResolvedValueOnce(mockUser);
    await refreshUseCase.execute(mockAccessToken);
    expect(mockAccessTokenRepository.delete).toHaveBeenCalledWith(mockAccessToken);
  });
});
