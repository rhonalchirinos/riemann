import { Injectable } from '@nestjs/common';
import { Invitation } from '@prisma/client';
import { type InvitationRepositoryPort } from '../domain/invitation.repository';

@Injectable()
export class InvitationListUseCase {
  /**
   *
   */
  constructor(private repository: InvitationRepositoryPort) {}

  /**
   *
   * @param enterpriseId
   * @returns
   */
  async execute(enterpriseId: string): Promise<Invitation[]> {
    const items = await this.repository.findAll(enterpriseId);

    return items;
  }
}
