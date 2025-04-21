import { Injectable } from '@nestjs/common';
import { AccessToken, Prisma } from '@prisma/client';
import { PrismaService } from 'src/configuration/database/prisma.service';
import { AccessTokenRepositoryPort } from 'src/auth/domain/repositories/access-token.repository';

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
   * @param refreshToken
   * @returns
   */
  async findByRefreshToken(refreshToken: string): Promise<AccessToken | null> {
    const tokenRecord = await this.prisma.accessToken.findUnique({
      where: {
        refreshToken: refreshToken,
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
        refreshToken: value.refreshToken,
        expiresAt: value.expiresAt,
        user: value.user,
      },
    });

    return token;
  }

  /**
   *
   * @param accessToken
   */
  async delete(accessToken: AccessToken): Promise<void> {
    await this.prisma.accessToken.delete({
      where: {
        id: accessToken.id,
      },
    });
  }
}

export const PG_ACCESS_TOKEN_REPOSITORY = 'PG_ACCESS_TOKEN_REPOSITORY';
