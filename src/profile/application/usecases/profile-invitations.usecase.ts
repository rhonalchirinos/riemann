import { HttpException, Injectable, NotFoundException } from '@nestjs/common';
import { InvitationStatus, User } from '@prisma/client';
import { type UserRepositoryPort } from 'src/auth/domain/repositories/user.repository';
import { type ProfileInvitationRepositoryPort } from 'src/profile/domain/rapositories/profile-invitation.repository';

@Injectable()
export class ProfileInvitationUsecase {
  constructor(
    private readonly invitationRepository: ProfileInvitationRepositoryPort,
    private readonly userRepository: UserRepositoryPort,
  ) {}

  async invitations(userId: number): Promise<any> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const items = await this.invitationRepository.findAll(user.email);

    return items.map((item) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      token: item.token,
      status: item.status,
      enterprise: {
        slug: item.enterprise.slug,
        name: item.enterprise.name,
        description: item.enterprise.description,
      },
    }));
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

    await this.invitationRepository.accept(invitation);

    await this.invitationRepository.addEmployee(invitation.enterpriseId, user.id);
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
      throw new NotFoundException('Invitation does not belongs you');
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
