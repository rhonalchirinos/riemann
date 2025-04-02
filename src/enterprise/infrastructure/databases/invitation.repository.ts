import { Injectable } from '@nestjs/common';
import { Invitation, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { type InvitationRepositoryPort } from 'src/enterprise/domain/invitation.repository';

@Injectable()
export class InvitationRepository implements InvitationRepositoryPort {
  /**
   *
   */
  constructor(private prisma: PrismaService) {}

  /**
   *
   * @param ownerId
   * @returns
   */
  async findAll(enterpriseId: string): Promise<Invitation[]> {
    return await this.prisma.invitation.findMany({
      where: { enterpriseId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   *
   * @param enterpriseId
   * @param data
   * @returns
   */
  async invite(data: Prisma.InvitationCreateInput): Promise<Invitation> {
    const invitation = await this.prisma.invitation.create({ data });

    return invitation;
  }

  /**
   *
   * @param id
   */
  async delete(enterpriseId: string, id: string): Promise<void> {
    await this.prisma.invitation.delete({ where: { id, enterpriseId } });
  }

  /**
   *
   * @param code
   * @returns
   */
  async findById(enterpriseId: string, id: string): Promise<Invitation | null> {
    const where = { id };
    if (enterpriseId) {
      where['enterpriseId'] = enterpriseId;
    }

    return await this.prisma.invitation.findUnique({ where });
  }

  /**
   *
   */
  async findByEmail(
    enterpriseId: string,
    email: string,
  ): Promise<Invitation | null> {
    return await this.prisma.invitation.findFirst({
      where: { enterpriseId, email },
    });
  }
}

export const PG_INVITATION_REPOSITORY = 'PG_INVITATION_REPOSITORY';
