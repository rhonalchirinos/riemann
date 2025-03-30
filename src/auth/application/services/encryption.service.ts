import { HttpException, Injectable } from '@nestjs/common';
import { hash, compare, genSalt } from 'bcryptjs';

@Injectable()
export class EncryptionService {
  private readonly saltRounds: number = 10;

  /**
   *
   * @param password
   * @returns
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(this.saltRounds);
    const hashedPassword = await hash(password, salt);

    if (!hashedPassword) {
      throw new HttpException('Error hashing password', 500);
    }

    return hashedPassword;
  }

  /***
   *
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return await compare(password, hash);
  }
}
