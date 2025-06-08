import { z } from 'zod';
import { PipeTransform, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ZodSchema } from 'zod';
import { ChallengeType } from '@prisma/client';
import { type CaptchaTemplateDto } from '../captcha.dto';

@Injectable()
export class CaptchaTemplateValidation implements PipeTransform<CaptchaTemplateDto> {
  schema: ZodSchema<CaptchaTemplateDto>;

  constructor() {
    this.schema = this.schemaFactory();
  }

  async transform(value: CaptchaTemplateDto): Promise<CaptchaTemplateDto> {
    const result = await this.schema.safeParseAsync(value);
    if (!result.success) {
      const message = result.error.issues;
      throw new UnprocessableEntityException(message);
    }

    return result.data;
  }

  private schemaFactory() {
    return z.object({
      name: z.string().min(1, 'Name is required'),
      type: z.nativeEnum(ChallengeType).refine((val) => val !== undefined, {
        message: 'Invalid challenge type',
      }),
      isActive: z.boolean().optional(),
    });
  }
}
