import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { type EnterpriseCreateDto } from 'src/enterprise/application/dtos/enterprise.create.dto';
import { type EnterpriseRepositoryPort } from 'src/enterprise/domain/enterprise.repository';
import { z, ZodSchema } from 'zod';
import { PG_ENTERPRISE_REPOSITORY } from '../../databases/entreprise.repository';
import { REQUEST } from '@nestjs/core';

@Injectable()
export class EnterpriseValidation {
  schema: ZodSchema<EnterpriseCreateDto>;

  constructor(
    @Inject(PG_ENTERPRISE_REPOSITORY)
    private enterpriseRepository: EnterpriseRepositoryPort,
    @Inject(REQUEST)
    private readonly request: Request & { params?: { id?: string } },
  ) {
    this.schema = this.schemaFactory();
  }

  async transform(value: EnterpriseCreateDto): Promise<EnterpriseCreateDto> {
    const result = await this.schema.safeParseAsync(value);
    if (!result.success) {
      const message = result.error.issues;
      throw new BadRequestException(message);
    }

    return result.data;
  }

  private schemaFactory() {
    return z
      .object({
        slug: z.string().min(3).max(50),
        name: z.string().max(80),
        description: z.string().max(300),
      })
      .superRefine(async (data, ctx) => {
        if (!ctx.path.length) {
          const id = this.request?.params?.id as string;

          const existingUser = await this.enterpriseRepository.existsSlug(
            data.slug,
            id,
          );

          if (existingUser) {
            ctx.addIssue({
              code: 'custom',
              message: 'Slug already in use',
              path: ['slug'],
            });
          }
        }
      });
  }
}
