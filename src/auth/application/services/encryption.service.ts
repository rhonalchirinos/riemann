import { Injectable } from '@nestjs/common';
import { verify, hash, argon2d } from 'argon2';

@Injectable()
export class EncryptionService {
  private readonly saltRounds: number = 5;
  // mejorar la seguridad de esto
  private readonly options = {
    memoryCost: 2 ** 8,
    type: argon2d,
  };

  /**
   *
   * @param password
   * @returns
   */
  async hashPassword(password: string): Promise<string> {
    // const salt = await genSalt(this.saltRounds);
    const hashedPassword = await hash(password, this.options);
    return hashedPassword;
  }

  /***
   *
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    console.log(password, hash);
    const hasEqual = await verify(hash, password);

    return hasEqual;
  }
}
