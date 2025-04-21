import { Employee, Enterprise, User } from '@prisma/client';

export type Profile = User & {
  employees?: (Employee & { enterprise: Enterprise })[];
};
