import { Test, TestingModule } from '@nestjs/testing';
import { LoginController } from './login.controller';
import { LoginUseCase } from 'src/auth/application/usecases/login.usecase';
import { LoginDto } from '@auth/application/usecases/dtos/login.dto';
import { INestApplication, UnauthorizedException } from '@nestjs/common';
import { App } from 'supertest/types';
import request from 'supertest';
import { faker } from '@faker-js/faker';

describe('LoginController (e2e)', () => {
  let app: INestApplication;

  const mockLoginUseCase = {
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [LoginController],
      providers: [
        {
          provide: LoginUseCase,
          useValue: mockLoginUseCase,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    jest.clearAllMocks();
    await app.close();
  });

  describe('POST /auth/login', () => {
    it('should call LoginUseCase.execute with the correct arguments', async () => {
      const loginDto: LoginDto = {
        email: 'testemail@testing.com',
        password: 'teasdd1212',
      };

      const output = {
        data: {
          token: faker.string.uuid(),
          refresh: faker.string.uuid(),
          expiresAt: 3600,
        },
      };

      mockLoginUseCase.execute.mockResolvedValueOnce(output);

      await request(app.getHttpServer() as unknown as App)
        .post('/auth/login')
        .send(loginDto)
        .expect(201);

      expect(mockLoginUseCase.execute).toHaveBeenCalledWith(loginDto);
    });

    it('should return the expected response', async () => {
      const loginDto: LoginDto = {
        email: 'testemail@testing.com',
        password: 'testpassword1212',
      };

      const mockResponse = {
        data: {
          token: faker.string.uuid(),
          refresh: faker.string.uuid(),
          expiresAt: 3600,
        },
      };

      mockLoginUseCase.execute.mockResolvedValueOnce(mockResponse);

      const response = await request(app.getHttpServer() as unknown as App)
        .post('/auth/login')
        .send(loginDto)
        .expect(201);

      expect(response.body).toEqual({ data: mockResponse });
    });

    it('should throw a validation error for invalid input', async () => {
      const invalidLoginDto = { email: '', password: '' };

      const response = await request(app.getHttpServer() as unknown as App)
        .post('/auth/login')
        .send(invalidLoginDto)
        .expect(422);

      expect(response.body.message).toEqual([
        {
          validation: 'email',
          code: 'invalid_string',
          message: 'Invalid email format',
          path: ['email'],
        },
        {
          code: 'too_small',
          minimum: 1,
          type: 'string',
          inclusive: true,
          exact: false,
          message: 'Password is required',
          path: ['password'],
        },
      ]);
      expect(mockLoginUseCase.execute).not.toHaveBeenCalled();
    });

    it('should throw an error if LoginUseCase.execute fails', async () => {
      const loginDto: LoginDto = {
        email: 'testemail@testing.com',
        password: 'testpassword1212',
      };

      mockLoginUseCase.execute.mockImplementation(() => {
        throw new UnauthorizedException('Invalid credentials');
      });

      await request(app.getHttpServer() as unknown as App)
        .post('/auth/login')
        .send(loginDto)
        .expect(401);
    });
  });
});
