import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { type UserRepositoryPort } from '@auth/domain/repositories/user.repository.d';
import { EncryptionService } from '@auth/application/services/encryption.service';

import { type SignupUserDto } from './dtos/signup-user.dto';

@Injectable()
export class SignupUsecase {
  constructor(
    private authRepository: UserRepositoryPort,
    private encryptionService: EncryptionService,
  ) {}

  async execute(userInfo: SignupUserDto): Promise<User> {
    const { email, name, password } = userInfo;

    const hashedPassword = await this.encryptionService.hashPassword(String(password));

    const user = await this.authRepository.create({
      email: String(email).toLocaleLowerCase(),
      name,
      password: hashedPassword,
    });

    // send welcome and verification email

    // this.email.sendemail ...

    return user;
  }
}
