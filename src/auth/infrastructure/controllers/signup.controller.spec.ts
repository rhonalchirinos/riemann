import { Test, TestingModule } from '@nestjs/testing';
import { SignupController } from './signup.controller';
import { SignupUsecase } from '@auth/application/usecases/signup.usecase';
import { VerificationEmailUseCase } from 'src/auth/application/usecases/verification-email.usecase';
import { INestApplication } from '@nestjs/common';

import request from 'supertest';
import { App } from 'supertest/types';
import { SignupValidation } from './dtos/signup.validations';

// filepath: src/auth/infrastructure/controllers/signup.controller.test.ts

describe('SignupController (e2e)', () => {
  let app: INestApplication;

  const mockSignupUsecase = {
    execute: jest.fn(),
  };

  const mockVerificationEmailUseCase = {
    sendVerificationEmail: jest.fn(),
  };

  const mockSignupValidation = {
    transform: jest.fn(),
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SignupController],
      providers: [
        {
          provide: SignupUsecase,
          useValue: mockSignupUsecase,
        },
        {
          provide: VerificationEmailUseCase,
          useValue: mockVerificationEmailUseCase,
        },
      ],
    })
      .overridePipe(SignupValidation)
      .useValue(mockSignupValidation)
      .compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/signup', () => {
    it('should successfully create a user and send a verification email', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };

      const body = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      mockSignupValidation.transform.mockResolvedValueOnce(body);
      mockSignupUsecase.execute.mockResolvedValueOnce(mockUser);
      mockVerificationEmailUseCase.sendVerificationEmail.mockResolvedValueOnce(undefined);

      const response = await request(app.getHttpServer() as unknown as App)
        .post('/auth/signup')
        .send(body)
        .expect(201);

      expect(response.body).toEqual({
        message: 'User created successfully',
        user: {
          id: mockUser.id,
          email: mockUser.email,
          name: mockUser.name,
        },
      });

      expect(mockSignupUsecase.execute).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
      expect(mockVerificationEmailUseCase.sendVerificationEmail).toHaveBeenCalledWith(mockUser);
    });

    it('should return an error if SignupUsecase throws an exception', async () => {
      mockSignupUsecase.execute.mockImplementation(() => {
        throw new Error('Signup failed');
      });

      const response = await request(app.getHttpServer() as unknown as App)
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(500);

      expect(response.body).toEqual({
        statusCode: 500,
        message: 'Internal server error',
      });

      expect(mockSignupUsecase.execute).toHaveBeenCalled();
      expect(mockVerificationEmailUseCase.sendVerificationEmail).not.toHaveBeenCalled();
    });

    it('should return an error if VerificationEmailUseCase throws an exception', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
      };

      mockSignupUsecase.execute.mockResolvedValueOnce(mockUser);
      mockVerificationEmailUseCase.sendVerificationEmail.mockImplementation(() => {
        throw new Error('Verification email failed');
      });

      const response = await request(app.getHttpServer() as unknown as App)
        .post('/auth/signup')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        })
        .expect(500);

      expect(response.body).toEqual({
        statusCode: 500,
        message: 'Internal server error',
      });

      expect(mockSignupUsecase.execute).toHaveBeenCalled();
      expect(mockVerificationEmailUseCase.sendVerificationEmail).toHaveBeenCalledWith(mockUser);
    });
  });
});
