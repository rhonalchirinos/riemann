import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, INestApplication } from '@nestjs/common';

import { VerifyController } from './verify.controller';
import { VerificationEmailUseCase } from 'src/auth/application/usecases/verification-email.usecase';
import { JwtVerifyGuard } from '../guards/jwt-verify.guard';
import request from 'supertest';
import { App } from 'supertest/types';

describe('VerifyController (e2e)', () => {
  let app: INestApplication;
  let mockVerificationEmail: Partial<VerificationEmailUseCase>;

  const mockJwtVerifyGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = {
        sub: 'mock-access-token',
      };
      return true;
    }),
  };

  beforeEach(async () => {
    mockVerificationEmail = {
      verifyUser: jest.fn(),
      execute: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [VerifyController],
      providers: [
        {
          provide: VerificationEmailUseCase,
          useValue: mockVerificationEmail,
        },
      ],
    })
      .overrideGuard(JwtVerifyGuard)
      .useValue(mockJwtVerifyGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /auth/verify', () => {
    it('should verify the user successfully', async () => {
      mockVerificationEmail.verifyUser = jest.fn().mockResolvedValueOnce(true);

      await request(app.getHttpServer() as unknown as App)
        .post('/auth/verify')
        .set('Authorization', 'Bearer valid-token')
        .expect(204);

      expect(mockVerificationEmail.verifyUser).toHaveBeenCalledWith('mock-access-token');
    });

    it('should fail if JWT is missing', async () => {
      mockJwtVerifyGuard.canActivate = jest.fn((context: ExecutionContext) => {
        return false;
      });
      await request(app.getHttpServer() as unknown as App)
        .post('/auth/verify')
        .expect(403);
    });
  });

  describe('GET /auth/verify', () => {
    it('should verify email successfully', async () => {
      (mockVerificationEmail.execute as jest.Mock).mockResolvedValueOnce(undefined);

      await request(app.getHttpServer() as unknown as App)
        .get('/auth/verify')
        .query({ email: 'test@example.com' })
        .expect(204);

      expect(mockVerificationEmail.execute).toHaveBeenCalledWith('test@example.com');
    });

    it('should fail if email is missing', async () => {
      await request(app.getHttpServer() as unknown as App)
        .get('/auth/verify')
        .expect(422)
        .expect((res) => {
          expect(res.body.message).toEqual('Email is required');
        });
    });

    it('should fail if email format is invalid', async () => {
      await request(app.getHttpServer() as unknown as App)
        .get('/auth/verify')
        .query({ email: 'invalid-email' })
        .expect(422)
        .expect((res) => {
          expect(res.body.message).toEqual('Invalid email format');
        });
    });
  });
});
