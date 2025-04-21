import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, INestApplication, UnauthorizedException } from '@nestjs/common';
import { LogoutController } from './logout.controller';
import { LogoutUsecase } from 'src/auth/application/usecases/logout.usecase';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

import request from 'supertest';
import { App } from 'supertest/types';

describe('LogoutController (e2e)', () => {
  let app: INestApplication;

  const mockLogoutUsecase = {
    execute: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn((context: ExecutionContext) => {
      const request = context.switchToHttp().getRequest();
      request.user = {
        accessToken: 'mock-access-token',
        id: 'mock-user-id',
        email: 'user@example.com',
      };
      return true;
    }),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [LogoutController],
      providers: [
        {
          provide: LogoutUsecase,
          useValue: mockLogoutUsecase,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  describe('DELETE /auth/logout', () => {
    it('should call LogoutUsecase.execute with the correct access token', async () => {
      const mockAccessToken = 'mock-access-token';

      await request(app.getHttpServer() as unknown as App)
        .delete('/auth/logout')
        .set('Authorization', `Bearer ${mockAccessToken}`)
        .expect(200);

      expect(mockLogoutUsecase.execute).toHaveBeenCalledWith(mockAccessToken);
    });

    it('should return 401 if JwtAuthGuard denies access', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      mockJwtAuthGuard.canActivate.mockImplementation((context: ExecutionContext) => {
        throw new UnauthorizedException();
      });

      await request(app.getHttpServer() as unknown as App)
        .delete('/auth/logout')
        .expect(401);

      expect(mockLogoutUsecase.execute).not.toHaveBeenCalled();
    });
  });
});
