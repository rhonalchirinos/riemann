import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CaptchaTemplateRepositoryPort } from '../domain/captcha-template.repository';
import { CaptchaKey, CaptchaRepositoryPort } from '../domain/captcha.repository';
import { Prisma } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { CaptchaUseCase } from './captcha.usecase';
import { CaptchaFactory } from './factories/captcha.factory';

@Injectable()
export class CaptchaValidateTemplateUseCase extends CaptchaUseCase {
  public constructor(
    protected readonly captchaTemplateRepository: CaptchaTemplateRepositoryPort,
    protected readonly captchaRepository: CaptchaRepositoryPort,
    protected jwtService: JwtService,
    protected readonly captchaFactory: CaptchaFactory,
  ) {
    super(captchaTemplateRepository, captchaRepository, captchaFactory);
  }

  public async validate(captchaKey: CaptchaKey, answer: string, options: any): Promise<string> {
    const captcha = await this.findById(captchaKey);
    this.validateCaptcha(captcha);

    const isSolved = captcha.answer === answer;
    const attemptValue: Prisma.CaptchaAttemptCreateInput = {
      captcha: { connect: { id: captcha.id } },
      answer: answer,
      attemptedAt: new Date(),
      userIdentifier: options.userAgent,
      ipAddress: options.ipAddress,
      isCorrect: isSolved,
    };

    await this.captchaRepository.update(captchaKey, {
      isSolved,
      attempts: captcha.attempts + 1,
    });

    const attempt = await this.captchaRepository.createAttempt(attemptValue);

    if (!isSolved) {
      throw new UnprocessableEntityException('Captcha answer is incorrect');
    }

    return await this.jwtService.signAsync({ attemptId: attempt.id }, { expiresIn: 60 * 5 });
  }

  private validateCaptcha(captcha: any) {
    if (captcha.isSolved) {
      throw new UnprocessableEntityException('Captcha already solved');
    }

    if (captcha.expiresAt < new Date()) {
      throw new UnprocessableEntityException('Captcha expired');
    }

    if (captcha.attempts >= 5) {
      throw new UnprocessableEntityException('Captcha max attempts reached');
    }
  }
}
