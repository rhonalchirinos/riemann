import { z } from 'zod';
import type { UserRepositoryPort } from '@auth/domain/repositories/user.repository';
import {
  PipeTransform,
  Injectable,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { ZodSchema } from 'zod';
import { PG_USER_REPOSITORY } from '@auth/infrastructure/database/user.repository';
import { type SignupUserDto } from '@auth/application/usecases/dtos/signupuser.dto';

@Injectable()
export class SignupValidation implements PipeTransform<SignupUserDto> {
  schema: ZodSchema<SignupUserDto>;

  constructor(
    @Inject(PG_USER_REPOSITORY)
    private userRepository: UserRepositoryPort,
  ) {
    this.schema = this.signupUserSchemaFactory();
  }

  async transform(value: SignupUserDto): Promise<SignupUserDto> {
    const result = await this.schema.safeParseAsync(value);
    if (!result.success) {
      const message = result.error.issues;
      throw new BadRequestException(message);
    }

    return result.data;
  }

  private signupUserSchemaFactory() {
    return z
      .object({
        name: z.string().min(2, 'Name must be at least 2 chars').max(200),
        email: z.string().email('Invalid email address').max(180),
        password: z
          .string()
          .min(6, 'Password must be at least 6 chars')
          .max(20, 'Password must be at most 32 chars'),
      })
      .superRefine(async (data, ctx) => {
        if (!ctx.path.length) {
          const existingUser = await this.userRepository.exitsEmail(data.email);

          if (existingUser) {
            ctx.addIssue({
              code: 'custom',
              message: 'Email already in use',
              path: ['email'],
            });
          }
        }
      });
  }
}
