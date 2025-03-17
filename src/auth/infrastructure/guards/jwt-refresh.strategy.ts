import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { CACHE_ACCESS_TOKEN_REPOSITORY } from '../database/cache.access.token.repository';
import { type AccessTokenRepositoryPort } from 'src/auth/domain/repositories/access.token.repository';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
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
    if (!payload.sub) {
      throw new UnauthorizedException();
    }
    const accessToken = await this.accessTokenRepository.findByRefreshToken(
      payload.sub,
    );
    if (!accessToken) {
      throw new UnauthorizedException();
    }

    return { accessToken };
  }
}
