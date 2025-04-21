import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ProfileRepositoryPort } from 'src/profile/domain/rapositories/profile.repository';
import { PrismaService } from 'src/configuration/database/prisma.service';
import { Profile } from 'src/profile/domain/profile';

@Injectable()
export class ProfileRepository implements ProfileRepositoryPort {
  private includeRelations = {
    employees: {
      include: {
        enterprise: true,
      },
    },
  };

  constructor(private prisma: PrismaService) {}

  async findById(id: number, include?: any): Promise<Profile | null> {
    include = Object.assign(this.includeRelations, include);

    const item = (await this.prisma.user.findUnique({ where: { id }, include })) as Profile;

    return item;
  }

  async update(id: number, value: Prisma.UserUpdateInput, include?: any): Promise<Profile> {
    include = Object.assign(this.includeRelations, include);

    const item = (await this.prisma.user.update({
      where: { id },
      data: value,
      include,
    })) as Profile;

    return item;
  }
}

export const PG_PROFILE_REPOSITORY = 'PG_PROFILE_REPOSITORY';
