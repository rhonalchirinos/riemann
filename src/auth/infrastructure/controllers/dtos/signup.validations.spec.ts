import { UnprocessableEntityException } from '@nestjs/common';
import { SignupValidation } from './signup.validations';
import { UserRepositoryPort } from '@auth/domain/repositories/user.repository';
import { SignupUserDto } from '@auth/application/usecases/dtos/signup-user.dto';

describe('SignupValidation', () => {
  let signupValidation: SignupValidation;
  let mockUserRepository: any;

  beforeEach(() => {
    mockUserRepository = {
      exitsEmail: jest.fn(),
    } as unknown as jest.Mocked<UserRepositoryPort>;

    signupValidation = new SignupValidation(mockUserRepository as jest.Mocked<UserRepositoryPort>);
  });

  it('should validate and return the transformed data for valid input', async () => {
    const validInput: SignupUserDto = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: 'securePassword123',
    };

    mockUserRepository.exitsEmail.mockResolvedValueOnce(false);

    const result = await signupValidation.transform(validInput);

    expect(result).toEqual(validInput);
    expect(mockUserRepository.exitsEmail).toHaveBeenCalledWith(validInput.email);
  });

  it('should throw BadRequestException for invalid input (short name)', async () => {
    const invalidInput: SignupUserDto = {
      name: 'J',
      email: 'john.doe@example.com',
      password: 'securePassword123',
    };

    await expect(signupValidation.transform(invalidInput)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('should throw BadRequestException for invalid input (invalid email)', async () => {
    const invalidInput: SignupUserDto = {
      name: 'John Doe',
      email: 'invalid-email',
      password: 'securePassword123',
    };

    await expect(signupValidation.transform(invalidInput)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('should throw BadRequestException for invalid input (short password)', async () => {
    const invalidInput: SignupUserDto = {
      name: 'John Doe',
      email: 'john.doe@example.com',
      password: '123',
    };

    await expect(signupValidation.transform(invalidInput)).rejects.toThrow(
      UnprocessableEntityException,
    );
  });

  it('should throw BadRequestException if email already exists', async () => {
    const input: SignupUserDto = {
      name: 'John Doe',
      email: 'existing.email@example.com',
      password: 'securePassword123',
    };

    mockUserRepository.exitsEmail.mockResolvedValueOnce(true);

    await expect(signupValidation.transform(input)).rejects.toThrow(UnprocessableEntityException);
    expect(mockUserRepository.exitsEmail).toHaveBeenCalledWith(input.email);
  });
});
