import { Test, TestingModule } from '@nestjs/testing';

import { BadRequestException } from '@nestjs/common';
import { LoginValidation } from './login.validations';

describe('AuthController', () => {
  let loginValidation: LoginValidation;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [],
      providers: [LoginValidation],
    }).compile();

    loginValidation = module.get<LoginValidation>(LoginValidation);
  });

  it('should be defined', () => {
    expect(loginValidation).toBeDefined();
  });

  describe('Validate login input', () => {
    it('verify if email and password is valid', async () => {
      expect.assertions(2);
      try {
        await loginValidation.transform({
          email: undefined,
          password: undefined,
        });
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getResponse()).toEqual(
          expect.objectContaining({
            statusCode: 400,
            message: [
              {
                code: 'invalid_type',
                expected: 'string',
                message: 'Required',
                path: ['email'],
                received: 'undefined',
              },
              {
                code: 'invalid_type',
                expected: 'string',
                message: 'Required',
                path: ['password'],
                received: 'undefined',
              },
            ],

            error: 'Bad Request',
          }),
        );
      }
    });

    it('verify email if valid', async () => {
      expect.assertions(2);
      try {
        await loginValidation.transform({
          email: 'testing',
          password: 'HolaMundo#1200',
        });
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getResponse()).toEqual(
          expect.objectContaining({
            statusCode: 400,
            message: [
              {
                code: 'invalid_string',
                message: 'Invalid email format',
                path: ['email'],
                validation: 'email',
              },
            ],
            error: 'Bad Request',
          }),
        );
      }
    });

    it('verify email and password valid', async () => {
      expect.assertions(2);
      try {
        await loginValidation.transform({});
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.getResponse()).toEqual(
          expect.objectContaining({
            message: [
              {
                code: 'invalid_type',
                expected: 'string',
                received: 'undefined',
                path: ['email'],
                message: 'Required',
              },
              {
                code: 'invalid_type',
                expected: 'string',
                received: 'undefined',
                path: ['password'],
                message: 'Required',
              },
            ],
            error: 'Bad Request',
            statusCode: 400,
          }),
        );
      }
    });
  });
});
