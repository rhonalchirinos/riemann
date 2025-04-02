import { Injectable } from '@nestjs/common';
import { Enterprise, Invitation, InvitationStatus } from '@prisma/client';
import { type InvitationRepositoryPort } from '../domain/invitation.repository';
import { randomBytes } from 'crypto';
import { InvitationDto } from './dtos/invitation.dto';

@Injectable()
export class InvitationInviteUseCase {
  /**
   *
   */
  constructor(private repository: InvitationRepositoryPort) {}

  /**
   *
   * @param enterpriseId
   * @returns
   */
  async execute(
    enterprise: Enterprise,
    invitationData: InvitationDto,
  ): Promise<Invitation | null> {
    const email = invitationData.email.toLocaleLowerCase().trim();
    const name = invitationData.name.trim();
    const invitation = await this.repository.findByEmail(enterprise.id, email);

    if (!invitation) {
      const token = this.generateToken(64);

      const newInvitation = await this.repository.invite({
        name,
        email,
        token,
        status: InvitationStatus.pending,
        enterprise: { connect: { id: enterprise.id } },
      });

      // send invitation by email

      return newInvitation;
    }

    return invitation;
  }

  /**
   *
   * @param length
   * @returns
   */
  generateToken(length: number = 32): string {
    return randomBytes(length).toString('hex');
  }
}
