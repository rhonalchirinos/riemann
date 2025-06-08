import { Injectable } from '@nestjs/common';
import { TextCaptchaFactory } from './text-captcha.factory';
import { ChallengeType } from '@prisma/client';

@Injectable()
export class CaptchaFactory {
  factory(type = 'text') {
    switch (type) {
      case ChallengeType.alphanumeric:
        return new TextCaptchaFactory();
      default:
        throw new Error('Invalid captcha type');
    }
  }
}
