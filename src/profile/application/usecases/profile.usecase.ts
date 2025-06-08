import { Injectable } from '@nestjs/common';
import { Profile } from 'src/profile/domain/profile';
import { type ProfileRepositoryPort } from 'src/profile/domain/rapositories/profile.repository';

@Injectable()
export class ProfileUsecase {
  constructor(private profileRepository: ProfileRepositoryPort) {}

  async profile(userId: number): Promise<Profile> {
    const user = await this.loadProfile(userId);

    return user;
  }

  async updateProfile(userId: number, data: any): Promise<any> {
    const user = await this.profileRepository.update(userId, {
      name: data.name,
    });

    return user;
  }

  private async loadProfile(userId: number): Promise<Profile> {
    const user = await this.profileRepository.findById(userId);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
