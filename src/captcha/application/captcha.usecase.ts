import { Injectable, NotFoundException } from '@nestjs/common';
import { type CaptchaTemplateRepositoryPort } from '../domain/captcha-template.repository';
import type { CaptchaKey, CaptchaRepositoryPort } from '../domain/captcha.repository';
import { Captcha, CaptchaTemplate, ChallengeType, Prisma } from '@prisma/client';
import { CaptchaFactory } from './factories/captcha.factory';

@Injectable()
export class CaptchaUseCase {
  public constructor(
    protected readonly captchaTemplateRepository: CaptchaTemplateRepositoryPort,
    protected readonly captchaRepository: CaptchaRepositoryPort,
    protected readonly captchaFactory: CaptchaFactory,
  ) {}

  public async create(template: CaptchaTemplate): Promise<{ captcha: Captcha; buffer: Buffer }> {
    const enterpriseId = template.enterpriseId as string;

    const factory = this.captchaFactory.factory(template.type).generate();
    const answer = factory.answer;
    const buffer = await factory.toBuffer();

    const value: Prisma.CaptchaCreateInput = {
      enterprise: { connect: { id: enterpriseId } },
      template: { connect: { id: template.id } },
      type: ChallengeType.alphanumeric,
      answer: answer,
    };

    const captcha = await this.captchaRepository.create(value);

    return { captcha, buffer };
  }

  public async findById(captchaKey: CaptchaKey): Promise<Captcha> {
    const captcha = await this.captchaRepository.findById(captchaKey);

    if (!captcha) {
      throw new NotFoundException('Captcha not found');
    }

    return captcha;
  }
}
