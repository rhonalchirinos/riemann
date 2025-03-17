import { AccessToken, Prisma } from '@prisma/client';

/**
 * Interface for the user repository port.
 */
export interface AccessTokenRepositoryPort {
  delete(accessToken: AccessToken): unknown;
  /**
   *
   */
  create(value: Prisma.AccessTokenCreateInput): Promise<AccessToken>;

  /**
   *
   */
  findById(token: string): Promise<AccessToken | null>;

  /**
   *
   */
  findByRefreshToken(refreshToken: string): Promise<AccessToken | null>;
}
