import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtVerifyStrategy extends PassportStrategy(Strategy, 'jwt-verify') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField('token'),
      secretOrKey: config.get<string>('jwt.secret'),
    });
  }

  /**
   *
   * @param payload
   * @returns
   */
  validate(payload): any {
    if (!payload?.sub) {
      throw new UnprocessableEntityException('Invalid');
    }

    return { sub: payload.sub };
  }
}
