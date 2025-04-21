import { ConfigService } from '@nestjs/config';
import { JwtRefreshStrategy } from './jwt-refresh.strategy';
import { AccessTokenRepositoryPort } from 'src/auth/domain/repositories/access-token.repository';

// filepath: src/auth/infrastructure/guards/jwt-refresh.strategy.test.ts

describe('JwtRefreshStrategy', () => {
  let jwtRefreshStrategy: JwtRefreshStrategy;
  let mockConfigService: Partial<ConfigService>;
  let mockAccessTokenRepository: Partial<AccessTokenRepositoryPort>;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    mockAccessTokenRepository = {};

    jwtRefreshStrategy = new JwtRefreshStrategy(
      mockConfigService as ConfigService,
      mockAccessTokenRepository as AccessTokenRepositoryPort,
    );
  });

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(jwtRefreshStrategy).toBeDefined();
      expect(mockConfigService.get).toHaveBeenCalledWith('jwt.secret');
    });
  });
});
