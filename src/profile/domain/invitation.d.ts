export type InvitationWithEnterprise = Prisma.InvitationGetPayload<{
  include: { enterprise: true };
}>;
