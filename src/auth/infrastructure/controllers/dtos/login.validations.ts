import { z } from 'zod';
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';
import { type LoginDto } from '@auth/application/usecases/dtos/login.dto';

@Injectable()
export class LoginValidation implements PipeTransform<LoginDto> {
  schema: ZodSchema<LoginDto>;

  constructor() {
    this.schema = this.schemaFactory();
  }

  async transform(value: LoginDto): Promise<LoginDto> {
    const result = await this.schema.safeParseAsync(value);
    if (!result.success) {
      const message = result.error.issues;
      throw new BadRequestException(message);
    }

    return result.data;
  }

  private schemaFactory() {
    return z.object({
      email: z.string().email('Invalid email format'),
      password: z.string().min(1, 'Password is required'),
    });
  }
}
