import { Test, TestingModule } from '@nestjs/testing';
import {
  PG_USER_REPOSITORY,
  UserRepository,
} from '@auth/infrastructure/database/user.repository';
import { DatabaseModule } from '@database/database.module';
import { SignupValidation } from '@auth/infrastructure/controllers/dtos/signup.validations';

import { PrismaService } from '@database/prisma.service';
import { EncryptionService } from '../services/encryption.service';

import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { VerificationEmailUseCase } from './verification.email.usecase';
import { CacheModule } from '@nestjs/cache-manager';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtModule } from '@nestjs/jwt';

export type MockContext = {
  prisma: DeepMockProxy<PrismaClient>;
  mail: DeepMockProxy<MailerService>;
};

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>({
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      },
    }),
    mail: mockDeep<MailerService>({
      sendMail: jest.fn(),
    }),
  };
};

describe('Verification Email UseCase', () => {
  let verificationEmail: VerificationEmailUseCase;
  let mockContext: MockContext;

  beforeEach(async () => {
    mockContext = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        DatabaseModule,
        CacheModule.register({ ttl: 60, max: 1000 }),
        JwtModule.register({ secret: 'FynVfpT19fKeEvCS' }),
      ],
      providers: [
        SignupValidation,
        EncryptionService,
        VerificationEmailUseCase,
        {
          provide: PG_USER_REPOSITORY,
          useClass: UserRepository,
        },
        {
          provide: MailerService,
          useFactory: () => mockContext.mail,
        },
        {
          provide: PrismaService,
          useFactory: () => mockContext.prisma,
        },
      ],
    }).compile();
    verificationEmail = module.get<VerificationEmailUseCase>(
      VerificationEmailUseCase,
    );
  });

  it('should be defined', () => {
    expect(verificationEmail).toBeDefined();
    expect(mockContext).toBeDefined();
  });
});
