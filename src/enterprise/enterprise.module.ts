import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { EnterpriseListUseCase } from './application/enterprise.list.usecase';
import {
  EnterpriseRepository,
  PG_ENTERPRISE_REPOSITORY,
} from './infrastructure/databases/entreprise.repository';
import { EnterpriseCreateUseCase } from './application/enterprise.create.usecase';

import { EnterpriseListController } from './infrastructure/controllers/enterprise.list.controller';
import { EnterpriseCreateController } from './infrastructure/controllers/enterprise.create.controller';
import { EnterpriseDeleteUseCase } from './application/enterprise.delete.usecase';
import { EnterpriseShowUseCase } from './application/enterprise.show.usecase';
import { EnterpriseUpdateUseCase } from './application/enterprise.update.usecase';
import { EnterpriseDeleteController } from './infrastructure/controllers/enterprise.delete.controller';
import { EnterpriseShowController } from './infrastructure/controllers/enterprise.show.controller';
import { EnterpriseUpdateController } from './infrastructure/controllers/enterprise.update.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [
    EnterpriseListController,
    EnterpriseCreateController,
    EnterpriseShowController,
    EnterpriseDeleteController,
    EnterpriseUpdateController,
  ],
  providers: [
    {
      provide: PG_ENTERPRISE_REPOSITORY,
      useClass: EnterpriseRepository,
    },

    /**
     * Validations
     */

    /*
     * USES CASES
     */
    EnterpriseListUseCase,
    EnterpriseCreateUseCase,
    EnterpriseDeleteUseCase,
    EnterpriseShowUseCase,
    EnterpriseUpdateUseCase,
  ],
})
export class EnterpriseModule {}
