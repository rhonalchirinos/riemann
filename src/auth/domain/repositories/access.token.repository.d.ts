import { AccessToken, Prisma } from '@prisma/client';

/**
 * Interface for the user repository port.
 */
export interface AccessTokenRepositoryPort {
  /**
   *
   * @param accessToken
   */
  delete(accessToken: AccessToken): Promise<void>;

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
