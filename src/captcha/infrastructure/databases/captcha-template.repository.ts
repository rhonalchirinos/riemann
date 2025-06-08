import { CaptchaTemplate, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/configuration/database/prisma.service';
import {
  CaptchaTemplateRepositoryPort,
  CaptchaTemplatgeKey,
} from 'src/captcha/domain/captcha-template.repository';

@Injectable()
export class CaptchaTemplateRepository implements CaptchaTemplateRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async create(value: Prisma.CaptchaTemplateCreateInput): Promise<CaptchaTemplate> {
    return this.prisma.captchaTemplate.create({
      data: value,
    });
  }

  findByPublicKey(publicKey: string): Promise<CaptchaTemplate | null> {
    return this.prisma.captchaTemplate.findFirst({
      where: {
        publicKey,
      },
      include: {
        enterprise: true,
      },
    });
  }

  findByPrivateKey(privateKey: string): Promise<CaptchaTemplate | null> {
    return this.prisma.captchaTemplate.findFirst({
      where: {
        privateKey,
      },
      include: {
        enterprise: true,
      },
    });
  }

  async findById(key: CaptchaTemplatgeKey): Promise<CaptchaTemplate | null> {
    return this.prisma.captchaTemplate.findUnique({
      where: {
        enterpriseId: key.enterpriseId,
        id: key.captchaTemplateId,
      },
    });
  }

  async update(
    key: CaptchaTemplatgeKey,
    value: Prisma.CaptchaTemplateUpdateInput,
  ): Promise<CaptchaTemplate> {
    return this.prisma.captchaTemplate.update({
      where: {
        enterpriseId: key.enterpriseId,
        id: key.captchaTemplateId,
      },
      data: value,
    });
  }

  async delete(key: CaptchaTemplatgeKey): Promise<void> {
    await this.prisma.captchaTemplate.delete({
      where: {
        enterpriseId: key.enterpriseId,
        id: key.captchaTemplateId,
      },
    });
  }

  async findAll(enterpriseId: string): Promise<CaptchaTemplate[]> {
    return this.prisma.captchaTemplate.findMany({
      where: {
        enterpriseId,
      },
    });
  }
}

export const PG_CAPTCHA_TEMPLATE_REPOSITORY = 'PG_CAPTCHA_TEMPLATE_REPOSITORY';
