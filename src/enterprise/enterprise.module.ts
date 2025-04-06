import { Module, Scope } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { EnterpriseListUseCase } from './application/enterprise.list.usecase';
import {
  EnterpriseRepository,
  PG_ENTERPRISE_REPOSITORY,
} from './infrastructure/databases/entreprise.repository';
import { EnterpriseCreateUseCase } from './application/enterprise.create.usecase';

import { EnterpriseDeleteUseCase } from './application/enterprise.delete.usecase';
import { EnterpriseShowUseCase } from './application/enterprise.show.usecase';
import { EnterpriseUpdateUseCase } from './application/enterprise.update.usecase';
import { type EnterpriseRepositoryPort } from './domain/enterprise.repository';
import {
  InvitationRepository,
  PG_INVITATION_REPOSITORY,
} from './infrastructure/databases/invitation.repository';
import { InvitationsController } from './infrastructure/controllers/invitations.controller';
import { InvitationController } from './infrastructure/controllers/invitation.controller';
import { InvitationListUseCase } from './application/invitation.list.usecase';
import { InvitationDeleteUseCase } from './application/invitation.delete.usecase';
import { InvitationInviteUseCase } from './application/invitation.invite.usecase';
import { type InvitationRepositoryPort } from './domain/invitation.repository';
import { EnterpriseInterceptor } from './infrastructure/interceptor/enterprise.interceptor';
import { Cache, CACHE_MANAGER, CacheModule } from '@nestjs/cache-manager';
import { REQUEST } from '@nestjs/core';
import { type AuthRequest } from 'src/shared/dto/request';
import { EnterpriseController } from './infrastructure/controllers/enterprise.controller';
import { EnterprisesController } from './infrastructure/controllers/enterprises.controller';
import { MailerService } from '@nestjs-modules/mailer';

const controllers = [
  EnterpriseController,
  EnterprisesController,

  /**
   * invitations
   */
  InvitationsController,
  InvitationController,
];

const usecases = [
  EnterpriseListUseCase,
  EnterpriseCreateUseCase,
  EnterpriseDeleteUseCase,
  EnterpriseShowUseCase,
  EnterpriseUpdateUseCase,
].map((useCase) => ({
  provide: useCase,
  useFactory: (repository: EnterpriseRepositoryPort) => new useCase(repository),
  inject: [PG_ENTERPRISE_REPOSITORY],
}));

const usecasesInvitatios = [
  InvitationListUseCase,
  InvitationDeleteUseCase,
  //  InvitationInviteUseCase,
].map((useCase) => ({
  provide: useCase,
  useFactory: (repository: InvitationRepositoryPort) => new useCase(repository),
  inject: [PG_INVITATION_REPOSITORY],
}));

@Module({
  imports: [DatabaseModule, CacheModule.register({ ttl: 60, max: 1000 })],
  controllers: [...controllers],
  providers: [
    {
      provide: PG_ENTERPRISE_REPOSITORY,
      useClass: EnterpriseRepository,
    },
    {
      provide: PG_INVITATION_REPOSITORY,
      useClass: InvitationRepository,
    },

    /**
     * Validations
     */

    /*
     * USES CASES
     */
    ...usecases,
    ...usecasesInvitatios,
    {
      provide: InvitationInviteUseCase,
      useFactory: (repository: InvitationRepositoryPort, mail: MailerService) =>
        new InvitationInviteUseCase(repository, mail),
      inject: [PG_INVITATION_REPOSITORY, MailerService],
    },
    {
      provide: 'EnterpriseInterceptor',
      useFactory: (
        request: AuthRequest,
        cacheManager: Cache,
        repository: EnterpriseRepositoryPort,
      ) => {
        return new EnterpriseInterceptor(request, cacheManager, repository);
      },
      inject: [REQUEST, CACHE_MANAGER, PG_ENTERPRISE_REPOSITORY],
      scope: Scope.REQUEST,
    },
  ],
})
export class EnterpriseModule {}
