import { Test, TestingModule } from '@nestjs/testing';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from './login.usecase';
import { EncryptionService } from '../services/encryption.service';
import { AccessTokenDto } from './dtos/access-token.dto';
import { AccessTokenRepositoryPort } from 'src/auth/domain/repositories/access-token.repository';

import { type UserRepositoryPort } from '@auth/domain/repositories/user.repository';

describe('LoginUseCase', () => {
  let loginUseCase: LoginUseCase;

  let mockAuthRepository: any;
  let mockAccessTokenRepository: any;
  let mockEncryptionService: any;

  beforeEach(async () => {
    mockAuthRepository = {
      findByEmail: jest.fn(),
    } as unknown as jest.Mocked<UserRepositoryPort>;

    mockAccessTokenRepository = {
      create: jest.fn(),
    } as unknown as jest.Mocked<EncryptionService>;

    mockEncryptionService = {
      comparePassword: jest.fn(),
    } as unknown as jest.Mocked<EncryptionService>;

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        JwtModule.register({
          secret: 'test-secret',
        }),
      ],
      providers: [
        {
          provide: LoginUseCase,
          useFactory: (
            authRepository: UserRepositoryPort,
            accessTokenRepository: AccessTokenRepositoryPort,
            jwtService: JwtService,
            encryptionService: EncryptionService,
          ) => {
            return new LoginUseCase(
              authRepository,
              accessTokenRepository,
              jwtService,
              encryptionService,
            );
          },
          inject: [
            'UserRepositoryPort',
            'AccessTokenRepositoryPort',
            JwtService,
            'EncryptionService',
          ],
        },
        {
          provide: 'UserRepositoryPort',
          useValue: mockAuthRepository,
        },
        {
          provide: 'AccessTokenRepositoryPort',
          useValue: mockAccessTokenRepository,
        },
        {
          provide: 'EncryptionService',
          useValue: mockEncryptionService,
        },
      ],
    }).compile();

    loginUseCase = module.get<LoginUseCase>(LoginUseCase);
  });

  it('should return an access token for valid credentials', async () => {
    const mockUser = { id: '1', email: 'test@example.com', password: 'hashedPassword' };
    const mockAccessToken: AccessTokenDto = {
      token: 'mockAccessToken',
      refresh: '',
      expiresAt: undefined,
    };
    mockAccessTokenRepository.create.mockResolvedValueOnce(mockAccessToken);
    mockAuthRepository.findByEmail.mockResolvedValueOnce(mockUser);
    mockEncryptionService.comparePassword.mockResolvedValueOnce(true);

    const result = await loginUseCase.execute({ email: 'test@example.com', password: 'password' });

    expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
    expect(mockEncryptionService.comparePassword).toHaveBeenCalledWith(
      'password',
      'hashedPassword',
    );
    expect(result).toHaveProperty('token');
    expect(result).toHaveProperty('refresh');
    expect(result).toHaveProperty('expiresAt');
  });

  it('should throw UnauthorizedException for invalid password', async () => {
    const mockUser = { id: '1', email: 'test@example.com', password: 'hashedPassword' };

    mockAuthRepository.findByEmail.mockResolvedValueOnce(mockUser);
    mockEncryptionService.comparePassword.mockResolvedValueOnce(false);

    await expect(
      loginUseCase.execute({ email: 'test@example.com', password: 'wrongPassword' }),
    ).rejects.toThrow(UnauthorizedException);
    expect(mockEncryptionService.comparePassword).toHaveBeenCalledWith(
      'wrongPassword',
      'hashedPassword',
    );
    expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
  });

  it('should throw UnauthorizedException for non-existent user', async () => {
    mockAuthRepository.findByEmail.mockResolvedValueOnce(null);

    await expect(
      loginUseCase.execute({ email: 'nonexistent@example.com', password: 'password' }),
    ).rejects.toThrow(UnauthorizedException);

    expect(mockAuthRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');
  });

  it('should throw UnauthorizedException when email or password is missing', async () => {
    await expect(loginUseCase.execute({ email: '', password: 'password' })).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(loginUseCase.execute({ email: 'test@example.com', password: '' })).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
