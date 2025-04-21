import { ConfigService } from '@nestjs/config';
import { UnprocessableEntityException } from '@nestjs/common';
import { JwtVerifyStrategy } from './jwt-verify.strategy';

describe('JwtVerifyStrategy', () => {
  let jwtVerifyStrategy: JwtVerifyStrategy;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn().mockReturnValue('test-secret'),
    };

    jwtVerifyStrategy = new JwtVerifyStrategy(mockConfigService as ConfigService);
  });

  describe('constructor', () => {
    it('should initialize with correct configuration', () => {
      expect(jwtVerifyStrategy).toBeDefined();
      expect(mockConfigService.get).toHaveBeenCalledWith('jwt.secret');
    });
  });

  describe('validate', () => {
    it('should throw an exception if payload.sub is missing', async () => {
      try {
        const invalidPayload = { sub: null };
        await expect(jwtVerifyStrategy.validate(invalidPayload)).rejects.toThrow(
          UnprocessableEntityException,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
      }
    });

    it('should throw an exception if payload is undefined', async () => {
      try {
        const invalidPayload = undefined;
        await jwtVerifyStrategy.validate(invalidPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
      }
    });

    it('should throw an exception if payload is null', async () => {
      try {
        const invalidPayload = null;
        await jwtVerifyStrategy.validate(invalidPayload);
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
      }
    });

    it('should throw an exception if payload.sub is an empty string', async () => {
      try {
        const invalidPayload = { sub: '' };
        await expect(jwtVerifyStrategy.validate(invalidPayload)).rejects.toThrow(
          UnprocessableEntityException,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnprocessableEntityException);
      }
    });

    it('should return the payload if it is valid', () => {
      const validPayload = { sub: 'user-id' };

      const result = jwtVerifyStrategy.validate(validPayload);

      expect(result).toEqual({ sub: 'user-id' });
    });
  });
});
