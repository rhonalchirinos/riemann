import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt-strategy';
import { AccessTokenRepositoryPort } from 'src/auth/domain/repositories/access-token.repository';

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let mockConfigService: Partial<ConfigService>;
  let mockAccessTokenRepository: Partial<AccessTokenRepositoryPort>;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    mockAccessTokenRepository = {
      findById: jest.fn(),
    };

    jwtStrategy = new JwtStrategy(
      mockConfigService as ConfigService,
      mockAccessTokenRepository as AccessTokenRepositoryPort,
    );
  });

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(jwtStrategy).toBeDefined();
      expect(mockConfigService.get).toHaveBeenCalledWith('jwt.secret');
    });
  });

  describe('validate', () => {
    it('should return accessToken and userId for valid payload', async () => {
      const mockPayload = { sub: 'valid-sub' };
      const mockAccessToken = { userId: 'user-id' };

      mockAccessTokenRepository.findById = jest.fn().mockResolvedValue(mockAccessToken);

      const result = await jwtStrategy.validate(mockPayload);

      expect(mockAccessTokenRepository.findById).toHaveBeenCalledWith('valid-sub');
      expect(result).toEqual({ accessToken: mockAccessToken, userId: 'user-id' });
    });

    it('should throw UnauthorizedException if payload.sub is missing', async () => {
      const mockPayload = { sub: null };

      await expect(jwtStrategy.validate(mockPayload)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if accessToken is not found', async () => {
      const mockPayload = { sub: 'invalid-sub' };

      mockAccessTokenRepository.findById = jest.fn().mockResolvedValue(null);

      await expect(jwtStrategy.validate(mockPayload)).rejects.toThrow(UnauthorizedException);
    });
  });
});
