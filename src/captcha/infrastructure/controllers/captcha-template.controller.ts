import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/infrastructure/guards/jwt-auth.guard';

import { type AuthRequest } from 'src/shared/dto/request';
import { CaptchaTemplateUseCase } from 'src/captcha/application/captcha-template.usecase';
import { type CaptchaTemplateDto } from 'src/captcha/application/dtos/captcha.dto';
import { EnterpriseInterceptor } from 'src/enterprise/infrastructure/interceptor/enterprise.interceptor';

@Controller('enterprises/:enterpriseId/captchas')
@UseGuards(JwtAuthGuard)
@UseInterceptors(EnterpriseInterceptor)
export class CaptchaTemplateController {
  /**
   *
   */
  public constructor(private useCase: CaptchaTemplateUseCase) {}

  @Get()
  async all(@Request() request: AuthRequest): Promise<any> {
    const templates = await this.useCase.findAll(request.params.enterpriseId);

    return { data: templates };
  }

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

  @Get(':id')
  async show(@Request() request: AuthRequest, @Param('id') id: string): Promise<any> {
    const template = await this.useCase.findById({
      enterpriseId: request.params.enterpriseId,
      captchaTemplateId: id,
    });

    return { data: template };
  }
}
