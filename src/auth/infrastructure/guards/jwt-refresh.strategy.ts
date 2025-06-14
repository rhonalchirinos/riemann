import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { type AccessTokenRepositoryPort } from 'src/auth/domain/repositories/access-token.repository';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(
    private config: ConfigService,
    private accessTokenRepository: AccessTokenRepositoryPort,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.get<string>('jwt.secret'),
    });
  }

  async validate(payload: { sub: string }) {
    if (!payload.sub) {
      throw new UnauthorizedException();
    }
    const accessToken = await this.accessTokenRepository.findByRefreshToken(payload.sub);
    if (!accessToken) {
      throw new UnauthorizedException();
    }

    return { accessToken };
  }
}
