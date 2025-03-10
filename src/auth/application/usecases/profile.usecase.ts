import { Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PG_USER_REPOSITORY } from '@auth/infrastructure/database/user.repository';
import { type UserRepositoryPort } from '@auth/domain/repositories/user.repository.d';

@Injectable()
export class ProfileUsecase {
  constructor(
    @Inject(PG_USER_REPOSITORY)
    private authRepository: UserRepositoryPort,
  ) {}

  async execute(userId: number): Promise<User> {
    const user = await this.authRepository.getById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
