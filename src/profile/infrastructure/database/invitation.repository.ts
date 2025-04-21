import { Injectable } from '@nestjs/common';
import { Invitation, InvitationStatus } from '@prisma/client';
import { PrismaService } from 'src/configuration/database/prisma.service';
import { ProfileInvitationRepositoryPort } from 'src/profile/domain/rapositories/profile-invitation.repository';
import { type InvitationWithEnterprise } from 'src/profile/domain/invitation';

@Injectable()
export class ProfileInvitationRepository implements ProfileInvitationRepositoryPort {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<Invitation | null> {
    return this.prisma.invitation.findUnique({
      where: { id },
      include: { enterprise: true },
    });
  }

  async findAll(email: string): Promise<InvitationWithEnterprise[]> {
    return this.prisma.invitation.findMany({
      where: { email },
      include: { enterprise: true },
    });
  }

  async findByToken(email: string, token: string): Promise<Invitation | null> {
    return this.prisma.invitation.findFirst({
      where: { email, token },
      include: { enterprise: true },
    });
  }

  async accept(invitation: Invitation, userId: number): Promise<void> {
    await this.prisma.$transaction(async (prisma) => {
      await prisma.invitation.update({
        where: { id: invitation.id },
        data: {
          status: InvitationStatus.accepted,
        },
      });

      let employee = await prisma.employee.findFirst({
        where: {
          userId: userId,
          enterpriseId: invitation.enterpriseId,
        },
      });

      if (!employee) {
        employee = await prisma.employee.create({
          data: {
            userId: userId,
            enterpriseId: invitation.enterpriseId,
            position: 'employee',
          },
        });
      }
    });
  }

  async reject(invitation: Invitation): Promise<void> {
    await this.prisma.invitation.update({
      where: { id: invitation.id },
      data: {
        status: InvitationStatus.rejected,
      },
    });
  }
}

export const PG_PROFILE_INVITATION_REPOSITORY = 'PG_PROFILE_INVITATION_REPOSITORY';
