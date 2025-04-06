import { Injectable } from '@nestjs/common';
import { Enterprise, Invitation, InvitationStatus } from '@prisma/client';
import { randomBytes } from 'crypto';
import { InvitationDto } from './dtos/invitation.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { type InvitationRepositoryPort } from '../domain/invitation.repository';

@Injectable()
export class InvitationInviteUseCase {
  /**
   *
   */
  constructor(
    private repository: InvitationRepositoryPort,
    private mail: MailerService,
  ) {}

  /**
   *
   * @param enterpriseId
   * @returns
   */
  async execute(enterprise: Enterprise, invitationData: InvitationDto): Promise<Invitation | null> {
    const email = invitationData.email.toLocaleLowerCase().trim();
    const name = invitationData.name.trim();
    const invitation = await this.repository.findByEmail(enterprise.id, email);

    if (!invitation) {
      const token = this.generateToken(32);

      const newInvitation = await this.repository.invite({
        name,
        email,
        token,
        status: InvitationStatus.pending,
        enterprise: { connect: { id: enterprise.id } },
      });

      await this.sendInvitationEmail(newInvitation, enterprise);

      return newInvitation;
    }

    return invitation;
  }

  /**
   *
   */
  async sendInvitationEmail(invitation: Invitation, enterprise: Enterprise) {
    await this.mail.sendMail({
      to: invitation.email,
      subject: 'Welcome to Nice App! Invited to join our team',
      template: './enterprises/invitation',
      context: {
        name: enterprise.name,
        token: invitation.token,
      },
    });
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
