import { Injectable } from '@nestjs/common';
import { AccessToken, Prisma } from '@prisma/client';
import { PrismaService } from '@database/prisma.service';
import { AccessTokenRepositoryPort } from '@auth/domain/repositories/access.token.repository';

@Injectable()
export class AccessTokenRepository implements AccessTokenRepositoryPort {
  /**
   *
   */
  constructor(private prisma: PrismaService) {}

  /**
   *
   * @param token
   * @returns
   */
  async findById(id: string): Promise<AccessToken | null> {
    const tokenRecord = await this.prisma.accessToken.findUnique({
      where: {
        id: id,
      },
    });

    return tokenRecord;
  }

  /**
   *
   * @param value
   *
   * @returns
   */
  async create(value: Prisma.AccessTokenCreateInput): Promise<AccessToken> {
    const token = await this.prisma.accessToken.create({
      data: {
        id: value.id,
        expiresAt: value.expiresAt,
        user: value.user,
      },
    });

    return token;
  }
}

export const PG_ACCESS_TOKEN_REPOSITORY = 'PG_ACCESS_TOKEN_REPOSITORY';
