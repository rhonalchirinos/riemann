import { Test, TestingModule } from '@nestjs/testing';
import { ProfileCacheRepository } from './profile-cache.repository';
import { Cache } from '@nestjs/cache-manager';
import { ProfileRepositoryPort } from 'src/profile/domain/rapositories/profile.repository';
import { Profile } from 'src/profile/domain/profile';
import { Prisma } from '@prisma/client';

describe('ProfileCacheRepository', () => {
  let repository: ProfileCacheRepository;
  let mockCache: Partial<Cache>;
  let mockProfileRepo: Partial<ProfileRepositoryPort>;

  beforeEach(async () => {
    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    mockProfileRepo = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: ProfileCacheRepository,
          useFactory: () =>
            new ProfileCacheRepository(
              mockProfileRepo as ProfileRepositoryPort,
              mockCache as Cache,
            ),
        },
      ],
    }).compile();

    repository = module.get<ProfileCacheRepository>(ProfileCacheRepository);
  });

  describe('findById', () => {
    it('should return cached profile if it exists', async () => {
      const mockProfile: Profile = { id: 1, name: 'Test Profile' } as Profile;
      jest.spyOn(mockCache, 'get').mockResolvedValue(mockProfile);

      const result = await repository.findById(1);

      expect(mockCache.get).toHaveBeenCalledWith('profile:1');
      expect(result).toEqual(mockProfile);
    });

    it('should fetch profile from repository if not in cache and cache it', async () => {
      const mockProfile: Profile = { id: 1, name: 'Test Profile' } as Profile;
      jest.spyOn(mockCache, 'get').mockResolvedValue(null);
      jest.spyOn(mockProfileRepo, 'findById').mockResolvedValue(mockProfile);

      const result = await repository.findById(1);

      expect(mockCache.get).toHaveBeenCalledWith('profile:1');
      expect(mockProfileRepo.findById).toHaveBeenCalledWith(1, undefined);
      expect(mockCache.set).toHaveBeenCalledWith('profile:1', mockProfile, 1000 * 60 * 10);
      expect(result).toEqual(mockProfile);
    });
  });

  describe('update', () => {
    it('should update the profile and invalidate the cache', async () => {
      const mockProfile: Profile = { id: 1, name: 'Updated Profile' } as Profile;
      const mockUpdateInput: Prisma.UserUpdateInput = { name: 'Updated Profile' };
      jest.spyOn(mockProfileRepo, 'update').mockResolvedValue(mockProfile);

      const result = await repository.update(1, mockUpdateInput);

      expect(mockProfileRepo.update).toHaveBeenCalledWith(1, mockUpdateInput, undefined);
      expect(mockCache.del).toHaveBeenCalledWith('profile:1');
      expect(result).toEqual(mockProfile);
    });
  });
});
