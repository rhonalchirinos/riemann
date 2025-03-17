import { v4 } from 'uuid';
import { AccessTokenDto } from './dtos/access.token.dto';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenRepositoryPort } from 'src/auth/domain/repositories/access.token.repository';
import { DateTime } from 'luxon';
import { User } from '@prisma/client';

export abstract class AccessTokenGenerateUseCase {
  constructor(
    protected accessTokenRepository: AccessTokenRepositoryPort,
    protected jwtService: JwtService,
  ) {}

  private async generateJWT(
    sub: string,
    expiresInSecods: number,
  ): Promise<string> {
    return await this.jwtService.signAsync(
      { sub },
      { expiresIn: expiresInSecods },
    );
  }

  protected async generateAccessToken(user: User): Promise<AccessTokenDto> {
    const expiresInSecods = 3600;

    const sub = v4();
    const token = await this.generateJWT(sub, expiresInSecods);
    const expiresAt = DateTime.local().plus({ seconds: expiresInSecods });

    const refreshToken = v4();
    const refresh = await this.generateJWT(refreshToken, expiresInSecods * 3);
    await this.accessTokenRepository.create({
      id: sub,
      refreshToken: refreshToken,
      expiresAt: expiresAt.toJSDate(),
      user: { connect: { id: user.id } },
    });

    return { token, refresh, expiresAt: expiresInSecods };
  }
}
