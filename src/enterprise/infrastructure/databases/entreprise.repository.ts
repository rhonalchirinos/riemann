import { Injectable } from '@nestjs/common';
import { Employee, Enterprise, Prisma } from '@prisma/client';
import { PrismaService } from 'src/configuration/database/prisma.service';
import { type EnterpriseRepositoryPort } from 'src/enterprise/domain/enterprise.repository';

@Injectable()
export class EnterpriseRepository implements EnterpriseRepositoryPort {
  constructor(private prisma: PrismaService) {}

  /**
   *
   * @param ownerId
   * @returns
   */
  async findAll(ownerId: number): Promise<Enterprise[]> {
    return await this.prisma.enterprise.findMany({
      where: { ownerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   *
   * @param value
   * @returns
   */
  async create(value: Prisma.EnterpriseCreateInput): Promise<Enterprise> {
    return await this.prisma.$transaction(async (prisma: PrismaService) => {
      const enterprise = await prisma.enterprise.create({
        data: {
          id: value.id,
          name: value.name,
          slug: this.sanitizeSlug(value.slug),
          description: value.description,
          owner: value.owner,
          employees: {
            create: {
              user: value.owner,
              position: 'owner',
            },
          },
        },
      });

      return enterprise;
    });
  }

  /**
   *
   * @param id
   * @param value
   * @returns
   */
  async update(id: string, value: Prisma.EnterpriseUpdateInput): Promise<Enterprise> {
    const entreprise = await this.prisma.enterprise.update({
      where: { id },
      data: {
        id: value.id,
        name: value.name,
        slug: this.sanitizeSlug(value.slug as string),
        description: value.description,
      },
    });

    return entreprise;
  }

  /**
   *
   * @param id
   */
  async delete(id: string): Promise<void> {
    await this.prisma.enterprise.delete({ where: { id } });
  }

  /**
   *
   * @param code
   * @returns
   */
  async findById(
    id: string,
    options: { ownerId?: number } | null = null,
  ): Promise<Enterprise | null> {
    const where = { id };

    if (options) {
      where['ownerId'] = options.ownerId;
    }

    return await this.prisma.enterprise.findUnique({ where });
  }

  /**
   *
   * @param code
   * @returns
   */
  async findBySlug(slug: string): Promise<Enterprise | null> {
    return await this.prisma.enterprise.findUnique({ where: { slug } });
  }

  /**
   *
   */
  async existsSlug(slug: string, id: string): Promise<boolean> {
    if (slug === null || slug === undefined || slug.trim() === '') {
      return false;
    }

    const where = { slug: this.sanitizeSlug(slug) };

    if (id) {
      where['id'] = { not: id };
    }

    const exists = await this.prisma.enterprise.count({ where });

    return exists > 0;
  }

  /**
   *
   * @param enterpriseId
   * @param userId
   * @returns
   */
  async findEmployee(enterpriseId, userId): Promise<Employee | null> {
    const employee = await this.prisma.employee.findFirst({
      where: {
        enterpriseId,
        userId,
      },
    });

    return employee;
  }

  /**
   *
   * @param input
   * @returns
   */
  sanitizeSlug(input: string): string {
    return input
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  }
}

export const PG_ENTERPRISE_REPOSITORY = 'PG_ENTERPRISE_REPOSITORY';
