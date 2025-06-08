import { Module } from '@nestjs/common';
import { CaptchaTemplateController } from './infrastructure/controllers/captcha-template.controller';
import { CaptchaController } from './infrastructure/controllers/captcha.controller';
import {
  CaptchaRepository,
  PG_CAPTCHA_REPOSITORY,
} from './infrastructure/databases/captcha.repository';
import {
  CaptchaTemplateRepository,
  PG_CAPTCHA_TEMPLATE_REPOSITORY,
} from './infrastructure/databases/captcha-template.repository';
import { CaptchaUseCase } from './application/captcha.usecase';
import { CaptchaTemplateUseCase } from './application/captcha-template.usecase';
import { CaptchaTemplateValidation } from './application/dtos/validations/captcha-template.validation';
import { EnterpriseModule } from 'src/enterprise/enterprise.module';
import { type CaptchaTemplateRepositoryPort } from 'src/captcha/domain/captcha-template.repository';
import {
  CACHE_CAPTCHA_TEMPLATE_REPOSITORY,
  CacheCaptchaTemplateRepository,
} from './infrastructure/cache/cache-captcha-template.repository';
import { CaptchaService } from './application/service/captcha.service';
import { CaptchaFactory } from './application/factories/captcha.factory';

const controllers = [CaptchaTemplateController, CaptchaController];

const usecases = [
  {
    provide: CaptchaUseCase,
    useFactory: (
      captcha: CaptchaRepository,
      template: CaptchaTemplateRepository,
      factory: CaptchaFactory,
    ) => new CaptchaUseCase(template, captcha, factory),
    inject: [PG_CAPTCHA_REPOSITORY, PG_CAPTCHA_TEMPLATE_REPOSITORY, CaptchaFactory],
  },
  {
    provide: CaptchaTemplateUseCase,
    useFactory: (template: CaptchaTemplateRepository, validation: CaptchaTemplateValidation) =>
      new CaptchaTemplateUseCase(template, validation),
    inject: [PG_CAPTCHA_TEMPLATE_REPOSITORY, CaptchaTemplateValidation],
  },
];

@Module({
  imports: [EnterpriseModule],
  controllers: [...controllers],
  providers: [
    {
      provide: PG_CAPTCHA_REPOSITORY,
      useClass: CaptchaRepository,
    },
    {
      provide: PG_CAPTCHA_TEMPLATE_REPOSITORY,
      useClass: CaptchaTemplateRepository,
    },
    {
      provide: CACHE_CAPTCHA_TEMPLATE_REPOSITORY,
      useClass: CacheCaptchaTemplateRepository,
    },
    CaptchaFactory,
    CaptchaTemplateValidation,
    {
      provide: CaptchaService,
      useFactory: (repository: CaptchaTemplateRepositoryPort) => new CaptchaService(repository),
      inject: [CACHE_CAPTCHA_TEMPLATE_REPOSITORY],
    },
    /*
     * USES CASES
     */
    ...usecases,
  ],
})
export class CaptchaModule {}
