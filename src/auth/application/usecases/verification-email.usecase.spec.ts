import { Test, TestingModule } from '@nestjs/testing';

import { EncryptionService } from '../services/encryption.service';

import { VerificationEmailUseCase } from './verification-email.usecase';
import { CacheModule } from '@nestjs/cache-manager';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

describe('VerificationEmailUseCase', () => {
  let verificationEmail: VerificationEmailUseCase;

  const mockMailContext = {
    sendMail: jest.fn(),
  };

  const mockUserRepository = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    exitsEmail: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        CacheModule.register({ ttl: 60, max: 1000 }),
        JwtModule.register({ secret: 'FynVfpT19fKeEvCS' }),
      ],
      providers: [
        EncryptionService,
        {
          provide: VerificationEmailUseCase,
          useFactory: (cache: Cache, jwtService: JwtService) =>
            new VerificationEmailUseCase(
              mockUserRepository,
              cache,
              mockMailContext as unknown as MailerService,
              jwtService,
            ),
          inject: [CACHE_MANAGER, JwtService],
        },
      ],
    }).compile();
    verificationEmail = module.get<VerificationEmailUseCase>(VerificationEmailUseCase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(verificationEmail).toBeDefined();
  });

  describe('send verification email', () => {
    it('should send a verification email successfully', async () => {
      const mockUser = {
        id: 'mock-user-id',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockUserRepository.findByEmail.mockResolvedValueOnce(mockUser);
      mockMailContext.sendMail.mockResolvedValueOnce({});
      await verificationEmail.execute(mockUser.email);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(mockUser.email);
      expect(mockMailContext.sendMail).toHaveBeenCalledWith({
        to: mockUser.email,
        subject: expect.any(String),
        template: './confirmation',
        context: {
          name: mockUser.name,
          token: expect.any(String),
        },
      });
    });

    it('should throw an error if the user does not exist', async () => {
      mockUserRepository.findByEmail.mockResolvedValueOnce(null);

      await verificationEmail.execute('nonexistent@example.com');

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('nonexistent@example.com');

      expect(mockMailContext.sendMail).not.toHaveBeenCalledWith({});
    });

    it('should handle errors during email sending', async () => {
      jest.clearAllMocks();

      const mockUser = {
        id: 'mock-user-id',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockUserRepository.findByEmail.mockResolvedValueOnce(mockUser);
      mockMailContext.sendMail.mockImplementation(() => {
        throw new Error('Email service error');
      });

      await expect(verificationEmail.execute(mockUser.email)).rejects.toThrow(
        'Email service error',
      );

      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(mockMailContext.sendMail).toHaveBeenCalled();
    });

    describe('verify user', () => {
      it('should throw an error if the user is not found', async () => {
        mockUserRepository.findById.mockResolvedValueOnce(null);
        await expect(verificationEmail.verifyUser('123')).rejects.toThrow('User not found');
        expect(mockUserRepository.findById).toHaveBeenCalledWith(123);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
      });

      it('should update the user if email is not verified', async () => {
        const mockUser = {
          id: 123,
          emailVerified: false,
        };
        mockUserRepository.findById.mockResolvedValueOnce(mockUser);
        await verificationEmail.verifyUser('123');
        expect(mockUserRepository.findById).toHaveBeenCalledWith(123);
        expect(mockUserRepository.update).toHaveBeenCalledWith(123, { emailVerified: true });
      });

      it('should not update the user if email is already verified', async () => {
        const mockUser = {
          id: 123,
          emailVerified: true,
        };
        mockUserRepository.findById.mockResolvedValueOnce(mockUser);
        await verificationEmail.verifyUser('123');
        expect(mockUserRepository.findById).toHaveBeenCalledWith(123);
        expect(mockUserRepository.update).not.toHaveBeenCalled();
      });
    });
  });
});
