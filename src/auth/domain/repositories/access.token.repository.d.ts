import { AccessToken, Prisma } from '@prisma/client';

/**
 * Interface for the user repository port.
 */
export interface AccessTokenRepositoryPort {
  /**
   *
   */
  create(value: Prisma.AccessTokenCreateInput): Promise<AccessToken>;

  /**
   *
   */
  findById(token: string): Promise<AccessToken | null>;
}
