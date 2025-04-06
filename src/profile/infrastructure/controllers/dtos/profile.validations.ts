import { z } from 'zod';
import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { ZodSchema } from 'zod';
import { type ProfileDto } from 'src/profile/application/usecases/dtos/profile.dto';

@Injectable()
export class ProfileValidation implements PipeTransform<ProfileDto> {
  schema: ZodSchema<ProfileDto>;

  constructor() {
    this.schema = this.signupUserSchemaFactory();
  }

  async transform(value: ProfileDto): Promise<ProfileDto> {
    const result = await this.schema.safeParseAsync(value);
    if (!result.success) {
      const message = result.error.issues;
      throw new BadRequestException(message);
    }

    return result.data;
  }

  private signupUserSchemaFactory() {
    return z.object({
      name: z.string().min(2, 'Name must be at least 2 chars').max(200),
    });
  }
}
