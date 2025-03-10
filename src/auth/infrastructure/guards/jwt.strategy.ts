import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { type AccessTokenRepositoryPort } from '@auth/domain/repositories/access.token.repository';
import { CACHE_ACCESS_TOKEN_REPOSITORY } from '@auth/infrastructure/database/cache.access.token.repository';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @Inject(CACHE_ACCESS_TOKEN_REPOSITORY)
    private accessTokenRepository: AccessTokenRepositoryPort,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'FynVfpT19fKeEvCS',
    });
  }

  async validate(payload: { sub: string }) {
    const accessToken = await this.accessTokenRepository.findById(payload.sub);

    if (!accessToken) {
      throw new UnauthorizedException();
    }

    return { id: accessToken.id, userId: accessToken.userId };
  }
}
