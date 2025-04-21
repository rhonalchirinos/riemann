import { Cache } from '@nestjs/cache-manager';
import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { Enterprise, Invitation, InvitationStatus, User } from '@prisma/client';
import { type UserRepositoryPort } from 'src/auth/domain/repositories/user.repository';
import { type ProfileInvitationRepositoryPort } from 'src/profile/domain/rapositories/profile-invitation.repository';

@Injectable()
export class ProfileInvitationUsecase {
  constructor(
    private readonly invitationRepository: ProfileInvitationRepositoryPort,
    private readonly userRepository: UserRepositoryPort,
    private readonly cache: Cache,
  ) {}

  async invitations(userId: number): Promise<(Invitation & { enterprise: Enterprise })[]> {
    const user = await this.user(userId);
    const items = await this.invitationRepository.findAll(user.email);

    return items as (Invitation & { enterprise: Enterprise })[];
  }

  /**
   *
   * @param userId
   * @param invitationId
   */
  async accept(userId: number, invitationId: string): Promise<void> {
    const user = await this.user(userId);

    const invitation = await this.invitationRepository.findById(invitationId);

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.pending) {
      throw new HttpException('Invitation already ' + invitation.status, 422);
    }

    if (invitation.email !== user.email) {
      throw new NotFoundException('Invitation does not belongs you');
    }

    await this.invitationRepository.accept(invitation, user.id);
    await this.cache.del(`profile:${user.id}`);
  }

  /**
   *
   * @param userId
   * @param invitationId
   */
  async reject(userId: number, invitationId: string): Promise<void> {
    const user = await this.user(userId);

    const invitation = await this.invitationRepository.findById(invitationId);

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== InvitationStatus.pending) {
      throw new HttpException('Invitation already ' + invitation.status, 422);
    }

    if (invitation.email !== user.email) {
      throw new NotFoundException('Invitation does not belong to you');
    }

    await this.invitationRepository.reject(invitation);
  }

  /**
   *
   * @param userId
   * @returns
   */
  async user(userId: number): Promise<User> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
