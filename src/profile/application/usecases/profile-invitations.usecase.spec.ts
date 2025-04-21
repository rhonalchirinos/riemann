import { ProfileInvitationUsecase } from './profile-invitations.usecase';

import { Invitation, InvitationStatus, User } from '@prisma/client';
import { HttpException, NotFoundException } from '@nestjs/common';
import { Cache } from '@nestjs/cache-manager';
import { InvitationWithEnterprise } from 'src/profile/domain/invitation';
import { ProfileInvitationRepository } from 'src/profile/infrastructure/database/invitation.repository';
import { UserRepository } from 'src/auth/infrastructure/database/user.repository';

jest.mock('src/auth/infrastructure/database/user.repository');

describe('ProfileInvitationUsecase', () => {
  let usecase: ProfileInvitationUsecase;

  let invitationRepository: any;
  let userRepository: any;
  let cache: jest.Mocked<Cache>;

  beforeEach(() => {
    invitationRepository = {
      findAll: jest.fn(),
      findById: jest.fn(function (this: void) {}),
      accept: jest.fn(),
      reject: jest.fn(),
    } as unknown as jest.Mocked<ProfileInvitationRepository>;

    userRepository = {
      findById: jest.fn(),
    } as unknown as jest.Mocked<UserRepository>;

    cache = {
      del: jest.fn(),
    } as unknown as jest.Mocked<Cache>;

    usecase = new ProfileInvitationUsecase(
      invitationRepository as unknown as jest.Mocked<ProfileInvitationRepository>,
      userRepository as unknown as jest.Mocked<UserRepository>,
      cache,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('invitations', () => {
    it('should return invitations for a user', async () => {
      const user = { id: 1, email: 'test@example.com' } as User;
      const invitations: InvitationWithEnterprise[] = [
        {
          id: '1',
          email: 'test@example.com',
          name: 'Test Enterprise',
          token: 'sample-token',
          status: InvitationStatus.pending,
          enterpriseId: 'enterprise-1',
          createdAt: new Date(),
          updatedAt: null,
          acceptedAt: null,
          rejectedAt: null,
          enterprise: {
            id: 'enterprise-1',
            name: 'Test Enterprise',
            createdAt: new Date(),
            updatedAt: null,
            slug: 'test-enterprise',
            description: 'A test enterprise',
            ownerId: 1,
          },
        },
      ];

      userRepository.findById.mockResolvedValue(Promise.resolve(user));
      invitationRepository.findAll.mockResolvedValue(Promise.resolve(invitations));

      const result = await usecase.invitations(user.id);

      expect(userRepository.findById).toHaveBeenCalledWith(user.id);
      expect(invitationRepository.findAll).toHaveBeenCalledWith(user.email);
      expect(result).toEqual(invitations);
    });
  });

  describe('accept', () => {
    it('should throw NotFoundException if invitation is not found', async () => {
      userRepository.findById.mockResolvedValue({ id: 1, email: 'test@example.com' } as User);
      invitationRepository.findById.mockResolvedValue(null);

      await expect(usecase.accept(1, 'invitation-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw HttpException if invitation is not pending', async () => {
      userRepository.findById.mockResolvedValue({ id: 1, email: 'test@example.com' } as User);
      invitationRepository.findById.mockResolvedValue({
        status: InvitationStatus.accepted,
      } as Invitation);

      await expect(usecase.accept(1, 'invitation-id')).rejects.toThrow(HttpException);
    });

    it('should throw NotFoundException if invitation email does not match user email', async () => {
      userRepository.findById.mockResolvedValue({ id: 1, email: 'test@example.com' } as User);
      invitationRepository.findById.mockResolvedValue({
        email: 'other@example.com',
        status: InvitationStatus.pending,
      } as Invitation);

      await expect(usecase.accept(1, 'invitation-id')).rejects.toThrow(NotFoundException);
    });

    it('should accept the invitation and clear cache', async () => {
      const user = { id: 1, email: 'test@example.com' } as User;
      const invitation = {
        id: '1',
        email: 'test@example.com',
        status: InvitationStatus.pending,
      } as Invitation;

      userRepository.findById.mockResolvedValue(user);
      invitationRepository.findById.mockResolvedValue(invitation);

      await usecase.accept(user.id, invitation.id);

      expect(invitationRepository.accept).toHaveBeenCalledWith(invitation, user.id);
      expect(cache.del).toHaveBeenCalledWith(`profile:${user.id}`);
    });
  });

  describe('reject', () => {
    it('should throw NotFoundException if invitation is not found', async () => {
      userRepository.findById.mockResolvedValue({ id: 1, email: 'test@example.com' } as User);
      invitationRepository.findById.mockResolvedValue(null);

      await expect(usecase.reject(1, 'invitation-id')).rejects.toThrow(NotFoundException);
    });

    it('should throw HttpException if invitation is not pending', async () => {
      userRepository.findById.mockResolvedValue({ id: 1, email: 'test@example.com' } as User);
      invitationRepository.findById.mockResolvedValue({
        status: InvitationStatus.accepted,
      } as Invitation);

      await expect(usecase.reject(1, 'invitation-id')).rejects.toThrow(HttpException);
    });

    it('should throw NotFoundException if invitation email does not match user email', async () => {
      userRepository.findById.mockResolvedValue({ id: 1, email: 'test@example.com' } as User);
      invitationRepository.findById.mockResolvedValue({
        email: 'other@example.com',
        status: InvitationStatus.pending,
      } as Invitation);

      await expect(usecase.reject(1, 'invitation-id')).rejects.toThrow(NotFoundException);
    });

    it('should reject the invitation', async () => {
      const user = { id: 1, email: 'test@example.com' } as User;
      const invitation = {
        id: '1',
        email: 'test@example.com',
        status: InvitationStatus.pending,
      } as Invitation;

      userRepository.findById.mockResolvedValue(user);
      invitationRepository.findById.mockResolvedValue(invitation);

      await usecase.reject(user.id, invitation.id);

      expect(invitationRepository.reject).toHaveBeenCalledWith(invitation);
    });
  });

  describe('user', () => {
    it('should throw NotFoundException if user is not found', async () => {
      userRepository.findById.mockResolvedValue(null);

      await expect(usecase.user(1)).rejects.toThrow(NotFoundException);
    });

    it('should return the user if found', async () => {
      const user = { id: 1, email: 'test@example.com' } as User;

      userRepository.findById.mockResolvedValue(user);

      const result = await usecase.user(user.id);

      expect(result).toEqual(user);
    });
  });
});
