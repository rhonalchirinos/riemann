import { Employee, Prisma } from '@prisma/client';

export interface EmployeeRepositoryPort {
  create(value: Prisma.EmployeeCreateInput): Promise<Employee>;
}
