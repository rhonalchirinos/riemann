import { Profile } from '../profile';

/**
 * Interface for the user repository port.
 */
export interface ProfileRepositoryPort {
  update(id: number, value: Prisma.UserUpdateInput, optional?: any): Promise<Profile>;
  findById(id: number, optional?: any): Promise<Profile | null>;
}
