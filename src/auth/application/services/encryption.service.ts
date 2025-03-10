import { HttpException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EncryptionService {
  private readonly saltRounds: number = 10;

  /**
   *
   * @param password
   * @returns
   */
  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);

    if (!hashedPassword) {
      throw new HttpException('Error hashing password', 500);
    }

    return hashedPassword as string;
  }

  /***
   *
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return (await bcrypt.compare(password, hash)) as boolean;
  }
}
