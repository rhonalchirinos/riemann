import { UnprocessableEntityException } from '@nestjs/common';
import { LoginValidation } from './login.validations';
import { type LoginDto } from '@auth/application/usecases/dtos/login.dto';

describe('LoginValidation', () => {
  let loginValidation: LoginValidation;

  beforeEach(() => {
    loginValidation = new LoginValidation();
  });

  it('should validate and return the transformed data for valid input', async () => {
    const validInput: LoginDto = {
      email: 'user@example.com',
      password: 'securePassword123',
    };

    const result = await loginValidation.transform(validInput);

    expect(result).toEqual(validInput);
  });

  it('should throw UnprocessableEntityException for invalid email format', async () => {
    const invalidInput: LoginDto = {
      email: 'invalid-email',
      password: 'securePassword123',
    };

    await expect(loginValidation.transform(invalidInput)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('should throw UnprocessableEntityException for missing password', async () => {
    const invalidInput: Partial<LoginDto> = {
      email: 'user@example.com',
    };

    await expect(loginValidation.transform(invalidInput as LoginDto)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('should throw UnprocessableEntityException for empty input', async () => {
    const invalidInput = {};

    await expect(loginValidation.transform(invalidInput as LoginDto)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('should throw UnprocessableEntityException for empty email', async () => {
    const invalidInput: LoginDto = {
      email: '',
      password: 'securePassword123',
    };

    await expect(loginValidation.transform(invalidInput)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('should throw UnprocessableEntityException for empty password', async () => {
    const invalidInput: LoginDto = {
      email: 'user@example.com',
      password: '',
    };

    await expect(loginValidation.transform(invalidInput)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });
});
