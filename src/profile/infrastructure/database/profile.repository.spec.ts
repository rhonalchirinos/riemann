/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { ProfileRepository } from './profile.repository';
import { PrismaService } from 'src/configuration/database/prisma.service';
import { Profile } from 'src/profile/domain/profile';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { PrismaClient } from '@prisma/client';

describe('ProfileRepository', () => {
  let repository: ProfileRepository;
  let prismaMock: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    prismaMock = mockDeep<PrismaClient>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileRepository,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    repository = module.get<ProfileRepository>(ProfileRepository);
  });

  describe('findById', () => {
    it('should return a profile when found', async () => {
      const mockProfile: Profile = {
        id: 1,
        name: 'John Doe',
        email: 'johndoe@example.com',
        password: 'hashedpassword',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: null,
        employees: [],
      };
      prismaMock.user.findUnique.mockResolvedValue(mockProfile);

      const result = await repository.findById(1);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: repository['includeRelations'],
      });
      expect(result).toEqual(mockProfile);
    });

    it('should return null when no profile is found', async () => {
      prismaMock.user.findUnique.mockResolvedValue(null);

      const result = await repository.findById(1);

      expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: repository['includeRelations'],
      });
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return the updated profile', async () => {
      const mockProfile: Profile = {
        id: 1,
        name: 'John Doe Updated',
        email: 'johndoeupdated@example.com',
        password: 'updatedhashedpassword',
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        employees: [],
      };
      const updateData = { name: 'John Doe Updated' };
      prismaMock.user.update.mockResolvedValue(mockProfile);

      const result = await repository.update(1, updateData);

      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
        include: repository['includeRelations'],
      });
      expect(result).toEqual(mockProfile);
    });

    it('should throw an error if update fails', async () => {
      const updateData = { name: 'Invalid Update' };
      prismaMock.user.update.mockRejectedValue(new Error('Update failed'));

      await expect(repository.update(1, updateData)).rejects.toThrow('Update failed');
      expect(prismaMock.user.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
        include: repository['includeRelations'],
      });
    });
  });
});
