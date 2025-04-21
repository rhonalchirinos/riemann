import { Invitation, Prisma } from '@prisma/client';

export interface InvitationRepositoryPort {
  findAll(enterpriseId: string): Promise<Invitation[]>;

  invite(value: Prisma.InvitationCreateInput): Promise<Invitation>;

  delete(enterpriseId: string, id: string): Promise<void>;

  findById(enterpriseId: string, id: string): Promise<Invitation | null>;

  findByEmail(enterpriseId: string, email: string): Promise<Invitation | null>;
}
