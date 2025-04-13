import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';

@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema<any>) {}

  async transform(value: any): Promise<any> {
    const result = await this.schema.safeParseAsync(value);

    if (!result.success) {
      const message = result.error.errors[0].message;
      throw new BadRequestException(message);
    }

    return result.data;
  }
}
