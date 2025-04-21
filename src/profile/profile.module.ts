import { Module } from '@nestjs/common';

import { EncryptionService } from '@auth/application/services/encryption.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

import { ProfileValidation } from './infrastructure/controllers/dtos/profile.validations';
import { ProfileController } from './infrastructure/controllers/profile.controller';
import {
  PG_PROFILE_INVITATION_REPOSITORY,
  ProfileInvitationRepository,
} from './infrastructure/database/invitation.repository';
import { ProfileInvitationUsecase } from './application/usecases/profile-invitations.usecase';
import { ProfileUsecase } from './application/usecases/profile.usecase';
import { AuthModule } from 'src/auth/auth.module';
import { ProfileInvitationRepositoryPort } from './domain/rapositories/profile-invitation.repository';
import { PG_USER_REPOSITORY } from 'src/auth/infrastructure/database/user.repository';
import { UserRepositoryPort } from 'src/auth/domain/repositories/user.repository';
import { InvitationController } from './infrastructure/controllers/invitation.controller';
import {
  CACHE_PROFILE_REPOSITORY,
  ProfileCacheRepository,
} from './infrastructure/cache/profile-cache.repository';
import {
  PG_PROFILE_REPOSITORY,
  ProfileRepository,
} from './infrastructure/database/profile.repository';
import { ProfileRepositoryPort } from './domain/rapositories/profile.repository';

@Module({
  imports: [AuthModule],
  controllers: [ProfileController, InvitationController],
  providers: [
    {
      provide: PG_PROFILE_INVITATION_REPOSITORY,
      useClass: ProfileInvitationRepository,
    },

    {
      provide: PG_PROFILE_REPOSITORY,
      useClass: ProfileRepository,
    },

    {
      provide: CACHE_PROFILE_REPOSITORY,
      useFactory: (repository: ProfileRepositoryPort, cache: Cache) =>
        new ProfileCacheRepository(repository, cache),
      inject: [PG_PROFILE_REPOSITORY, CACHE_MANAGER],
    },
    /**
     * Validations
     */
    ProfileValidation,

    /*
     * Configurations
     */
    EncryptionService,

    /*
     * USES CASES
     */
    {
      provide: ProfileInvitationUsecase,
      useFactory: (
        repository: ProfileInvitationRepositoryPort,
        userRepository: UserRepositoryPort,
        cache: Cache,
      ) => new ProfileInvitationUsecase(repository, userRepository, cache),
      inject: [PG_PROFILE_INVITATION_REPOSITORY, PG_USER_REPOSITORY, CACHE_MANAGER],
    },
    {
      provide: ProfileUsecase,
      useFactory: (repository: ProfileRepositoryPort) => new ProfileUsecase(repository),
      inject: [CACHE_PROFILE_REPOSITORY],
    },
  ],
})
export class ProfileModule {}
