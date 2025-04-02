import { Injectable, NotFoundException } from '@nestjs/common';
import { type InvitationRepositoryPort } from '../domain/invitation.repository';
import { Enterprise } from '@prisma/client';

@Injectable()
export class InvitationDeleteUseCase {
  /**
   *
   */
  constructor(private repository: InvitationRepositoryPort) {}

  /**
   *
   * @param enterpriseId
   * @returns
   */
  async execute(enterprise: Enterprise, id: string): Promise<void> {
    const invitation = await this.repository.findById(enterprise.id, id);

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    await this.repository.delete(enterprise.id, id);
  }
}
