import { Injectable } from '@nestjs/common';
import { Prisma, Employee } from '@prisma/client';
import { PrismaService } from 'src/configuration/database/prisma.service';
import { EmployeeRepositoryPort } from 'src/enterprise/domain/employee.repository';

@Injectable()
export class EmployeeRepository implements EmployeeRepositoryPort {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.EmployeeCreateInput): Promise<Employee> {
    return this.prisma.employee.create({ data });
  }
}

export const PG_ENTERPRISE_EMPLOYEE_REPOSITORY = 'PG_ENTERPRISE_EMPLOYEE_REPOSITORY';
