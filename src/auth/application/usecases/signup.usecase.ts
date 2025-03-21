import { Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PG_USER_REPOSITORY } from '@auth/infrastructure/database/user.repository';
import { type UserRepositoryPort } from '@auth/domain/repositories/user.repository.d';
import { type SignupUserDto } from './dtos/signupuser.dto';
import { EncryptionService } from '@auth/application/services/encryption.service';

@Injectable()
export class SignupUsecase {
  constructor(
    @Inject(PG_USER_REPOSITORY)
    private authRepository: UserRepositoryPort,
    private encryptionService: EncryptionService,
  ) {}

  async execute(userInfo: SignupUserDto): Promise<User> {
    const { email, name, password } = userInfo;

    const hashedPassword = await this.encryptionService.hashPassword(
      String(password),
    );

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
