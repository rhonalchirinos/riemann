import { Prisma, User } from '@prisma/client';

/**
 *
 * Interface for the user repository port.
 */
export interface UserRepositoryPort {
  /**
   *
   */
  create(value: Prisma.UserCreateInput): Promise<User>;

  /**
   *
   */
  update(id: number, value: Prisma.UserUpdateInput): Promise<User>;

  // /**
  //  *
  //  */
  // delete(user: User): void;

  /**
   *
   */
  findById(id: number): Promise<User | null>;

  /**
   *
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   *
   */
  exitsEmail(email: string): Promise<boolean>;
}
