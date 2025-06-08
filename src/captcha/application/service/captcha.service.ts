import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CaptchaTemplateRepositoryPort } from 'src/captcha/domain/captcha-template.repository';

@Injectable()
export class CaptchaService {
  public constructor(protected readonly captchaTemplateRepository: CaptchaTemplateRepositoryPort) {}

  public async loadTemplateFromPublicKey(publicKey: string) {
    const template = await this.captchaTemplateRepository.findByPublicKey(publicKey);

    if (!template) {
      throw new Error('Captcha template not found');
    }

    if (!template.isActive) {
      throw new Error('Captcha template is not active');
    }

    return template;
  }

  public async loadTemplateFromPrivateKey(privateKey: string) {
    const template = await this.captchaTemplateRepository.findByPrivateKey(privateKey);

    if (!template) {
      throw new UnauthorizedException('Captcha template not found');
    }

    if (!template.isActive) {
      throw new UnauthorizedException('Captcha template is not active');
    }

    return template;
  }
}
