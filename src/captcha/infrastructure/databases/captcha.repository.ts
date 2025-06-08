import { Captcha, CaptchaAttempt, Prisma } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/configuration/database/prisma.service';
import { CaptchaKey, CaptchaRepositoryPort } from 'src/captcha/domain/captcha.repository';

@Injectable()
export class CaptchaRepository implements CaptchaRepositoryPort {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(enterpriseId: string): Promise<Captcha[]> {
    return this.prisma.captcha.findMany({
      where: { enterpriseId },
    });
  }

  async findById(captchaKey: CaptchaKey): Promise<Captcha> {
    return this.prisma.captcha.findUniqueOrThrow({
      where: { id: captchaKey.captchaId, enterpriseId: captchaKey.enterpriseId },
    });
  }

  async create(value: Prisma.CaptchaCreateInput): Promise<Captcha> {
    return this.prisma.captcha.create({
      data: value,
    });
  }

  async update(captchaKey: CaptchaKey, data: Prisma.CaptchaUpdateInput): Promise<Captcha> {
    return this.prisma.captcha.update({
      where: { id: captchaKey.captchaId },
      data,
    });
  }

  async delete(captchaKey: CaptchaKey): Promise<void> {
    await this.prisma.captcha.delete({
      where: { id: captchaKey.captchaId },
    });
  }

  async createAttempt(data: Prisma.CaptchaAttemptCreateInput): Promise<CaptchaAttempt> {
    return this.prisma.captchaAttempt.create({
      data,
    });
  }
}

export const PG_CAPTCHA_REPOSITORY = 'PG_CAPTCHA_REPOSITORY';
