import { Test, TestingModule } from '@nestjs/testing';
import { CacheAccessTokenRepository } from './cache-access-token.repository';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { AccessToken } from '@prisma/client';
import { PG_ACCESS_TOKEN_REPOSITORY } from '../database/access-token.repository';

describe('CacheAccessTokenRepository', () => {
  let repository: CacheAccessTokenRepository;
  let cacheManagerMock: any;
  let accessTokenRepositoryMock: any;

  beforeEach(async () => {
    cacheManagerMock = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    accessTokenRepositoryMock = {
      findById: jest.fn(),
      create: jest.fn(),
      findByRefreshToken: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheAccessTokenRepository,
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
        { provide: PG_ACCESS_TOKEN_REPOSITORY, useValue: accessTokenRepositoryMock },
      ],
    }).compile();

    repository = module.get<CacheAccessTokenRepository>(CacheAccessTokenRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findById', () => {
    it('should return the access token from cache if it exists', async () => {
      const mockAccessToken: AccessToken = {
        id: '1',
        refreshToken: 'token',
        expiresAt: new Date(),
        createdAt: new Date(),
        userId: 1,
      };
      cacheManagerMock.get.mockResolvedValueOnce(mockAccessToken);

      const result = await repository.findById('1');

      expect(cacheManagerMock.get).toHaveBeenCalledWith('1');
      expect(result).toEqual(mockAccessToken);
    });

    it('should fetch from repository and cache the result if not in cache', async () => {
      const mockAccessToken: AccessToken = {
        id: '1',
        userId: 1,
        refreshToken: 'token',
        expiresAt: new Date(),
        createdAt: new Date(),
      };
      cacheManagerMock.get.mockResolvedValueOnce(null);
      accessTokenRepositoryMock.findById.mockResolvedValueOnce(mockAccessToken);

      const result = await repository.findById('1');

      expect(cacheManagerMock.get).toHaveBeenCalledWith('1');
      expect(accessTokenRepositoryMock.findById).toHaveBeenCalledWith('1');
      expect(cacheManagerMock.set).toHaveBeenCalledWith('1', mockAccessToken, 60 * 1000);
      expect(result).toEqual(mockAccessToken);
    });

    it('should return null if the access token does not exist', async () => {
      cacheManagerMock.get.mockResolvedValueOnce(null);
      accessTokenRepositoryMock.findById.mockResolvedValueOnce(null);

      const result = await repository.findById('1');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create an access token and cache it', async () => {
      const mockAccessToken: AccessToken = {
        id: '1',
        userId: 1,
        refreshToken: 'token',
        expiresAt: new Date(),
        createdAt: new Date(),
      };
      accessTokenRepositoryMock.create.mockResolvedValueOnce(mockAccessToken);

      const result = await repository.create({
        id: '1',
        user: { connect: { id: 1 } },
        refreshToken: 'token',
        expiresAt: new Date(),
        createdAt: new Date(),
      });

      expect(accessTokenRepositoryMock.create).toHaveBeenCalled();
      expect(cacheManagerMock.set).toHaveBeenCalledWith(mockAccessToken.id, mockAccessToken, 60);
      expect(result).toEqual(mockAccessToken);
    });
  });

  describe('findByRefreshToken', () => {
    it('should delegate to the underlying repository', async () => {
      const mockAccessToken: AccessToken = {
        id: '1',
        userId: 1,
        refreshToken: 'token',
        expiresAt: new Date(),
        createdAt: new Date(),
      };
      accessTokenRepositoryMock.findByRefreshToken.mockResolvedValueOnce(mockAccessToken);

      const result = await repository.findByRefreshToken('token');

      expect(accessTokenRepositoryMock.findByRefreshToken).toHaveBeenCalledWith('token');
      expect(result).toEqual(mockAccessToken);
    });
  });

  describe('delete', () => {
    it('should delete the access token from cache and repository', async () => {
      const mockAccessToken: AccessToken = {
        id: '1',
        userId: 1,
        refreshToken: 'token',
        expiresAt: new Date(),
        createdAt: new Date(),
      };

      await repository.delete(mockAccessToken);

      expect(cacheManagerMock.del).toHaveBeenCalledWith(mockAccessToken.id);
      expect(accessTokenRepositoryMock.delete).toHaveBeenCalledWith(mockAccessToken);
    });
  });
});
