import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PG_USER_REPOSITORY } from '@auth/infrastructure/database/user.repository';
import { type UserRepositoryPort } from '@auth/domain/repositories/user.repository';
import { type AccessTokenRepositoryPort } from '@auth/domain/repositories/access.token.repository';
import { type LoginDto } from './dtos/login.dto';
import { EncryptionService } from '../services/encryption.service';
import { JwtService } from '@nestjs/jwt';
import { v4 } from 'uuid';
import { AccessTokenDto } from './dtos/access.token.dto';
import { DateTime } from 'luxon';
import { CACHE_ACCESS_TOKEN_REPOSITORY } from '@auth/infrastructure/database/cache.access.token.repository';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(PG_USER_REPOSITORY)
    private authRepository: UserRepositoryPort,
    @Inject(CACHE_ACCESS_TOKEN_REPOSITORY)
    private accessTokenRepositoryPort: AccessTokenRepositoryPort,
    private encryptionService: EncryptionService,
    private jwtService: JwtService,
  ) {}

  async execute({ email, password }: LoginDto): Promise<AccessTokenDto> {
    const expiresInSecods = 3600;

    if (!email || !password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.authRepository.findByEmail(
      email.toLocaleLowerCase(),
    );

    if (user) {
      const isPasswordValid = await this.encryptionService.comparePassword(
        password,
        user.password,
      );

      if (isPasswordValid) {
        const sub = v4();
        const token = await this.jwtService.signAsync(
          { sub },
          { expiresIn: expiresInSecods },
        );

        const expiresAt = DateTime.local().plus({ seconds: expiresInSecods });
        const refresh = 'gnerate in future';
        await this.accessTokenRepositoryPort.create({
          id: sub,
          expiresAt: expiresAt.toJSDate(),
          user: { connect: { id: user.id } },
        });

        return { refresh, token, expiresAt: expiresInSecods };
      }
    }

    throw new UnauthorizedException('Invalid credentials');
  }
}
