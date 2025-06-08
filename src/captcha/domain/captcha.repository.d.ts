import { Captcha, CaptchaAttempt, Prisma } from '@prisma/client';

export type CaptchaKey = {
  enterpriseId: string;
  captchaId: string;
};

export interface CaptchaRepositoryPort {
  findAll(enterpriseId: string): Promise<Captcha[]>;

  create: (value: Prisma.CaptchaCreateInput) => Promise<Captcha>;

  findById: (captchaKey: CaptchaKey) => Promise<Captcha>;

  update: (captchaKey: CaptchaKey, data: Prisma.CaptchaUpdateInput) => Promise<Captcha>;

  delete: (captchaKey: CaptchaKey) => Promise<void>;

  createAttempt: (data: Prisma.CaptchaAttemptCreateInput) => Promise<CaptchaAttempt>;
}
