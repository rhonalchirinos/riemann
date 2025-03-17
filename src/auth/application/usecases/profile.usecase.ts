import { Inject, Injectable } from '@nestjs/common';
import { PG_USER_REPOSITORY } from '@auth/infrastructure/database/user.repository';
import { type UserRepositoryPort } from '@auth/domain/repositories/user.repository.d';

@Injectable()
export class ProfileUsecase {
  constructor(
    @Inject(PG_USER_REPOSITORY)
    private authRepository: UserRepositoryPort,
  ) {}

  async execute(userId: number): Promise<any> {
    const user = await this.authRepository.getById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }

  async executeUpdateProfile(userId: number, data: any): Promise<any> {
    const user = await this.authRepository.getById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    user.name = data.name;

    const userNew = await this.authRepository.update(user);

    return {
      id: userNew.id,
      email: userNew.email,
      name: userNew.name,
      createdAt: userNew.createdAt,
      updatedAt: userNew.updatedAt,
    };
  }
}
