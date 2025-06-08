import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { CaptchaService } from 'src/captcha/application/service/captcha.service';

@Injectable()
export class CaptchaTemplateInterceptor implements NestInterceptor {
  constructor(private readonly service: CaptchaService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();

    const token: string = request.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No token provided');
    }

    const template = await this.service.loadTemplateFromPublicKey(token);

    request.template = template;
    request.templateId = template.id;

    return next.handle();
  }
}
