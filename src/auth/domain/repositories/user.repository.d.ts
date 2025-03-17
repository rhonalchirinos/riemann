import { Prisma, User } from '@prisma/client';

/**
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
  update(user: User): Promise<User>;

  // /**
  //  *
  //  */
  // delete(user: User): void;

  /**
   *
   */
  getById(id: number): Promise<User | null>;

  // /**
  //  *
  //  */
  // getUsers(): Promise<User[]>;

  /**
   *
   */
  findByEmail(email: string): Promise<User | null>;

  /**
   *
   */
  exitsEmail(email: string): Promise<boolean>;
}
