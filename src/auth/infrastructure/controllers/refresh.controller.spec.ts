import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { RefreshController } from './refresh.controller';
import { RefreshUseCase } from 'src/auth/application/usecases/refresh-token.usecase';
import { JwtRefreshGuard } from '../guards/jwt-refresh.guard';

import request from 'supertest';
import { App } from 'supertest/types';
import { mockJwtAuthGuard } from 'src/shared/mock-jwt-auth-guard';

describe('RefreshController (e2e)', () => {
  let app: INestApplication;
  const mockRefreshUseCase = {
    execute: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [RefreshController],
      providers: [
        {
          provide: RefreshUseCase,
          useValue: mockRefreshUseCase,
        },
      ],
    })
      .overrideGuard(JwtRefreshGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/refresh', () => {
    it('should return refreshed data when use case executes successfully', async () => {
      const mockAccessToken = 'mockAccessToken';
      const mockResponseData = { token: 'newAccessToken' };

      mockRefreshUseCase.execute.mockResolvedValueOnce(mockResponseData);

      const response = await request(app.getHttpServer() as unknown as App)
        .get('/auth/refresh')
        .set('Authorization', `Bearer ${mockAccessToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ data: mockResponseData });
      expect(mockRefreshUseCase.execute).toHaveBeenCalledWith('mock-access-token');
    });

    it('should return an error when use case throws an exception', async () => {
      const mockAccessToken = 'mockAccessToken';

      mockRefreshUseCase.execute.mockImplementation(() => {
        throw new Error('Internal server error');
      });

      const response = await request(app.getHttpServer() as unknown as App)
        .get('/auth/refresh')
        .set('Authorization', `Bearer ${mockAccessToken}`);

      expect(response.status).toBe(500);
      expect(response.body.message).toBe('Internal server error');
      expect(mockRefreshUseCase.execute).toHaveBeenCalledWith('mock-access-token');
    });
  });
});
