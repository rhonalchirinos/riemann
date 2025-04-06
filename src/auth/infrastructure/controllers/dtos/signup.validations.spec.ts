import { Test, TestingModule } from '@nestjs/testing';
import { PG_USER_REPOSITORY, UserRepository } from '@auth/infrastructure/database/user.repository';

import { SignupUsecase } from '@auth/application/usecases/signup.usecase';
import { EncryptionService } from '@auth/application/services/encryption.service';
import { PrismaService } from '@database/prisma.service';
import { DatabaseModule } from '@database/database.module';

import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { SignupValidation } from './../dtos/signup.validations';
import { BadRequestException } from '@nestjs/common';

export type MockContext = { prisma: DeepMockProxy<PrismaClient> };

export const createMockContext = (): MockContext => {
  return {
    prisma: mockDeep<PrismaClient>({
      user: {
        create: jest.fn(),
        findUnique: jest.fn(),
        count: jest.fn(),
      },
    }),
  };
};

describe('Signup Validations', () => {
  let mockContext: MockContext;
  let signupValidation: SignupValidation;

  beforeEach(async () => {
    mockContext = createMockContext();
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [
        SignupValidation,
        EncryptionService,
        SignupUsecase,
        {
          provide: PG_USER_REPOSITORY,
          useClass: UserRepository,
        },
        {
          provide: PrismaService,
          useFactory: () => {
            return mockContext.prisma;
          },
        },
      ],
    }).compile();

    signupValidation = module.get<SignupValidation>(SignupValidation);
  });

  it('should be defined', () => {
    expect(signupValidation).toBeDefined();
  });

  describe('Validate signup input', () => {
    it('verify if email is valid', async () => {
      expect.assertions(2);
      try {
        await signupValidation.transform({
          email: 'testing',
          name: 'Testing User',
          password: 'HolaMundo#1200',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getResponse()).toEqual(
          expect.objectContaining({
            statusCode: 400,
            message: expect.arrayContaining([
              expect.objectContaining({
                validation: expect.any(String),
                code: expect.any(String),
                message: expect.any(String),
                path: expect.arrayContaining([expect.any(String)]),
              }),
            ]),
            error: 'Bad Request',
          }),
        );
      }
    });

    it('verify email if registers', async () => {
      mockContext.prisma.user.count.mockResolvedValue(1);
      expect.assertions(2);
      try {
        await signupValidation.transform({
          email: 'testing@gmail.com',
          name: 'Testing User',
          password: 'HolaMundo#1200',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getResponse()).toEqual(
          expect.objectContaining({
            statusCode: 400,
            message: [
              {
                code: 'custom',
                message: 'Email already in use',
                path: ['email'],
              },
            ],
            error: 'Bad Request',
          }),
        );
      }
    });

    it('all fields are null ', async () => {
      mockContext.prisma.user.count.mockResolvedValue(1);
      expect.assertions(3);
      try {
        await signupValidation.transform({
          email: undefined,
          name: undefined,
          password: undefined,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getResponse()).toEqual(
          expect.objectContaining({
            statusCode: 400,
            message: expect.arrayContaining([
              expect.objectContaining({
                code: expect.any(String),
                message: expect.any(String),
              }),
            ]),
            error: 'Bad Request',
          }),
        );
        expect(error.getResponse().message).toHaveLength(3);
      }
    });
  });
});
