/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { PrismaService } from 'src/configuration/database/prisma.service';
import { Prisma, User } from '@prisma/client';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: null,
      };
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await userRepository.findById(1);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toEqual(mockUser);
    });

    it('should return null if no user is found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      const result = await userRepository.findById(1);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return a user if found', async () => {
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: null,
      };
      mockPrismaService.user.findUnique.mockResolvedValueOnce(mockUser);

      const result = await userRepository.findByEmail('test@example.com');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null if no user is found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValueOnce(null);

      const result = await userRepository.findByEmail('test@example.com');

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a new user', async () => {
      const mockUser: User = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: null,
      };
      const mockInput: Prisma.UserCreateInput = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashedPassword',
      };

      mockPrismaService.user.create.mockResolvedValueOnce(mockUser);

      const result = await userRepository.create(mockInput);

      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: 'test@example.com',
          name: 'Test User',
          password: 'hashedPassword',
        },
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('exitsEmail', () => {
    it('should return true if email exists', async () => {
      mockPrismaService.user.count.mockResolvedValueOnce(1);

      const result = await userRepository.exitsEmail('test@example.com');

      expect(prismaService.user.count).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toBe(true);
    });

    it('should return false if email does not exist', async () => {
      mockPrismaService.user.count.mockResolvedValueOnce(0);

      const result = await userRepository.exitsEmail('test@example.com');

      expect(prismaService.user.count).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(result).toBe(false);
    });
  });

  describe('update', () => {
    it('should update and return the updated user', async () => {
      const mockUser: User = {
        id: 1,
        email: 'updated@example.com',
        name: 'Updated User',
        password: 'updatedPassword',
        createdAt: new Date(),
        updatedAt: null,
        emailVerified: false,
      };
      const mockInput: Prisma.UserUpdateInput = {
        email: 'updated@example.com',
        name: 'Updated User',
      };

      mockPrismaService.user.update.mockResolvedValueOnce(mockUser);

      const result = await userRepository.update(1, mockInput);

      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: mockInput,
      });
      expect(result).toEqual(mockUser);
    });
  });
});
