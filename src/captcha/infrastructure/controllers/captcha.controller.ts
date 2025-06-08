import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  Request,
  Res,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';

import { CaptchaRequest, type AuthRequest } from 'src/shared/dto/request';
import { CaptchaTemplateUseCase } from 'src/captcha/application/captcha-template.usecase';
import { type CaptchaTemplateDto } from 'src/captcha/application/dtos/captcha.dto';

import { CaptchaTemplateInterceptor } from '../intersectors/captcha-template.interceptor';
import { CaptchaUseCase } from 'src/captcha/application/captcha.usecase';
import sharp from 'sharp';

@Controller(':slug/captchas')
export class CaptchaController {
  /**
   *
   */
  public constructor(
    private useCase: CaptchaTemplateUseCase,
    private captchaUseCase: CaptchaUseCase,
  ) {}

  @Post()
  async create(@Request() request: AuthRequest, @Body() dto: CaptchaTemplateDto): Promise<any> {
    const template = await this.useCase.create(request.params.enterpriseId, dto);

    return { data: template };
  }

  @Delete(':id')
  async items(@Request() request: AuthRequest, @Param('id') id: string): Promise<any> {
    await this.useCase.delete({
      enterpriseId: request.params.enterpriseId,
      captchaTemplateId: id,
    });

    return;
  }

  @Get()
  @UseInterceptors(CaptchaTemplateInterceptor)
  async show(@Req() request: CaptchaRequest, @Res() res: Response): Promise<any> {
    const template = request.template;

    const { captcha, buffer } = await this.captchaUseCase.create(template);
    const optimizedBuffer = await sharp(buffer)
      .webp({ quality: 50 }) // Puedes ajustar la calidad
      .toBuffer();

    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Content-Length', Number(optimizedBuffer.length));
    res.setHeader('Captcha-Key', captcha.id);
    res.setHeader('Captcha-Type', template.type);
    res.setHeader('Cache-Control', 'no-cache');

    return res.end(optimizedBuffer);
  }
}
