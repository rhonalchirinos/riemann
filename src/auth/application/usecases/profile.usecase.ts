import { Inject, Injectable } from '@nestjs/common';
import { PG_USER_REPOSITORY } from '@auth/infrastructure/database/user.repository';
import { type UserRepositoryPort } from '@auth/domain/repositories/user.repository.d';
import { User } from '@prisma/client';

@Injectable()
export class ProfileUsecase {
  constructor(
    @Inject(PG_USER_REPOSITORY)
    private authRepository: UserRepositoryPort,
  ) {}

  async getUser(userId: number): Promise<User> {
    const user = await this.authRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  async execute(userId: number): Promise<any> {
    const user = await this.getUser(userId);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async executeUpdateProfile(userId: number, data: any): Promise<any> {
    const userNew = await this.authRepository.update(userId, {
      name: data.name,
    });

    return {
      id: userNew.id,
      email: userNew.email,
      name: userNew.name,
      createdAt: userNew.createdAt,
      updatedAt: userNew.updatedAt,
    };
  }
}
