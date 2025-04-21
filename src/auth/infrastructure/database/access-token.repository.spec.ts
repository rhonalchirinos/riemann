/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { AccessTokenRepository } from './access-token.repository';
import { PrismaService } from 'src/configuration/database/prisma.service';
import { AccessToken, Prisma } from '@prisma/client';

describe('AccessTokenRepository', () => {
  let accessTokenRepository: AccessTokenRepository;
  let prismaService: PrismaService;

  const mockPrismaService = {
    accessToken: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessTokenRepository,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    accessTokenRepository = module.get<AccessTokenRepository>(AccessTokenRepository);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return an access token if found', async () => {
      const mockToken: AccessToken = {
        id: 'token-id',
        refreshToken: 'refresh-token',
        expiresAt: new Date(),
        userId: 1,
        createdAt: new Date(),
      };
      mockPrismaService.accessToken.findUnique.mockResolvedValueOnce(mockToken);

      const result = await accessTokenRepository.findById('token-id');

      expect(prismaService.accessToken.findUnique).toHaveBeenCalledWith({
        where: { id: 'token-id' },
      });
      expect(result).toEqual(mockToken);
    });

    it('should return null if no access token is found', async () => {
      mockPrismaService.accessToken.findUnique.mockResolvedValueOnce(null);

      const result = await accessTokenRepository.findById('token-id');

      expect(prismaService.accessToken.findUnique).toHaveBeenCalledWith({
        where: { id: 'token-id' },
      });
      expect(result).toBeNull();
    });
  });

  describe('findByRefreshToken', () => {
    it('should return an access token if found by refresh token', async () => {
      const mockToken: AccessToken = {
        id: 'token-id',
        refreshToken: 'refresh-token',
        expiresAt: new Date(),
        userId: 1,
        createdAt: new Date(),
      };
      mockPrismaService.accessToken.findUnique.mockResolvedValueOnce(mockToken);

      const result = await accessTokenRepository.findByRefreshToken('refresh-token');

      expect(prismaService.accessToken.findUnique).toHaveBeenCalledWith({
        where: { refreshToken: 'refresh-token' },
      });
      expect(result).toEqual(mockToken);
    });

    it('should return null if no access token is found by refresh token', async () => {
      mockPrismaService.accessToken.findUnique.mockResolvedValueOnce(null);

      const result = await accessTokenRepository.findByRefreshToken('refresh-token');

      expect(prismaService.accessToken.findUnique).toHaveBeenCalledWith({
        where: { refreshToken: 'refresh-token' },
      });
      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create and return a new access token', async () => {
      const mockToken: AccessToken = {
        id: 'token-id',
        refreshToken: 'refresh-token',
        expiresAt: new Date(),
        userId: 1,
        createdAt: new Date(),
      };
      const mockInput: Prisma.AccessTokenCreateInput = {
        id: 'token-id',
        refreshToken: 'refresh-token',
        expiresAt: new Date(),
        user: { connect: { id: 1 } },
      };

      mockPrismaService.accessToken.create.mockResolvedValueOnce(mockToken);

      const result = await accessTokenRepository.create(mockInput);

      expect(prismaService.accessToken.create).toHaveBeenCalledWith({
        data: mockInput,
      });
      expect(result).toEqual(mockToken);
    });
  });

  describe('delete', () => {
    it('should delete an access token', async () => {
      const mockToken: AccessToken = {
        id: 'token-id',
        refreshToken: 'refresh-token',
        expiresAt: new Date(),
        userId: 1,
        createdAt: new Date(),
      };

      mockPrismaService.accessToken.delete.mockResolvedValueOnce(undefined);

      await accessTokenRepository.delete(mockToken);

      expect(prismaService.accessToken.delete).toHaveBeenCalledWith({
        where: { id: 'token-id' },
      });
    });
  });
});
