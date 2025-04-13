import { Test, TestingModule } from '@nestjs/testing';
import { SignupUsecase } from './signup.usecase';
import { UserRepositoryPort } from '@auth/domain/repositories/user.repository.d';
import { EncryptionService } from '@auth/application/services/encryption.service';
import { SignupUserDto } from './dtos/signup-user.dto';
import { User } from '@prisma/client';

describe('SignupUsecase', () => {
  let signupUsecase: SignupUsecase;
  let mockUserRepository: any;
  let mockEncryptionService: any;

  beforeEach(async () => {
    mockUserRepository = {
      create: jest.fn(),
    } as unknown as jest.Mocked<UserRepositoryPort>;

    mockEncryptionService = {
      hashPassword: jest.fn(),
    } as unknown as jest.Mocked<EncryptionService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: SignupUsecase,
          useFactory: (
            userRepository: UserRepositoryPort,
            encryptionService: EncryptionService,
          ) => {
            return new SignupUsecase(userRepository, encryptionService);
          },
          inject: ['UserRepositoryPort', 'EncryptionService'],
        },
        { provide: 'UserRepositoryPort', useValue: mockUserRepository },
        { provide: 'EncryptionService', useValue: mockEncryptionService },
      ],
    }).compile();

    signupUsecase = module.get<SignupUsecase>(SignupUsecase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a user successfully', async () => {
    const userInfo: SignupUserDto = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    };

    const hashedPassword = 'hashedPassword123';
    const createdUser: User = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      emailVerified: false,
      createdAt: new Date(),
      updatedAt: null,
    };

    mockEncryptionService.hashPassword.mockResolvedValueOnce(hashedPassword);
    mockUserRepository.create.mockResolvedValueOnce(createdUser);

    const result = await signupUsecase.execute(userInfo);

    expect(mockEncryptionService.hashPassword).toHaveBeenCalledWith(userInfo.password);
    expect(mockUserRepository.create).toHaveBeenCalledWith({
      email: (userInfo.email ?? '').toLowerCase(),
      name: userInfo.name,
      password: hashedPassword,
    });
    expect(result).toEqual(createdUser);
  });

  it('should hash the password before saving', async () => {
    const userInfo: SignupUserDto = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    };

    const hashedPassword = 'hashedPassword123';
    mockEncryptionService.hashPassword.mockResolvedValueOnce(hashedPassword);

    await signupUsecase.execute(userInfo);

    expect(mockEncryptionService.hashPassword).toHaveBeenCalledWith(userInfo.password);
  });

  it('should throw an error if user creation fails', async () => {
    const userInfo: SignupUserDto = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    };

    mockEncryptionService.hashPassword.mockResolvedValueOnce('hashedPassword123');
    mockUserRepository.create.mockRejectedValueOnce(new Error('Database error'));

    await expect(signupUsecase.execute(userInfo)).rejects.toThrow('Database error');
  });
});
