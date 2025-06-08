import { Injectable, NotFoundException } from '@nestjs/common';
import type {
  CaptchaTemplateRepositoryPort,
  CaptchaTemplatgeKey,
} from '../domain/captcha-template.repository';
import { CaptchaTemplate, ChallengeType } from '@prisma/client';
import { CaptchaTemplateValidation } from './dtos/validations/captcha-template.validation';
import { type CaptchaTemplateDto } from './dtos/captcha.dto';
import { generateString } from 'src/shared/random';

@Injectable()
export class CaptchaTemplateUseCase {
  public constructor(
    protected readonly captchaTemplateRepository: CaptchaTemplateRepositoryPort,
    protected readonly captchaTemplateValidation: CaptchaTemplateValidation,
  ) {}

  async create(enterpriseId: string, dto: CaptchaTemplateDto): Promise<CaptchaTemplate> {
    const values = await this.captchaTemplateValidation.transform(dto);

    const { publicKey, privateKey } = this.generateKeys();

    const input = {
      ...values,
      publicKey,
      privateKey,
      type: values.type as ChallengeType,
      enterprise: { connect: { id: enterpriseId } },
    };

    return await this.captchaTemplateRepository.create(input);
  }

  async update(key: CaptchaTemplatgeKey, dto: CaptchaTemplateDto): Promise<CaptchaTemplate> {
    const captchaTemplate = await this.captchaTemplateRepository.findById(key);

    if (!captchaTemplate) {
      throw new NotFoundException(`Captcha Template with id ${key.captchaTemplateId} not found`);
    }

    return await this.captchaTemplateRepository.update(key, this.changes(captchaTemplate, dto));
  }

  async findById(key: CaptchaTemplatgeKey): Promise<CaptchaTemplate> {
    const template = await this.captchaTemplateRepository.findById(key);

    if (!template) {
      throw new NotFoundException(`Captcha Template with id ${key.captchaTemplateId} not found`);
    }

    return template;
  }

  async delete(key: CaptchaTemplatgeKey): Promise<void> {
    const template = await this.captchaTemplateRepository.findById(key);

    if (!template) {
      throw new NotFoundException(`Captcha Template with id ${key.captchaTemplateId} not found`);
    }

    await this.captchaTemplateRepository.delete(key);
  }

  async findAll(enterpriseId: string): Promise<CaptchaTemplate[]> {
    const items = await this.captchaTemplateRepository.findAll(enterpriseId);

    return items;
  }

  private changes(captchaTemplate: CaptchaTemplate, values: CaptchaTemplateDto) {
    const data = {};

    if (captchaTemplate.name !== values.name) {
      data['name'] = values.name;
    }

    if (captchaTemplate.type !== values.type) {
      data['type'] = values.type;
    }

    if (captchaTemplate.isActive !== values.isActive) {
      data['isActive'] = values.isActive;
    }

    return data;
  }

  private generateKeys(): { publicKey: string; privateKey: string } {
    const publicKey = generateString(64);
    const privateKey = generateString(64);

    return { publicKey, privateKey };
  }
}
