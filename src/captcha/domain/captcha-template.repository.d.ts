import { CaptchaTemplate, Prisma } from '@prisma/client';

export type CaptchaTemplatgeKey = {
  enterpriseId: string;
  captchaTemplateId: string;
};

export interface CaptchaTemplateRepositoryPort {
  create(value: Prisma.CaptchaTemplateCreateInput): Promise<CaptchaTemplate>;

  findById(key: CaptchaTemplatgeKey): Promise<CaptchaTemplate?>;

  findByPublicKey(publicKey: string): Promise<CaptchaTemplate | null>;

  findByPrivateKey(privateKey: string): Promise<CaptchaTemplate | null>;

  update(
    key: CaptchaTemplatgeKey,
    value: Prisma.CaptchaTemplateUpdateInput,
  ): Promise<CaptchaTemplate>;

  delete(captchaTemplateKey: CaptchaTemplatgeKey): Promise<void>;

  findAll(enterpriseId: string): Promise<CaptchaTemplate[]>;
}
