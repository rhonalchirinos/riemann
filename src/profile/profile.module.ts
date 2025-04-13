import { Module } from '@nestjs/common';

import { DatabaseModule } from 'src/database/database.module';
import { EncryptionService } from '@auth/application/services/encryption.service';
import { CacheModule } from '@nestjs/cache-manager';

import { ProfileValidation } from './infrastructure/controllers/dtos/profile.validations';
import { ProfileController } from './infrastructure/controllers/profile.controller';
import {
  PG_PROFILE_INVITATION_REPOSITORY,
  ProfileInvitationRepository,
} from './infrastructure/database/invitation.repository';
import { ProfileInvitationUsecase } from './application/usecases/profile-invitations.usecase';
import { ProfileUsecase } from './application/usecases/profile-usecase';
import { AuthModule } from 'src/auth/auth.module';
import { ProfileInvitationRepositoryPort } from './domain/rapositories/profile-invitation.repository';
import { PG_USER_REPOSITORY } from 'src/auth/infrastructure/database/user.repository';
import { UserRepositoryPort } from 'src/auth/domain/repositories/user.repository';
import { InvitationController } from './infrastructure/controllers/invitation.controller';

@Module({
  imports: [DatabaseModule, CacheModule.register({ ttl: 60, max: 1000 }), AuthModule],
  controllers: [ProfileController, InvitationController],
  providers: [
    {
      provide: PG_PROFILE_INVITATION_REPOSITORY,
      useClass: ProfileInvitationRepository,
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
      ) => new ProfileInvitationUsecase(repository, userRepository),
      inject: [PG_PROFILE_INVITATION_REPOSITORY, PG_USER_REPOSITORY],
    },
    {
      provide: ProfileUsecase,
      useFactory: (repository: UserRepositoryPort) => new ProfileUsecase(repository),
      inject: [PG_USER_REPOSITORY],
    },
  ],
})
export class ProfileModule {}
