import { Enterprise, Invitation } from '@prisma/client';

export type InvitationWithEnterprise = Invitation & {
  enterprise: Enterprise;
};
