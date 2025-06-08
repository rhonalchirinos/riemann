import { CaptchaTemplate } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/configuration/database/prisma.service';
import { CaptchaTemplateRepository } from '../databases/captcha-template.repository';
import { Cache } from '@nestjs/cache-manager';

@Injectable()
export class CacheCaptchaTemplateRepository extends CaptchaTemplateRepository {
  constructor(
    prisma: PrismaService,
    private cache: Cache,
  ) {
    super(prisma);
  }

  async findByPublicKey(publicKey: string): Promise<CaptchaTemplate | null> {
    const cacheKey = `captchaTemplatePublic:${publicKey}`;

    const cachedTemplate = await this.cache.get<CaptchaTemplate>(cacheKey);

    if (cachedTemplate) {
      return cachedTemplate;
    }

    const template = await super.findByPublicKey(publicKey);

    if (template) {
      await this.cache.set(cacheKey, template, 1000 * 60 * 30);
    }

    return template;
  }

  async findByPrivateKey(privateKey: string): Promise<CaptchaTemplate | null> {
    const cacheKey = `captchaTemplatePrivate:${privateKey}`;

    const cachedTemplate = await this.cache.get<CaptchaTemplate>(cacheKey);

    if (cachedTemplate) {
      return cachedTemplate;
    }

    const template = await super.findByPrivateKey(privateKey);

    if (template) {
      await this.cache.set(cacheKey, template, 1000 * 60 * 30);
    }

    return template;
  }
}

export const CACHE_CAPTCHA_TEMPLATE_REPOSITORY = 'CACHE_CAPTCHA_TEMPLATE_REPOSITORY';
