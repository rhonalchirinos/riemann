import { Prisma } from '@prisma/client';

export type EnterpriseCreateDto = Pick<
  Prisma.EnterpriseCreateInput,
  'slug' | 'name' | 'description'
>;
