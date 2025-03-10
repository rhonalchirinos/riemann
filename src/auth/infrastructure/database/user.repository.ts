import { Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { UserRepositoryPort } from 'src/auth/domain/repositories/user.repository';
import { PrismaService } from '@database/prisma.service';

@Injectable()
export class UserRepository implements UserRepositoryPort {
  /**
   *
   */
  constructor(private prisma: PrismaService) {}

  /**
   *
   * @param id
   *
   * @returns
   */
  async getById(id: number): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: id,
      },
    });

    return user;
  }

  /**
   *
   * @param email
   *
   * @returns
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: {
        email: email.trim().toLocaleLowerCase(),
      },
    });

    return user;
  }

  /**
   *
   * @param value
   *
   * @returns
   */
  async create(value: Prisma.UserCreateInput): Promise<User> {
    const user = await this.prisma.user.create({
      data: {
        email: value.email.toLocaleLowerCase(),
        name: value.name,
        password: value.password,
      },
    });

    return user;
  }

  /**
   *
   */
  async exitsEmail(email: string): Promise<boolean> {
    if (email === null || email === undefined || email.trim() === '') {
      return false;
    }

    const userExists = await this.prisma.user.count({
      where: {
        email: email.toLocaleLowerCase().trim(),
      },
    });

    return userExists > 0;
  }
}

export const PG_USER_REPOSITORY = 'PG_USER_REPOSITORY';
