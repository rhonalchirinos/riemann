import { Invitation } from '@prisma/client';
import { type InvitationWithEnterprise } from '../invitation';

/**
 * Interface for the user repository port.
 */
export interface ProfileInvitationRepositoryPort {
  findAll(email: string): Promise<InvitationWithEnterprise[]>;

  findById(id: string): Promise<Invitation | null>;

  findByToken(email: string, token: string): Promise<Invitation | null>;

  accept(invitation: Invitation, userId: number): Promise<void>;

  reject(invitation: Invitation): Promise<void>;
}
